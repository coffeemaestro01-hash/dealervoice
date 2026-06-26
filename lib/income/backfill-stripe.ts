import type Stripe from "stripe";
import { getStripe } from "@/lib/payment";
import prisma from "@/lib/db";
import { recordSubscriptionPayment } from "@/lib/income/record-subscription-payment";
import type { SubscriptionPlan } from "@prisma/client";

function planFromStripe(raw?: string | null): SubscriptionPlan {
  if (raw === "ENTERPRISE") return "ENTERPRISE";
  if (raw === "PRO_PLUS") return "PRO_PLUS";
  if (raw === "PRO") return "PRO";
  return "PRO";
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
  const legacy = (invoice as { subscription?: string | Stripe.Subscription | null }).subscription;
  if (legacy) {
    return typeof legacy === "string" ? legacy : legacy.id;
  }
  return null;
}

/** Sync paid Stripe subscription invoices into the confirmed income ledger. */
export async function backfillStripeSubscriptionIncome(limit = 50) {
  if (!process.env.STRIPE_SECRET_KEY) return { recorded: 0, skipped: 0 };

  const stripe = getStripe();
  const invoices = await stripe.invoices.list({ status: "paid", limit });

  let recorded = 0;
  let skipped = 0;

  for (const inv of invoices.data) {
    if (!inv.id || (inv.amount_paid ?? 0) <= 0) {
      skipped++;
      continue;
    }

    const subId = invoiceSubscriptionId(inv);
    if (!subId) {
      skipped++;
      continue;
    }

    const sub = await prisma.dealerSubscription.findFirst({
      where: { stripeSubscriptionId: subId },
      select: {
        dealershipId: true,
        plan: true,
        dealership: { select: { country: { select: { code: true } } } },
      },
    });

    const dealershipId = sub?.dealershipId ?? inv.metadata?.dealershipId;
    if (!dealershipId) {
      skipped++;
      continue;
    }

    const plan = sub?.plan ?? planFromStripe(inv.metadata?.plan);
    const result = await recordSubscriptionPayment({
      dealershipId,
      plan,
      amountMinor: inv.amount_paid ?? 0,
      currency: inv.currency?.toUpperCase() ?? "USD",
      countryCode: sub?.dealership.country?.code,
      externalRef: inv.id,
      description: `Stripe invoice — ${plan}`,
    });

    if (result) recorded++;
    else skipped++;
  }

  return { recorded, skipped };
}
