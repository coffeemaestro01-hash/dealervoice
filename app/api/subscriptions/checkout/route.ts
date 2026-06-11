import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { createStripeCheckoutSession, STRIPE_ENABLED } from "@/lib/payment";
import { z } from "zod";

const schema = z.object({
  dealershipId: z.string().cuid(),
  plan: z.enum(["PRO", "ENTERPRISE"]),
  interval: z.enum(["monthly", "annual"]).default("monthly"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!STRIPE_ENABLED) {
    return NextResponse.json({ error: "Payments not yet configured. Please contact support." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 422 });

  const { dealershipId, plan, interval } = parsed.data;

  const staff = await prisma.dealerStaff.findFirst({
    where: { dealershipId, userId: session.user.id, isActive: true },
    include: { dealership: { include: { subscription: true } } },
  });

  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dealervoice.io";
  const billingUrl = `${appUrl}/dashboard/dealer/billing`;

  try {
    const checkoutSession = await createStripeCheckoutSession({
      dealershipId,
      plan,
      interval,
      customerEmail: session.user.email!,
      customerName: session.user.name ?? undefined,
      stripeCustomerId: staff.dealership.subscription?.stripeCustomerId,
      successUrl: `${billingUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${billingUrl}?canceled=1`,
    });

    await prisma.dealerSubscription.upsert({
      where: { dealershipId },
      create: {
        dealershipId,
        plan: "FREE",
        status: "TRIALING",
      },
      update: {
        status: "TRIALING",
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      plan,
      interval,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    console.error("Stripe checkout failed:", message);
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 });
  }
}
