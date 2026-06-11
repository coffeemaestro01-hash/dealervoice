import { NextRequest, NextResponse } from "next/server";
import { verifyCashfreeWebhookSignature } from "@/lib/payment";
import { activatePaidSubscription } from "@/lib/subscription";
import prisma from "@/lib/db";
import type { SubscriptionPlan } from "@prisma/client";

interface CashfreeWebhookPayload {
  type?: string;
  event_time?: string;
  data?: {
    order?: {
      order_id?: string;
      order_amount?: number;
      order_currency?: string;
      order_tags?: Record<string, string>;
    };
    payment?: {
      cf_payment_id?: string;
      payment_amount?: number;
      payment_currency?: string;
      payment_status?: string;
    };
  };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-webhook-signature") ?? "";
  const timestamp = req.headers.get("x-webhook-timestamp") ?? "";

  if (!verifyCashfreeWebhookSignature(body, signature, timestamp)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: CashfreeWebhookPayload;
  try { event = JSON.parse(body); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let status = "success";
  let errorMsg: string | null = null;

  try {
    const eventType = event.type ?? "unknown";

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const order = event.data?.order;
      const payment = event.data?.payment;
      const orderId = order?.order_id;

      if (orderId) {
        const tags = order.order_tags ?? {};
        const dealershipId = tags.dealershipId;

        if (dealershipId) {
          const plan: SubscriptionPlan =
            tags.plan === "ENTERPRISE" || tags.plan === "PRO" ? tags.plan : "PRO";
          const interval: "monthly" | "annual" =
            tags.interval === "annual" ? "annual" : "monthly";

          const amountPaise = Math.round(
            (payment?.payment_amount ?? order.order_amount ?? 0) * 100
          );
          const currency = (payment?.payment_currency ?? order.order_currency ?? "INR").toUpperCase();
          const paymentId = payment?.cf_payment_id ?? orderId;

          await activatePaidSubscription({
            dealershipId,
            plan,
            interval,
            orderId,
            paymentId,
            amountPaise,
            currency,
            recordLedger: true,
          });
        }
      }
    }
  } catch (err) {
    status = "error";
    errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Cashfree webhook error:", err);
  }

  await prisma.webhookLog.create({
    data: {
      provider: "cashfree",
      event: event.type ?? "unknown",
      payload: event as object,
      status,
      error: errorMsg,
    },
  }).catch(() => {});

  return NextResponse.json({ received: true });
}
