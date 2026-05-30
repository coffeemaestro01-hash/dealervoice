import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/payment";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyRazorpayWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload: any };
  try { event = JSON.parse(body); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    switch (event.event) {
      case "subscription.charged": {
        const sub = event.payload.subscription?.entity;
        const payment = event.payload.payment?.entity;
        if (!sub || !payment) break;

        const dealershipId = sub.notes?.dealershipId;
        if (!dealershipId) break;

        await prisma.dealerSubscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: "ACTIVE",
            currentPeriodStart: new Date(sub.current_start * 1000),
            currentPeriodEnd: new Date(sub.current_end * 1000),
          },
        });

        // Record invoice
        const dbSub = await prisma.dealerSubscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (dbSub) {
          await prisma.invoice.create({
            data: {
              subscriptionId: dbSub.id,
              stripeInvoiceId: payment.id,
              amount: payment.amount,
              currency: payment.currency?.toUpperCase() ?? "INR",
              status: "paid",
              invoiceDate: new Date(payment.created_at * 1000),
              paidAt: new Date(payment.created_at * 1000),
            },
          });
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        const sub = event.payload.subscription?.entity;
        if (!sub) break;
        await prisma.dealerSubscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELED", plan: "FREE", canceledAt: new Date() },
        });
        break;
      }

      case "subscription.halted": {
        const sub = event.payload.subscription?.entity;
        if (!sub) break;
        await prisma.dealerSubscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "PAST_DUE" },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Razorpay webhook error:", err);
  }

  return NextResponse.json({ received: true });
}
