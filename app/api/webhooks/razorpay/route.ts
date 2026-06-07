import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/payment";
import { planFeatures } from "@/lib/subscription";
import prisma from "@/lib/db";
import type { SubscriptionPlan } from "@prisma/client";

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

  let status = "success";
  let errorMsg: string | null = null;

  try {
    switch (event.event) {
      case "subscription.authenticated":
      case "subscription.activated": {
        const sub = event.payload.subscription?.entity;
        if (!sub) break;
        const dealershipId = sub.notes?.dealershipId;
        const planNote = sub.notes?.plan as string | undefined;
        const plan: SubscriptionPlan =
          planNote === "ENTERPRISE" || planNote === "PRO" ? planNote : "PRO";
        const features = planFeatures(plan);
        await prisma.dealerSubscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: "ACTIVE",
            plan,
            currentPeriodStart: sub.current_start ? new Date(sub.current_start * 1000) : new Date(),
            currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : undefined,
            ...features,
          },
        });
        if (dealershipId) {
          await prisma.dealerSubscription.updateMany({
            where: { dealershipId, stripeSubscriptionId: sub.id },
            data: { status: "ACTIVE", plan, ...features },
          });
        }
        break;
      }

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
    status = "error";
    errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Razorpay webhook error:", err);
  }

  await prisma.webhookLog.create({
    data: {
      provider: "razorpay",
      event: event.event ?? "unknown",
      payload: event as object,
      status,
      error: errorMsg,
    },
  }).catch(() => {});

  return NextResponse.json({ received: true });
}
