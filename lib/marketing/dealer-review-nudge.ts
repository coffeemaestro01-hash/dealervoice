import prisma from "@/lib/db";
import { sendDealerReviewGrowthEmail } from "@/lib/email";
import { dealerReviewInviteUrl } from "@/lib/reviews/invite";

const MS_DAY = 24 * 60 * 60 * 1000;

/** Email claimed dealers with zero reviews — max once per 7 days per dealer. */
export async function nudgeDealersForReviews(limit = 8) {
  const weekAgo = new Date(Date.now() - 7 * MS_DAY);

  const dealers = await prisma.dealership.findMany({
    where: {
      deletedAt: null,
      claimedAt: { not: null },
      totalReviews: 0,
      OR: [{ reviewNudgeSentAt: null }, { reviewNudgeSentAt: { lt: weekAgo } }],
    },
    take: limit,
    orderBy: [{ isPremiumClaimed: "desc" }, { claimedAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      staff: {
        where: { isActive: true, role: { in: ["owner", "manager", "admin"] } },
        take: 2,
        select: { user: { select: { email: true, name: true } } },
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const d of dealers) {
    const emails = d.staff.map((s) => s.user.email).filter(Boolean) as string[];
    if (emails.length === 0) {
      skipped++;
      continue;
    }

    const inviteUrl = dealerReviewInviteUrl(d.slug);
    for (const to of emails) {
      await sendDealerReviewGrowthEmail(to, d.name, inviteUrl).catch(() => {});
    }

    await prisma.dealership.update({
      where: { id: d.id },
      data: { reviewNudgeSentAt: new Date() },
    });
    sent++;
  }

  return { sent, skipped, candidates: dealers.length };
}
