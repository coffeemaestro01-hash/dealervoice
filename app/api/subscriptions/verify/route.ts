import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import {
  retrieveStripeCheckoutSession,
  parseStripePlanMetadata,
  stripeSubscriptionPeriod,
} from "@/lib/payment";
import { planFeatures } from "@/lib/subscription";
import { z } from "zod";
import type Stripe from "stripe";

const schema = z.object({
  dealershipId: z.string().cuid(),
  session_id: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 422 });

  const { dealershipId, session_id } = parsed.data;

  const staff = await prisma.dealerStaff.findFirst({
    where: { dealershipId, userId: session.user.id, isActive: true },
  });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const checkoutSession = await retrieveStripeCheckoutSession(session_id);

    if (checkoutSession.status !== "complete") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const meta = parseStripePlanMetadata(checkoutSession.metadata);
    if (meta.dealershipId && meta.dealershipId !== dealershipId) {
      return NextResponse.json({ error: "Session does not match dealership" }, { status: 400 });
    }

    const subscription =
      typeof checkoutSession.subscription === "string"
        ? null
        : (checkoutSession.subscription as Stripe.Subscription | null);

    const subscriptionId =
      typeof checkoutSession.subscription === "string"
        ? checkoutSession.subscription
        : subscription?.id;

    if (!subscriptionId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 });
    }

    const customerId =
      typeof checkoutSession.customer === "string"
        ? checkoutSession.customer
        : checkoutSession.customer?.id ?? null;

    const { plan, interval } = meta;
    const features = planFeatures(plan);
    const period = subscription
      ? stripeSubscriptionPeriod(subscription)
      : { start: new Date(), end: new Date() };

    const [sub] = await prisma.$transaction([
      prisma.dealerSubscription.upsert({
        where: { dealershipId },
        create: {
          dealershipId,
          plan,
          status: "ACTIVE",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          ...features,
        },
        update: {
          plan,
          status: "ACTIVE",
          stripeCustomerId: customerId ?? undefined,
          stripeSubscriptionId: subscriptionId,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          canceledAt: null,
          ...features,
        },
      }),
      prisma.dealership.update({
        where: { id: dealershipId },
        data: { isPremiumClaimed: true },
      }),
    ]);

    return NextResponse.json({ success: true, subscription: { plan: sub.plan, status: sub.status } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    console.error("Stripe verify failed:", message);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
