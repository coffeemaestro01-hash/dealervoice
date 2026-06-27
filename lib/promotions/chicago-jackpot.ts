import prisma from "@/lib/db";
import { chicagolandCityWhere } from "@/lib/geo/chicagoland";
import { planFeatures } from "@/lib/subscription";
import type { ChicagoJackpotStatus, Dealership } from "@prisma/client";

export const CHICAGO_JACKPOT = {
  TARGET_VERIFIED_REVIEWS: 45,
  MAX_WINNERS: 100,
  MIN_MONTHLY_REVIEWS: 5,
  ENTERPRISE_FREE_YEARS: 5,
} as const;

const VERIFIED_STATUSES = ["VERIFIED_PURCHASE", "VERIFIED_SERVICE"] as const;

export function currentComplianceMonth(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function isChicagoDealership(dealer: Pick<Dealership, "cityName" | "stateCode">): boolean {
  if (dealer.stateCode?.toUpperCase() === "IL" && dealer.cityName?.toLowerCase().includes("chicago")) {
    return true;
  }
  const cities = chicagolandCityWhere().OR.map((c) =>
    (c.cityName as { contains: string }).contains.toLowerCase()
  );
  const city = dealer.cityName?.toLowerCase() ?? "";
  return cities.some((name) => city.includes(name.toLowerCase()));
}

export function isClaimedDealership(dealer: Pick<Dealership, "status" | "claimedAt">): boolean {
  return dealer.status === "CLAIMED" || !!dealer.claimedAt;
}

export async function countVerifiedPublishedReviews(dealershipId: string): Promise<number> {
  return prisma.review.count({
    where: {
      dealershipId,
      status: "PUBLISHED",
      deletedAt: null,
      verificationStatus: { in: [...VERIFIED_STATUSES] },
    },
  });
}

export async function countVerifiedReviewsThisMonth(dealershipId: string, month = currentComplianceMonth()) {
  const [year, mon] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, mon - 1, 1));
  const end = new Date(Date.UTC(year, mon, 1));

  return prisma.review.count({
    where: {
      dealershipId,
      status: "PUBLISHED",
      deletedAt: null,
      verificationStatus: { in: [...VERIFIED_STATUSES] },
      publishedAt: { gte: start, lt: end },
    },
  });
}

async function winnerCount(): Promise<number> {
  return prisma.chicagoJackpotEntry.count({ where: { status: "WINNER" } });
}

function addYears(from: Date, years: number): Date {
  const end = new Date(from);
  end.setFullYear(end.getFullYear() + years);
  return end;
}

async function grantEnterpriseJackpot(dealershipId: string, enterpriseUntil: Date) {
  const features = planFeatures("ENTERPRISE");
  await prisma.dealerSubscription.upsert({
    where: { dealershipId },
    create: {
      dealershipId,
      plan: "ENTERPRISE",
      status: "ACTIVE",
      bonusAccessUntil: enterpriseUntil,
      currentPeriodEnd: enterpriseUntil,
      ...features,
    },
    update: {
      plan: "ENTERPRISE",
      status: "ACTIVE",
      bonusAccessUntil: enterpriseUntil,
      currentPeriodEnd: enterpriseUntil,
      ...features,
    },
  });
  await prisma.dealership.update({
    where: { id: dealershipId },
    data: { isPremiumClaimed: true },
  });
}

export async function syncChicagoJackpotForDealership(dealershipId: string) {
  const dealer = await prisma.dealership.findUnique({
    where: { id: dealershipId },
    select: {
      id: true,
      cityName: true,
      stateCode: true,
      status: true,
      claimedAt: true,
    },
  });
  if (!dealer || !isChicagoDealership(dealer) || !isClaimedDealership(dealer)) {
    return null;
  }

  const verifiedCount = await countVerifiedPublishedReviews(dealershipId);
  const month = currentComplianceMonth();
  const reviewsThisMonth = await countVerifiedReviewsThisMonth(dealershipId, month);

  let entry = await prisma.chicagoJackpotEntry.findUnique({ where: { dealershipId } });

  if (!entry) {
    entry = await prisma.chicagoJackpotEntry.create({
      data: {
        dealershipId,
        verifiedReviewCount: verifiedCount,
        reviewsThisMonth,
        complianceMonth: month,
      },
    });
  } else {
    entry = await prisma.chicagoJackpotEntry.update({
      where: { id: entry.id },
      data: {
        verifiedReviewCount: verifiedCount,
        reviewsThisMonth,
        complianceMonth: month,
      },
    });
  }

  if (entry.status === "FORFEITED") return entry;

  if (
    entry.status === "WINNER" &&
    verifiedCount >= CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS
  ) {
    await checkWinnerMonthlyCompliance(entry.id);
    return prisma.chicagoJackpotEntry.findUnique({ where: { id: entry.id } });
  }

  if (verifiedCount >= CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS && entry.status !== "WINNER") {
    const winners = await winnerCount();
    if (winners < CHICAGO_JACKPOT.MAX_WINNERS) {
      const now = new Date();
      const enterpriseUntil = addYears(now, CHICAGO_JACKPOT.ENTERPRISE_FREE_YEARS);
      await grantEnterpriseJackpot(dealershipId, enterpriseUntil);
      entry = await prisma.chicagoJackpotEntry.update({
        where: { id: entry.id },
        data: {
          status: "WINNER",
          qualifiedAt: entry.qualifiedAt ?? now,
          wonAt: now,
          enterpriseUntil,
        },
      });
    } else if (entry.status === "ELIGIBLE") {
      entry = await prisma.chicagoJackpotEntry.update({
        where: { id: entry.id },
        data: { status: "QUALIFIED", qualifiedAt: new Date() },
      });
    }
  }

  return entry;
}

export async function checkWinnerMonthlyCompliance(entryId: string) {
  const entry = await prisma.chicagoJackpotEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.status !== "WINNER") return entry;

  const month = currentComplianceMonth();
  const reviewCount = await countVerifiedReviewsThisMonth(entry.dealershipId, month);
  const compliant = reviewCount >= CHICAGO_JACKPOT.MIN_MONTHLY_REVIEWS;

  await prisma.chicagoJackpotComplianceLog.upsert({
    where: { entryId_month: { entryId, month } },
    create: { entryId, month, reviewCount, compliant },
    update: { reviewCount, compliant, checkedAt: new Date() },
  });

  await prisma.chicagoJackpotEntry.update({
    where: { id: entryId },
    data: {
      reviewsThisMonth: reviewCount,
      complianceMonth: month,
      lastComplianceCheckAt: new Date(),
    },
  });

  if (!compliant && entry.wonAt) {
    const wonMonth = currentComplianceMonth(entry.wonAt);
    if (month > wonMonth) {
      await prisma.chicagoJackpotEntry.update({
        where: { id: entryId },
        data: {
          status: "FORFEITED",
          forfeitedAt: new Date(),
          forfeitedReason: `Fewer than ${CHICAGO_JACKPOT.MIN_MONTHLY_REVIEWS} verified reviews in ${month}`,
        },
      });
    }
  }

  return prisma.chicagoJackpotEntry.findUnique({ where: { id: entryId } });
}

export async function getChicagoJackpotAdminSummary() {
  const [entries, winnerTotal] = await Promise.all([
    prisma.chicagoJackpotEntry.findMany({
      orderBy: [{ status: "asc" }, { verifiedReviewCount: "desc" }],
      include: {
        dealership: {
          select: { id: true, name: true, slug: true, cityName: true, stateCode: true, status: true },
        },
      },
      take: 200,
    }),
    winnerCount(),
  ]);

  return {
    entries,
    winnerTotal,
    slotsRemaining: Math.max(0, CHICAGO_JACKPOT.MAX_WINNERS - winnerTotal),
    config: CHICAGO_JACKPOT,
  };
}

export function jackpotStatusLabel(status: ChicagoJackpotStatus): string {
  switch (status) {
    case "ELIGIBLE":
      return "In progress";
    case "QUALIFIED":
      return "Qualified — awaiting slot";
    case "WINNER":
      return "Winner";
    case "FORFEITED":
      return "Forfeited";
    default:
      return status;
  }
}
