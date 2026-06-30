import type { SubscriptionPlan } from "@prisma/client";
import prisma from "@/lib/db";
import { INBOX_SEAT_LIMITS, PAID_INBOX_PLANS } from "@/lib/inbox/constants";
import { resolveInboxBillingGroup } from "@/lib/inbox/enterprise-group";

async function readSubscription(dealershipId: string) {
  return prisma.dealerSubscription.findUnique({
    where: { dealershipId },
    select: {
      plan: true,
      status: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
    },
  });
}

function isActivePaid(plan: SubscriptionPlan, status: string | undefined): boolean {
  return status === "ACTIVE" && PAID_INBOX_PLANS.includes(plan);
}

export type InboxAccessResult = {
  allowed: boolean;
  reason?: "free_plan" | "lapsed" | "not_staff" | "no_dealership";
  plan: SubscriptionPlan;
  effectivePlan: SubscriptionPlan;
  seatLimit: number;
  seatsUsed: number;
  billingGroupPrimaryId: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

/** Effective plan for inbox features (handles Enterprise-linked rooftops). */
export async function getEffectiveInboxPlan(dealershipId: string): Promise<{
  plan: SubscriptionPlan;
  periodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  billingPrimaryId: string;
}> {
  const group = await resolveInboxBillingGroup(dealershipId);
  const ownSub = await readSubscription(dealershipId);
  const primarySub = await readSubscription(group.primaryDealershipId);

  const linked = await prisma.enterpriseAccountLink.findUnique({
    where: { linkedDealershipId: dealershipId },
  });

  if (linked && isActivePaid(primarySub?.plan ?? "FREE", primarySub?.status) && primarySub!.plan === "ENTERPRISE") {
    return {
      plan: "ENTERPRISE",
      periodEnd: primarySub!.currentPeriodEnd,
      cancelAtPeriodEnd: primarySub!.cancelAtPeriodEnd,
      billingPrimaryId: group.primaryDealershipId,
    };
  }

  if (isActivePaid(ownSub?.plan ?? "FREE", ownSub?.status)) {
    return {
      plan: ownSub!.plan,
      periodEnd: ownSub!.currentPeriodEnd,
      cancelAtPeriodEnd: ownSub!.cancelAtPeriodEnd,
      billingPrimaryId: dealershipId,
    };
  }

  return {
    plan: "FREE",
    periodEnd: ownSub?.currentPeriodEnd ?? primarySub?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: ownSub?.cancelAtPeriodEnd ?? primarySub?.cancelAtPeriodEnd ?? false,
    billingPrimaryId: group.primaryDealershipId,
  };
}

export async function countGroupStaff(memberDealershipIds: string[]): Promise<number> {
  return prisma.dealerStaff.count({
    where: { dealershipId: { in: memberDealershipIds }, isActive: true },
  });
}

export async function getInboxAccess(userId: string, dealershipId: string): Promise<InboxAccessResult> {
  const staff = await prisma.dealerStaff.findFirst({
    where: { userId, dealershipId, isActive: true },
  });
  if (!staff) {
    return {
      allowed: false,
      reason: "not_staff",
      plan: "FREE",
      effectivePlan: "FREE",
      seatLimit: 0,
      seatsUsed: 0,
      billingGroupPrimaryId: dealershipId,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  const group = await resolveInboxBillingGroup(dealershipId);
  const effective = await getEffectiveInboxPlan(dealershipId);
  const seatsUsed = await countGroupStaff(group.memberDealershipIds);
  const seatLimit = INBOX_SEAT_LIMITS[effective.plan];

  if (effective.plan === "FREE") {
    const ownSub = await readSubscription(dealershipId);
    const reason =
      ownSub && ownSub.plan !== "FREE" && ownSub.status !== "ACTIVE" ? "lapsed" : "free_plan";
    return {
      allowed: false,
      reason,
      plan: ownSub?.plan ?? "FREE",
      effectivePlan: "FREE",
      seatLimit: 0,
      seatsUsed,
      billingGroupPrimaryId: effective.billingPrimaryId,
      currentPeriodEnd: effective.periodEnd,
      cancelAtPeriodEnd: effective.cancelAtPeriodEnd,
    };
  }

  return {
    allowed: true,
    plan: effective.plan,
    effectivePlan: effective.plan,
    seatLimit,
    seatsUsed,
    billingGroupPrimaryId: effective.billingPrimaryId,
    currentPeriodEnd: effective.periodEnd,
    cancelAtPeriodEnd: effective.cancelAtPeriodEnd,
  };
}

export async function assertInboxAccess(userId: string, dealershipId: string) {
  const access = await getInboxAccess(userId, dealershipId);
  if (!access.allowed) {
    const err = new Error(access.reason ?? "forbidden");
    (err as Error & { code: string }).code = access.reason ?? "forbidden";
    throw err;
  }
  return access;
}
