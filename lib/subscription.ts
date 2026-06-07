import type { SubscriptionPlan } from "@prisma/client";

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
