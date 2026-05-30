import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import {
  createRazorpaySubscription,
  RAZORPAY_PLANS,
  RAZORPAY_ENABLED,
} from "@/lib/payment";
import { z } from "zod";

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

  if (!planId) {
    return NextResponse.json({ error: "Plan not configured yet. Payments coming soon." }, { status: 503 });
  }

  const subscription = await createRazorpaySubscription({
    planId,
    customerEmail: session.user.email!,
    customerName: session.user.name!,
    dealershipId,
  });

  // Store subscription ID
  await prisma.dealerSubscription.upsert({
    where: { dealershipId },
    create: {
      dealershipId,
      plan: plan as any,
      status: "ACTIVE",
      stripeSubscriptionId: subscription.id, // reusing field for Razorpay sub ID
    },
    update: {
      stripeSubscriptionId: subscription.id,
    },
  });

  return NextResponse.json({
    subscriptionId: subscription.id,
    keyId: process.env.RAZORPAY_KEY_ID,
    plan,
    interval,
  });
}
