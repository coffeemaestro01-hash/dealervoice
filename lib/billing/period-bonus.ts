import prisma from "@/lib/db";
import { planFeatures } from "@/lib/subscription";
import type { BillingPeriodBonusType, SubscriptionPlan } from "@prisma/client";
import type Stripe from "stripe";

export type PaidBillingInterval = "monthly" | "semiannual" | "annual";

export const BILLING_BONUS_RULES: Record<
  PaidBillingInterval,
  { bonusType: BillingPeriodBonusType; bonusDays: number; maxRedemptions: number }
> = {
  annual: { bonusType: "ANNUAL", bonusDays: 365, maxRedemptions: 1 },
  semiannual: { bonusType: "SEMIANNUAL", bonusDays: 183, maxRedemptions: 1 },
  monthly: { bonusType: "MONTHLY", bonusDays: 15, maxRedemptions: 3 },
};

export function normalizePaidInterval(raw?: string | null): PaidBillingInterval {
  if (raw === "annual" || raw === "year") return "annual";
  if (raw === "semiannual" || raw === "6month" || raw === "6-month") return "semiannual";
  return "monthly";
}

export function detectPaidIntervalFromStripe(
  metadata: Stripe.Metadata | null | undefined,
  subscription?: Stripe.Subscription | null
): PaidBillingInterval {
  if (metadata?.interval) return normalizePaidInterval(metadata.interval);

  const price = subscription?.items.data[0]?.price;
  if (price?.recurring) {
    if (price.recurring.interval === "year") return "annual";
    if (price.recurring.interval === "month" && (price.recurring.interval_count ?? 1) >= 6) {
      return "semiannual";
    }
  }
  return "monthly";
}

function addDays(from: Date, days: number): Date {
  const end = new Date(from);
  end.setDate(end.getDate() + days);
  return end;
}

export async function countBillingBonusRedemptions(
  dealershipId: string,
  bonusType: BillingPeriodBonusType
): Promise<number> {
  return prisma.billingPeriodRedemption.count({
    where: { dealershipId, bonusType },
  });
}

export async function canRedeemBillingBonus(
  dealershipId: string,
  interval: PaidBillingInterval
): Promise<boolean> {
  const rule = BILLING_BONUS_RULES[interval];
  const count = await countBillingBonusRedemptions(dealershipId, rule.bonusType);
  return count < rule.maxRedemptions;
}

export interface ApplyBillingBonusParams {
  dealershipId: string;
  plan: SubscriptionPlan;
  interval: PaidBillingInterval;
  stripeInvoiceId?: string | null;
  stripeCheckoutSessionId?: string | null;
  periodEnd?: Date | null;
}

/** Apply billing-period bonus days once eligibility checks pass. Idempotent on stripe refs. */
export async function applyBillingPeriodBonus(params: ApplyBillingBonusParams) {
  const rule = BILLING_BONUS_RULES[params.interval];

  if (params.stripeInvoiceId) {
    const existing = await prisma.billingPeriodRedemption.findUnique({
      where: { stripeInvoiceId: params.stripeInvoiceId },
    });
    if (existing) return existing;
  }
  if (params.stripeCheckoutSessionId) {
    const existing = await prisma.billingPeriodRedemption.findUnique({
      where: { stripeCheckoutSessionId: params.stripeCheckoutSessionId },
    });
    if (existing) return existing;
  }

  const redeemed = await countBillingBonusRedemptions(params.dealershipId, rule.bonusType);
  if (redeemed >= rule.maxRedemptions) return null;

  const now = new Date();
  const baseEnd = params.periodEnd && params.periodEnd > now ? params.periodEnd : now;
  const accessUntil = addDays(baseEnd, rule.bonusDays);
  const features = planFeatures(params.plan);

  const sub = await prisma.dealerSubscription.findUnique({
    where: { dealershipId: params.dealershipId },
  });

  const redemption = await prisma.billingPeriodRedemption.create({
    data: {
      dealershipId: params.dealershipId,
      bonusType: rule.bonusType,
      plan: params.plan,
      billingInterval: params.interval,
      bonusDays: rule.bonusDays,
      accessUntil,
      stripeInvoiceId: params.stripeInvoiceId ?? undefined,
      stripeCheckoutSessionId: params.stripeCheckoutSessionId ?? undefined,
      subscriptionId: sub?.id,
    },
  });

  await prisma.dealerSubscription.upsert({
    where: { dealershipId: params.dealershipId },
    create: {
      dealershipId: params.dealershipId,
      plan: params.plan,
      status: "ACTIVE",
      bonusAccessUntil: accessUntil,
      currentPeriodEnd: accessUntil,
      ...features,
    },
    update: {
      plan: params.plan,
      status: "ACTIVE",
      bonusAccessUntil: accessUntil,
      currentPeriodEnd:
        sub?.currentPeriodEnd && sub.currentPeriodEnd > accessUntil
          ? sub.currentPeriodEnd
          : accessUntil,
      ...features,
    },
  });

  await prisma.dealership.update({
    where: { id: params.dealershipId },
    data: { isPremiumClaimed: true },
  });

  return redemption;
}

export function formatBillingBonusLabel(interval: PaidBillingInterval): string {
  switch (interval) {
    case "annual":
      return "Annual — 2 years of paid features (once per dealership)";
    case "semiannual":
      return "6-month — 1 year of paid features (once per dealership)";
    case "monthly":
      return "Monthly — 45 days of paid features (up to 3 redemptions)";
  }
}
