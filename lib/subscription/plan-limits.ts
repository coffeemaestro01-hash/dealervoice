import type { SubscriptionPlan } from "@prisma/client";

export const PLAN_SERVICE_AREA_LIMITS: Record<SubscriptionPlan, number> = {
  FREE: 5,
  PRO: 15,
  PRO_PLUS: 35,
  ENTERPRISE: 50,
};

export const ENTERPRISE_LINKED_LOCATIONS = 5;

export function maxServiceAreasForPlan(plan: SubscriptionPlan): number {
  return PLAN_SERVICE_AREA_LIMITS[plan] ?? PLAN_SERVICE_AREA_LIMITS.FREE;
}

export function hasEnterpriseDirectoryPriority(plan: SubscriptionPlan | null | undefined): boolean {
  return plan === "ENTERPRISE";
}
