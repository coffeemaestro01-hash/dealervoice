import type { SubscriptionPlan } from "@prisma/client";
import prisma from "@/lib/db";
import { recordIncome } from "@/lib/income/ledger";
import { recordDealerInvoice } from "@/lib/billing/record-invoice";
import { ENTERPRISE_LINKED_LOCATIONS, PLAN_SERVICE_AREA_LIMITS } from "@/lib/subscription/plan-limits";

export type PlanFeatureSet = {
  maxLocations: number;
  maxServiceAreas: number;
  maxLinkedDealerships: number;
  competitorMonitoring: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  priorityDirectoryPlacement: boolean;
  ceoResearchInterviews: boolean;
  topLeadProspect: boolean;
};

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatureSet> = {
  FREE: {
    maxLocations: 1,
    maxServiceAreas: PLAN_SERVICE_AREA_LIMITS.FREE,
    maxLinkedDealerships: 0,
    competitorMonitoring: false,
    apiAccess: false,
    whiteLabel: false,
    priorityDirectoryPlacement: false,
    ceoResearchInterviews: false,
    topLeadProspect: false,
  },
  PRO: {
    maxLocations: 1,
    maxServiceAreas: PLAN_SERVICE_AREA_LIMITS.PRO,
    maxLinkedDealerships: 0,
    competitorMonitoring: true,
    apiAccess: false,
    whiteLabel: false,
    priorityDirectoryPlacement: false,
    ceoResearchInterviews: false,
    topLeadProspect: false,
  },
  PRO_PLUS: {
    maxLocations: 1,
    maxServiceAreas: PLAN_SERVICE_AREA_LIMITS.PRO_PLUS,
    maxLinkedDealerships: 0,
    competitorMonitoring: true,
    apiAccess: false,
    whiteLabel: false,
    priorityDirectoryPlacement: false,
    ceoResearchInterviews: false,
    topLeadProspect: false,
  },
  ENTERPRISE: {
    maxLocations: ENTERPRISE_LINKED_LOCATIONS,
    maxServiceAreas: PLAN_SERVICE_AREA_LIMITS.ENTERPRISE,
    maxLinkedDealerships: ENTERPRISE_LINKED_LOCATIONS,
    competitorMonitoring: true,
    apiAccess: true,
    whiteLabel: true,
    priorityDirectoryPlacement: true,
    ceoResearchInterviews: true,
    topLeadProspect: true,
  },
};

export function planFeatures(plan: SubscriptionPlan) {
  return PLAN_FEATURES[plan];
}

export function periodEnd(interval: "monthly" | "semiannual" | "annual", from = new Date()) {
  const end = new Date(from);
  if (interval === "annual") end.setFullYear(end.getFullYear() + 1);
  else if (interval === "semiannual") end.setMonth(end.getMonth() + 6);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

export async function activatePaidSubscription(params: {
  dealershipId: string;
  plan: SubscriptionPlan;
  interval: "monthly" | "semiannual" | "annual";
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
    await recordDealerInvoice({
      dealershipId: params.dealershipId,
      subscriptionId: sub.id,
      stripeInvoiceId: params.paymentId,
      type: "SUBSCRIPTION",
      description: `DealerVoice ${params.plan} subscription`,
      amount: params.amountPaise,
      currency,
      status: "paid",
      invoiceDate: now,
      paidAt: now,
    });
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
