import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import {
  createCashfreeOrder,
  CASHFREE_ENABLED,
  planAmountPaise,
  cashfreeMode,
} from "@/lib/payment";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  dealershipId: z.string().cuid(),
  plan: z.enum(["PRO", "ENTERPRISE"]),
  interval: z.enum(["monthly", "annual"]).default("monthly"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!CASHFREE_ENABLED) {
    return NextResponse.json({ error: "Payments not yet configured. Please contact support." }, { status: 503 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
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

  const amount = planAmountPaise(plan, interval);
  const orderId = `dv_${dealershipId.slice(-8)}_${crypto.randomBytes(4).toString("hex")}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dealervoice.io";

  try {
    const order = await createCashfreeOrder({
      orderId,
      amountPaise: amount,
      customerId: session.user.id,
      customerEmail: session.user.email!,
      customerName: session.user.name ?? undefined,
      customerPhone: "9999999999",
      dealershipId,
      plan,
      interval,
      orderNote: `DealerVoice ${plan} ${interval}`,
      returnUrl: `${appUrl}/dashboard/dealer/billing?order_id=${orderId}`,
    });

    await prisma.dealerSubscription.upsert({
      where: { dealershipId },
      create: {
        dealershipId,
        plan: "FREE",
        status: "TRIALING",
        stripeSubscriptionId: orderId,
      },
      update: {
        stripeSubscriptionId: orderId,
        status: "TRIALING",
      },
    });

    return NextResponse.json({
      paymentSessionId: order.payment_session_id,
      orderId: order.order_id,
      appId: process.env.NEXT_PUBLIC_CASHFREE_APP_ID,
      mode: cashfreeMode(),
      plan,
      interval,
      amount,
      currency: "INR",
      prefill: {
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    const statusCode = (err as { statusCode?: number })?.statusCode;
    console.error("Cashfree checkout failed:", message);
    return NextResponse.json(
      { error: "Failed to start checkout" },
      { status: statusCode === 401 ? 401 : 500 }
    );
  }
}
