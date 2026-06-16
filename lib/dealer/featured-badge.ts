import type { SubscriptionPlan } from "@prisma/client";

export const PAID_PLANS = ["PRO", "PRO_PLUS", "ENTERPRISE"] as const;
export type PaidPlan = (typeof PAID_PLANS)[number];

export function isPaidPlan(plan?: string | null): plan is PaidPlan {
  return PAID_PLANS.includes(plan as PaidPlan);
}

export interface FeaturedBadgeDealerFields {
  status?: string;
  claimedAt?: Date | string | null;
  isPremiumClaimed?: boolean;
  featuredBadgeEnabled?: boolean;
  subscription?: { plan: string; status?: string } | null;
}

/** Returns the paid plan tier when the dealer earns a featured badge, else null. */
export function getFeaturedBadgePlan(dealer: FeaturedBadgeDealerFields): PaidPlan | null {
  if (dealer.featuredBadgeEnabled === false) return null;

  const sub = dealer.subscription;
  if (!sub || !isPaidPlan(sub.plan)) return null;
  if (sub.status && !["ACTIVE", "TRIALING"].includes(sub.status)) return null;

  const isClaimed =
    dealer.status === "CLAIMED" || dealer.isPremiumClaimed || !!dealer.claimedAt;
  if (!isClaimed) return null;

  return sub.plan;
}

export function planDisplayName(plan: SubscriptionPlan | PaidPlan | string): string {
  switch (plan) {
    case "PRO_PLUS":
      return "Pro+";
    case "PRO":
      return "Pro";
    case "ENTERPRISE":
      return "Enterprise";
    default:
      return plan;
  }
}
