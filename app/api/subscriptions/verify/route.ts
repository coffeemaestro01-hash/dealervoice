import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpaySubscriptionSignature,
} from "@/lib/payment";
import { planFeatures, periodEnd } from "@/lib/subscription";
import { z } from "zod";

const schema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("order"),
    dealershipId: z.string().cuid(),
    plan: z.enum(["PRO", "ENTERPRISE"]),
    interval: z.enum(["monthly", "annual"]),
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
  }),
  z.object({
    mode: z.literal("subscription"),
    dealershipId: z.string().cuid(),
    plan: z.enum(["PRO", "ENTERPRISE"]),
    interval: z.enum(["monthly", "annual"]),
    razorpay_payment_id: z.string(),
    razorpay_subscription_id: z.string(),
    razorpay_signature: z.string(),
  }),
]);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 422 });

  const data = parsed.data;

  const staff = await prisma.dealerStaff.findFirst({
    where: { dealershipId: data.dealershipId, userId: session.user.id, isActive: true },
  });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (data.mode === "order") {
    const valid = verifyRazorpayPaymentSignature({
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
      signature: data.razorpay_signature,
    });
    if (!valid) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  } else {
    const valid = verifyRazorpaySubscriptionSignature({
      paymentId: data.razorpay_payment_id,
      subscriptionId: data.razorpay_subscription_id,
      signature: data.razorpay_signature,
    });
    if (!valid) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const features = planFeatures(data.plan);
  const now = new Date();
  const end = periodEnd(data.interval, now);

  const [sub] = await prisma.$transaction([
    prisma.dealerSubscription.upsert({
      where: { dealershipId: data.dealershipId },
      create: {
        dealershipId: data.dealershipId,
        plan: data.plan,
        status: "ACTIVE",
        stripeSubscriptionId: data.mode === "subscription" ? data.razorpay_subscription_id : null,
        currentPeriodStart: now,
        currentPeriodEnd: end,
        ...features,
      },
      update: {
        plan: data.plan,
        status: "ACTIVE",
        stripeSubscriptionId: data.mode === "subscription" ? data.razorpay_subscription_id : undefined,
        currentPeriodStart: now,
        currentPeriodEnd: end,
        canceledAt: null,
        ...features,
      },
    }),
    prisma.dealership.update({
      where: { id: data.dealershipId },
      data: { isPremiumClaimed: true },
    }),
  ]);

  return NextResponse.json({ success: true, subscription: { plan: sub.plan, status: sub.status } });
}
