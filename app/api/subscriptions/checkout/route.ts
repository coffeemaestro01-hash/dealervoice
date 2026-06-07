import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import {
  createRazorpaySubscription,
  createRazorpayOrder,
  RAZORPAY_PLANS,
  RAZORPAY_ENABLED,
  planAmountPaise,
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

  if (!RAZORPAY_ENABLED) {
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

  const planKey = `${plan}_${interval.toUpperCase()}` as keyof typeof RAZORPAY_PLANS;
  const planId = RAZORPAY_PLANS[planKey];
  const keyId = process.env.RAZORPAY_KEY_ID;
  const prefill = {
    name: session.user.name ?? undefined,
    email: session.user.email ?? undefined,
  };

  // Recurring subscription when Razorpay plan IDs are configured
  if (planId) {
    const subscription = await createRazorpaySubscription({
      planId,
      customerEmail: session.user.email!,
      customerName: session.user.name!,
      dealershipId,
    });

    await prisma.dealerSubscription.upsert({
      where: { dealershipId },
      create: {
        dealershipId,
        plan: "FREE",
        status: "TRIALING",
        stripeSubscriptionId: subscription.id,
      },
      update: {
        stripeSubscriptionId: subscription.id,
        status: "TRIALING",
      },
    });

    return NextResponse.json({
      mode: "subscription",
      subscriptionId: subscription.id,
      keyId,
      plan,
      interval,
      prefill,
    });
  }

  // Fallback: one-time order checkout (works without pre-created Razorpay plans)
  const amount = planAmountPaise(plan, interval);
  const receipt = `dv_${dealershipId.slice(-8)}_${crypto.randomBytes(4).toString("hex")}`;
  const order = await createRazorpayOrder(amount, "INR", receipt);

  return NextResponse.json({
    mode: "order",
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
    plan,
    interval,
    dealershipId,
    prefill,
  });
}
