import prisma from "@/lib/db";
import { getRevenueStats } from "@/lib/admin/stats";
import { chicagolandCityWhere } from "@/lib/geo/chicagoland";
import { usStateWhere } from "@/lib/outreach/regions";
import {
  CHICAGO_GIFT_CARD,
  backfillChicagoGiftCards,
  countChicagoGiftCardsUsed,
} from "@/lib/reviews/gift-cards";
import type { AdminJobStatus, AdminJobType, Prisma } from "@prisma/client";

function chicagolandWhere() {
  return {
    OR: [usStateWhere("Illinois"), chicagolandCityWhere()],
  };
}

export async function startAdminJobRun(jobType: AdminJobType, summary: string, actorUserId?: string) {
  return prisma.adminJobRun.create({
    data: {
      jobType,
      status: "RUNNING",
      summary,
      actorUserId,
      startedAt: new Date(),
    },
  });
}

export async function finishAdminJobRun(
  id: string,
  opts: {
    status?: AdminJobStatus;
    payload?: Prisma.InputJsonValue;
    summary?: string;
    errorMessage?: string;
  }
) {
  return prisma.adminJobRun.update({
    where: { id },
    data: {
      status: opts.status ?? "SUCCESS",
      payload: opts.payload,
      summary: opts.summary,
      errorMessage: opts.errorMessage,
      finishedAt: new Date(),
    },
  });
}

export async function logAdminJobRun(opts: {
  jobType: AdminJobType;
  summary: string;
  payload?: Prisma.InputJsonValue;
  actorUserId?: string;
  status?: AdminJobStatus;
  errorMessage?: string;
}) {
  return prisma.adminJobRun.create({
    data: {
      jobType: opts.jobType,
      status: opts.status ?? "SUCCESS",
      summary: opts.summary,
      payload: opts.payload,
      actorUserId: opts.actorUserId,
      startedAt: new Date(),
      finishedAt: new Date(),
      errorMessage: opts.errorMessage,
    },
  });
}

export async function getBusinessCommandCenterData() {
  const [
    revenue,
    ilUnclaimed,
    ilDrip,
    ilClaimedFree,
    giftEligible,
    giftApproved,
    giftSent,
    giftDeclined,
    giftUsed,
    recentJobs,
    giftCards,
  ] = await Promise.all([
    getRevenueStats(),
    prisma.dealership.count({
      where: { deletedAt: null, claimedAt: null, AND: [chicagolandWhere()], email: { not: null } },
    }),
    prisma.dealership.count({
      where: {
        deletedAt: null,
        claimedAt: null,
        AND: [chicagolandWhere()],
        outreachStatus: "contacted",
        outreachDripActive: true,
      },
    }),
    prisma.dealership.count({
      where: {
        deletedAt: null,
        claimedAt: { not: null },
        AND: [chicagolandWhere()],
        OR: [{ subscription: null }, { subscription: { plan: "FREE" } }],
      },
    }),
    prisma.reviewGiftCard.count({ where: { status: "ELIGIBLE" } }),
    prisma.reviewGiftCard.count({ where: { status: "APPROVED" } }),
    prisma.reviewGiftCard.count({ where: { status: "SENT" } }),
    prisma.reviewGiftCard.count({ where: { status: "DECLINED" } }),
    countChicagoGiftCardsUsed(),
    prisma.adminJobRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 40,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.reviewGiftCard.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      take: 20,
      include: {
        review: { select: { id: true, title: true, overallRating: true, publishedAt: true } },
        dealership: { select: { name: true, slug: true, cityName: true } },
        markedBy: { select: { name: true } },
      },
    }),
  ]);

  return {
    revenue,
    outreach: {
      ilUnclaimedWithEmail: ilUnclaimed,
      ilContactedInDrip: ilDrip,
      ilClaimedFree,
    },
    giftCards: {
      program: CHICAGO_GIFT_CARD.PROGRAM,
      maxSlots: CHICAGO_GIFT_CARD.MAX_SLOTS,
      amountDollars: CHICAGO_GIFT_CARD.AMOUNT_CENTS / 100,
      used: giftUsed,
      slotsRemaining: Math.max(0, CHICAGO_GIFT_CARD.MAX_SLOTS - giftUsed),
      eligible: giftEligible,
      approved: giftApproved,
      sent: giftSent,
      declined: giftDeclined,
      queue: giftCards,
    },
    recentJobs,
  };
}

export { backfillChicagoGiftCards };
