import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import {
  fetchCashfreeOrder,
  isCashfreeOrderPaid,
  planAmountPaise,
} from "@/lib/payment";
import { activatePaidSubscription } from "@/lib/subscription";
import { z } from "zod";

const schema = z.object({
  dealershipId: z.string().cuid(),
  plan: z.enum(["PRO", "ENTERPRISE"]),
  interval: z.enum(["monthly", "annual"]),
  order_id: z.string(),
});

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

  try {
    const order = await fetchCashfreeOrder(data.order_id);
    if (!isCashfreeOrderPaid(order)) {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const tags = order.order_tags ?? {};
    if (tags.dealershipId && tags.dealershipId !== data.dealershipId) {
      return NextResponse.json({ error: "Order does not match dealership" }, { status: 400 });
    }

    const plan: "PRO" | "ENTERPRISE" =
      tags.plan === "ENTERPRISE" || tags.plan === "PRO" ? tags.plan : data.plan;
    const interval =
      tags.interval === "annual" || tags.interval === "monthly" ? tags.interval : data.interval;

    const expectedPaise = planAmountPaise(plan, interval);
    const paidPaise = Math.round(order.order_amount * 100);
    if (paidPaise < expectedPaise) {
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    const sub = await activatePaidSubscription({
      dealershipId: data.dealershipId,
      plan,
      interval,
      orderId: order.order_id,
      paymentId: order.cf_order_id ?? order.order_id,
      amountPaise: paidPaise,
      currency: order.order_currency,
      recordLedger: false,
    });

    return NextResponse.json({ success: true, subscription: { plan: sub.plan, status: sub.status } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    console.error("Cashfree verify failed:", message);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
