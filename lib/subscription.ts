import type { SubscriptionPlan } from "@prisma/client";
import prisma from "@/lib/db";
import { recordIncome } from "@/lib/income/ledger";

export const PLAN_FEATURES: Record<
  SubscriptionPlan,
  { maxLocations: number; competitorMonitoring: boolean; apiAccess: boolean; whiteLabel: boolean }
> = {
  FREE: { maxLocations: 1, competitorMonitoring: false, apiAccess: false, whiteLabel: false },
  PRO: { maxLocations: 5, competitorMonitoring: true, apiAccess: false, whiteLabel: false },
  ENTERPRISE: { maxLocations: 999, competitorMonitoring: true, apiAccess: true, whiteLabel: true },
};

export function planFeatures(plan: SubscriptionPlan) {
  return PLAN_FEATURES[plan];
}

export function periodEnd(interval: "monthly" | "annual", from = new Date()) {
  const end = new Date(from);
  if (interval === "annual") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

export async function activatePaidSubscription(params: {
  dealershipId: string;
  plan: SubscriptionPlan;
  interval: "monthly" | "annual";
  orderId: string;
  paymentId?: string;
  amountPaise: number;
  currency?: string;
  recordLedger?: boolean;
}) {
  const features = planFeatures(params.plan);
  const now = new Date();
  const end = periodEnd(params.interval, now);
  const currency = (params.currency ?? "USD").toUpperCase();

  const [sub] = await prisma.$transaction([
    prisma.dealerSubscription.upsert({
      where: { dealershipId: params.dealershipId },
      create: {
        dealershipId: params.dealershipId,
        plan: params.plan,
        status: "ACTIVE",
        stripeSubscriptionId: params.orderId,
        currentPeriodStart: now,
        currentPeriodEnd: end,
        ...features,
      },
      update: {
        plan: params.plan,
        status: "ACTIVE",
        stripeSubscriptionId: params.orderId,
        currentPeriodStart: now,
        currentPeriodEnd: end,
        canceledAt: null,
        ...features,
      },
    }),
    prisma.dealership.update({
      where: { id: params.dealershipId },
      data: { isPremiumClaimed: true },
    }),
  ]);

  if (params.paymentId) {
    const existing = await prisma.invoice.findUnique({
      where: { stripeInvoiceId: params.paymentId },
    });
    if (!existing) {
      await prisma.invoice.create({
        data: {
          subscriptionId: sub.id,
          stripeInvoiceId: params.paymentId,
          amount: params.amountPaise,
          currency,
          status: "paid",
          invoiceDate: now,
          paidAt: now,
        },
      });
    }
  }

  if (params.recordLedger && params.paymentId) {
    const dealer = await prisma.dealership.findUnique({
      where: { id: params.dealershipId },
      select: { country: { select: { code: true } } },
    });

    await recordIncome({
      source: "SUBSCRIPTION",
      status: "CONFIRMED",
      amountMinor: params.amountPaise,
      currency,
      countryCode: dealer?.country?.code,
      dealershipId: params.dealershipId,
      description: `Stripe subscription payment — ${params.plan}`,
      externalRef: params.paymentId,
    }).catch(() => {});
  }

  return sub;
}
