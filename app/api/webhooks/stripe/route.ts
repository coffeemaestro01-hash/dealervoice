import { NextRequest, NextResponse } from "next/server";
import {
  verifyStripeWebhookSignature,
  parseStripePlanMetadata,
  stripeSubscriptionPeriod,
  retrieveStripeSubscription,
} from "@/lib/payment";
import { incrementPromotionRedemption } from "@/lib/promotions";
import {
  applyBillingPeriodBonus,
  detectPaidIntervalFromStripe,
} from "@/lib/billing/period-bonus";
import { syncChicagoJackpotForDealership } from "@/lib/promotions/chicago-jackpot";
import { maybeSendSubscriptionWelcomeEmail } from "@/lib/subscription/welcome-email";
import { maybeSendAdminSubscriptionAlert } from "@/lib/subscription/admin-alert";
import { ensureDealerApiKey } from "@/lib/api/dealer-keys";
import { recordIncome } from "@/lib/income/ledger";
import { recordSubscriptionPayment } from "@/lib/income/record-subscription-payment";
import { sponsorshipUntil } from "@/lib/sponsorship/checkout";
import { planFeatures } from "@/lib/subscription";
import { recordDealerInvoice } from "@/lib/billing/record-invoice";
import { sendDealerInvoiceEmail } from "@/lib/billing/send-invoice-email";
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
    if (plan === "ENTERPRISE") {
      await ensureDealerApiKey(dealershipId).catch(() => {});
    }
  }

  if (recordLedger && status === "ACTIVE") {
    const amountCents = stripeSub.items.data[0]?.price?.unit_amount ?? 0;
    const currency = (stripeSub.items.data[0]?.price?.currency ?? "usd").toUpperCase();
    const dealer = await prisma.dealership.findUnique({
      where: { id: dealershipId },
      select: { country: { select: { code: true } } },
    });

    await recordSubscriptionPayment({
      dealershipId,
      plan,
      amountMinor: amountCents,
      currency,
      countryCode: dealer?.country?.code,
      externalRef: `sub_init_${stripeSub.id}`,
      description: `Stripe subscription activated — ${plan}`,
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
  if (!invoice.id) return;

  const metaType = invoice.metadata?.type;
  const metaDealershipId = invoice.metadata?.dealershipId;

  if (metaType === "lead_fee" && metaDealershipId) {
    const recorded = await recordDealerInvoice({
      dealershipId: metaDealershipId,
      stripeInvoiceId: invoice.id,
      type: "LEAD_FEE",
      description:
        invoice.lines?.data?.[0]?.description ??
        `Lead fee${invoice.metadata?.leadId ? ` — ${invoice.metadata.leadId}` : ""}`,
      amount: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      status: "paid",
      pdfUrl: invoice.invoice_pdf ?? null,
      invoiceDate: new Date((invoice.created ?? Date.now() / 1000) * 1000),
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date(),
    });
    await sendDealerInvoiceEmail(recorded.id).catch(() => {});
    return;
  }

  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const stripeSub = await retrieveStripeSubscription(subscriptionId);
  await syncSubscription(stripeSub, true);

  const sub = await prisma.dealerSubscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (!sub) return;

  const description =
    invoice.lines?.data?.[0]?.description ?? `DealerVoice ${sub.plan} subscription`;

  const recorded = await recordDealerInvoice({
    dealershipId: sub.dealershipId,
    subscriptionId: sub.id,
    stripeInvoiceId: invoice.id,
    type: "SUBSCRIPTION",
    description,
    amount: invoice.amount_paid,
    currency: invoice.currency.toUpperCase(),
    status: "paid",
    pdfUrl: invoice.invoice_pdf ?? null,
    invoiceDate: new Date((invoice.created ?? Date.now() / 1000) * 1000),
    paidAt: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000)
      : new Date(),
  });

  await sendDealerInvoiceEmail(recorded.id).catch(() => {});

  if (invoice.amount_paid && invoice.amount_paid > 0) {
    const dealer = await prisma.dealership.findUnique({
      where: { id: sub.dealershipId },
      select: { country: { select: { code: true } } },
    });
    await recordSubscriptionPayment({
      dealershipId: sub.dealershipId,
      plan: sub.plan,
      amountMinor: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      countryCode: dealer?.country?.code,
      externalRef: invoice.id,
      description: description,
    }).catch(() => {});

    const paidInterval = detectPaidIntervalFromStripe(stripeSub.metadata, stripeSub);
    await applyBillingPeriodBonus({
      dealershipId: sub.dealershipId,
      plan: sub.plan,
      interval: paidInterval,
      stripeInvoiceId: invoice.id,
      periodEnd: sub.currentPeriodEnd,
    }).catch(() => {});
  }
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

          const meta = parseStripePlanMetadata(stripeSub.metadata);
          if (meta.dealershipId) {
            await maybeSendSubscriptionWelcomeEmail(
              meta.dealershipId,
              meta.plan,
              meta.interval
            ).catch(() => {});

            const promoCode = session.metadata?.promotionCode;
            await maybeSendAdminSubscriptionAlert(
              meta.dealershipId,
              meta.plan,
              meta.interval,
              promoCode
            ).catch(() => {});

            if (session.amount_total && session.amount_total > 0) {
              await recordSubscriptionPayment({
                dealershipId: meta.dealershipId,
                plan: meta.plan,
                amountMinor: session.amount_total,
                currency: (session.currency ?? "usd").toUpperCase(),
                externalRef: session.id,
                description: `Stripe checkout — ${meta.plan}`,
              }).catch(() => {});
            }

            const paidInterval = detectPaidIntervalFromStripe(session.metadata, stripeSub);
            await applyBillingPeriodBonus({
              dealershipId: meta.dealershipId,
              plan: meta.plan,
              interval: paidInterval,
              stripeCheckoutSessionId: session.id,
              periodEnd: stripeSubscriptionPeriod(stripeSub).end,
            }).catch(() => {});
          }

          const promoCode = session.metadata?.promotionCode;
          if (promoCode) {
            await incrementPromotionRedemption(promoCode).catch(() => {});
          }
        } else if (session.mode === "payment" && session.metadata?.type === "sponsorship") {
          const dealershipId = session.metadata.dealershipId;
          const days = Number(session.metadata.days ?? 30);
          const sponsorLabel = session.metadata.sponsorLabel || null;
          const tier = session.metadata.tier ?? "city_30";

          if (dealershipId) {
            await prisma.dealership.update({
              where: { id: dealershipId },
              data: {
                isSponsored: true,
                sponsorLabel,
                sponsoredUntil: sponsorshipUntil(days),
                ...(tier === "homepage_30" ? { homepagePinOrder: 1 } : {}),
              },
            });

            await recordIncome({
              source: "SPONSORSHIP",
              status: "CONFIRMED",
              amountMinor: session.amount_total ?? 0,
              currency: (session.currency ?? "usd").toUpperCase(),
              dealershipId,
              description: `Sponsorship checkout — ${tier}`,
              externalRef: session.id,
            }).catch(() => {});

            const recorded = await recordDealerInvoice({
              dealershipId,
              stripeInvoiceId: session.id,
              type: "SPONSORSHIP",
              description: `Sponsorship — ${tier.replace(/_/g, " ")} (${days} days)`,
              amount: session.amount_total ?? 0,
              currency: (session.currency ?? "usd").toUpperCase(),
              status: "paid",
              invoiceDate: new Date(),
              paidAt: new Date(),
            });
            await sendDealerInvoiceEmail(recorded.id).catch(() => {});
          }
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
          const freeFeatures = planFeatures("FREE");
          await prisma.dealerSubscription.updateMany({
            where: { dealershipId, stripeSubscriptionId: stripeSub.id },
            data: {
              status: "CANCELED",
              canceledAt: new Date(),
              plan: "FREE",
              ...freeFeatures,
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
