import { NextRequest, NextResponse } from "next/server";
import {
  verifyStripeWebhookSignature,
  parseStripePlanMetadata,
  stripeSubscriptionPeriod,
  retrieveStripeSubscription,
} from "@/lib/payment";
import { planFeatures } from "@/lib/subscription";
import { recordIncome } from "@/lib/income/ledger";
import prisma from "@/lib/db";
import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import type Stripe from "stripe";

export const runtime = "nodejs";

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return status === "trialing" ? "TRIALING" : "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
      return "CANCELED";
    case "paused":
      return "PAUSED";
    default:
      return "ACTIVE";
  }
}

async function syncSubscription(
  stripeSub: Stripe.Subscription,
  recordLedger = false
) {
  const meta = parseStripePlanMetadata(stripeSub.metadata);
  const dealershipId = meta.dealershipId;
  if (!dealershipId) return;

  const plan: SubscriptionPlan = meta.plan;
  const features = planFeatures(plan);
  const period = stripeSubscriptionPeriod(stripeSub);
  const status = mapStripeStatus(stripeSub.status);

  const customerId =
    typeof stripeSub.customer === "string" ? stripeSub.customer : stripeSub.customer?.id;

  await prisma.dealerSubscription.upsert({
    where: { dealershipId },
    create: {
      dealershipId,
      plan,
      status,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: stripeSub.items.data[0]?.price?.id,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      canceledAt: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000) : null,
      ...features,
    },
    update: {
      plan,
      status,
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: stripeSub.items.data[0]?.price?.id,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      canceledAt: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000) : null,
      ...features,
    },
  });

  if (status === "ACTIVE") {
    await prisma.dealership.update({
      where: { id: dealershipId },
      data: { isPremiumClaimed: true },
    });
  }

  if (recordLedger && status === "ACTIVE") {
    const amountCents = stripeSub.items.data[0]?.price?.unit_amount ?? 0;
    const currency = (stripeSub.items.data[0]?.price?.currency ?? "usd").toUpperCase();
    const dealer = await prisma.dealership.findUnique({
      where: { id: dealershipId },
      select: { country: { select: { code: true } } },
    });

    await recordIncome({
      source: "SUBSCRIPTION",
      status: "CONFIRMED",
      amountMinor: amountCents,
      currency,
      countryCode: dealer?.country?.code,
      dealershipId,
      description: `Stripe subscription payment — ${plan}`,
      externalRef: stripeSub.id,
    }).catch(() => {});
  }
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parentSub = invoice.parent?.subscription_details?.subscription;
  if (parentSub) {
    return typeof parentSub === "string" ? parentSub : parentSub.id;
  }
  const lineSub = invoice.lines?.data?.[0]?.subscription;
  if (lineSub) {
    return typeof lineSub === "string" ? lineSub : lineSub.id;
  }
  return null;
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const stripeSub = await retrieveStripeSubscription(subscriptionId);
  await syncSubscription(stripeSub, true);

  const sub = await prisma.dealerSubscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (!sub || !invoice.id) return;

  const existing = await prisma.invoice.findUnique({
    where: { stripeInvoiceId: invoice.id },
  });
  if (existing) return;

  await prisma.invoice.create({
    data: {
      subscriptionId: sub.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      status: "paid",
      invoiceDate: new Date((invoice.created ?? Date.now() / 1000) * 1000),
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date(),
      pdfUrl: invoice.invoice_pdf ?? undefined,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  const event = verifyStripeWebhookSignature(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let status = "success";
  let errorMsg: string | null = null;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const stripeSub = await retrieveStripeSubscription(subId);
          await syncSubscription(stripeSub, true);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription;
        await syncSubscription(stripeSub);
        break;
      }
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const dealershipId = stripeSub.metadata?.dealershipId;
        if (dealershipId) {
          await prisma.dealerSubscription.updateMany({
            where: { dealershipId, stripeSubscriptionId: stripeSub.id },
            data: {
              status: "CANCELED",
              canceledAt: new Date(),
              plan: "FREE",
              maxLocations: 1,
              apiAccess: false,
              whiteLabel: false,
              competitorMonitoring: false,
            },
          });
        }
        break;
      }
      case "invoice.paid": {
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    status = "error";
    errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook error:", err);
  }

  await prisma.webhookLog
    .create({
      data: {
        provider: "stripe",
        event: event.type,
        payload: event.data.object as object,
        status,
        error: errorMsg,
      },
    })
    .catch(() => {});

  return NextResponse.json({ received: true });
}
