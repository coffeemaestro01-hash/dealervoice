import prisma from "@/lib/db";
import { sendBuyerReviewOutreachEmail } from "@/lib/email";
import { APP_URL } from "@/lib/constants/emails";

const MS_DAY = 24 * 60 * 60 * 1000;

/** Email registered buyers to leave reviews — respects emailNotifications. */
export async function outreachBuyersForReviews(limit = 50) {
  const twoWeeksAgo = new Date(Date.now() - 14 * MS_DAY);

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      role: "CUSTOMER",
      emailVerified: { not: null },
      emailNotifications: true,
      OR: [{ lastBuyerOutreachAt: null }, { lastBuyerOutreachAt: { lt: twoWeeksAgo } }],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, totalReviews: true },
  });

  let sent = 0;
  for (const u of users) {
    await sendBuyerReviewOutreachEmail(
      u.email,
      u.name,
      `${APP_URL}/write-review`,
      `${APP_URL}/chicago`
    ).catch(() => {});
    await prisma.user.update({
      where: { id: u.id },
      data: { lastBuyerOutreachAt: new Date() },
    });
    sent++;
  }

  return { sent, candidates: users.length };
}

/** One-time style blast to all eligible buyers (cap per run). */
export async function outreachAllEligibleBuyers(limit = 200) {
  return outreachBuyersForReviews(limit);
}
