import prisma from "@/lib/db";
import { isChicagoDealership } from "@/lib/promotions/chicago-jackpot";
import type { AdminJobType, ReviewGiftCardStatus } from "@prisma/client";
import { logAdminJobRun } from "@/lib/admin/business-tracking";

export const CHICAGO_GIFT_CARD = {
  PROGRAM: "CHICAGO_LAUNCH_10" as const,
  MAX_SLOTS: 10,
  AMOUNT_CENTS: 2500,
} as const;

const VERIFIED = ["VERIFIED_PURCHASE", "VERIFIED_SERVICE"] as const;

export async function countChicagoGiftCardsUsed(): Promise<number> {
  return prisma.reviewGiftCard.count({
    where: {
      program: CHICAGO_GIFT_CARD.PROGRAM,
      status: { not: "DECLINED" },
    },
  });
}

export async function syncGiftCardForReview(reviewId: string): Promise<{ created: boolean; reason?: string }> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      status: true,
      verificationStatus: true,
      deletedAt: true,
      author: { select: { email: true, name: true } },
      dealership: {
        select: { id: true, cityName: true, stateCode: true, stateName: true },
      },
    },
  });

  if (!review || review.deletedAt) return { created: false, reason: "Review not found" };
  if (review.status !== "PUBLISHED") return { created: false, reason: "Not published" };
  if (!VERIFIED.includes(review.verificationStatus as (typeof VERIFIED)[number])) {
    return { created: false, reason: "Not verified" };
  }
  if (!isChicagoDealership(review.dealership)) {
    return { created: false, reason: "Not Chicagoland" };
  }
  if (!review.author.email?.includes("@")) {
    return { created: false, reason: "No author email" };
  }

  const existing = await prisma.reviewGiftCard.findUnique({ where: { reviewId } });
  if (existing) return { created: false, reason: "Already tracked" };

  const used = await countChicagoGiftCardsUsed();
  if (used >= CHICAGO_GIFT_CARD.MAX_SLOTS) {
    return { created: false, reason: "Program full (10/10)" };
  }

  await prisma.reviewGiftCard.create({
    data: {
      reviewId,
      dealershipId: review.dealership.id,
      program: CHICAGO_GIFT_CARD.PROGRAM,
      recipientEmail: review.author.email,
      recipientName: review.author.name,
      amountCents: CHICAGO_GIFT_CARD.AMOUNT_CENTS,
    },
  });

  return { created: true };
}

/** Backfill gift cards for published verified Chicagoland reviews (first-10 program). */
export async function backfillChicagoGiftCards(): Promise<{ created: number; skipped: number }> {
  const used = await countChicagoGiftCardsUsed();
  const slotsLeft = Math.max(0, CHICAGO_GIFT_CARD.MAX_SLOTS - used);
  if (slotsLeft === 0) return { created: 0, skipped: 0 };

  const reviews = await prisma.review.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      verificationStatus: { in: [...VERIFIED] },
      giftCard: null,
      dealership: {
        deletedAt: null,
        OR: [
          { stateCode: "IL", cityName: { contains: "Chicago", mode: "insensitive" } },
          { stateName: { contains: "Illinois", mode: "insensitive" } },
        ],
      },
    },
    orderBy: { publishedAt: "asc" },
    take: slotsLeft + 20,
    select: { id: true, dealership: { select: { cityName: true, stateCode: true } } },
  });

  let created = 0;
  let skipped = 0;
  for (const r of reviews) {
    if (created >= slotsLeft) break;
    if (!isChicagoDealership(r.dealership)) {
      skipped++;
      continue;
    }
    const result = await syncGiftCardForReview(r.id);
    if (result.created) created++;
    else skipped++;
  }

  return { created, skipped };
}

export async function updateGiftCardStatus(
  id: string,
  status: ReviewGiftCardStatus,
  actorUserId: string,
  notes?: string
) {
  const now = new Date();
  const data: Record<string, unknown> = {
    status,
    markedByUserId: actorUserId,
    notes: notes ?? undefined,
  };
  if (status === "APPROVED") data.approvedAt = now;
  if (status === "SENT") {
    data.sentAt = now;
    if (!data.approvedAt) data.approvedAt = now;
  }
  if (status === "DECLINED") data.declinedAt = now;

  const card = await prisma.reviewGiftCard.update({
    where: { id },
    data,
    include: {
      review: { select: { title: true } },
      dealership: { select: { name: true } },
    },
  });

  await logAdminJobRun({
    jobType: "GIFT_CARD_UPDATE" as AdminJobType,
    summary: `Gift card ${status.toLowerCase()} — ${card.dealership.name}`,
    payload: { giftCardId: id, status, notes },
    actorUserId,
  });

  return card;
}
