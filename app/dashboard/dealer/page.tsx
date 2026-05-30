import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db";
import { DealerOverviewPage } from "@/components/dashboard/DealerOverviewPage";

async function getDealerDashboardData(userId: string) {
  const staffRecord = await prisma.dealerStaff.findFirst({
    where: { userId, isActive: true },
    include: {
      dealership: {
        include: {
          subscription: { select: { plan: true, status: true } },
          _count: { select: { reviews: { where: { status: "PUBLISHED" } } } },
        },
      },
    },
    orderBy: { invitedAt: "asc" },
  });

  if (!staffRecord) return null;

  const dealership = staffRecord.dealership;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [reviewsThisMonth, reviewsLastMonth, pendingResponses, recentReviews] = await Promise.all([
    prisma.review.count({ where: { dealershipId: dealership.id, status: "PUBLISHED", publishedAt: { gte: thirtyDaysAgo } } }),
    prisma.review.count({ where: { dealershipId: dealership.id, status: "PUBLISHED", publishedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.review.count({ where: { dealershipId: dealership.id, status: "PUBLISHED", response: { is: null } } }),
    prisma.review.findMany({
      where: { dealershipId: dealership.id, status: "PUBLISHED" },
      take: 5,
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, reputationScore: true, totalReviews: true } },
        response: { select: { id: true, body: true, createdAt: true, updatedAt: true, isResolved: true } },
        media: { select: { url: true, type: true, altText: true } },
      },
    }),
  ]);

  return {
    dealership,
    stats: {
      totalReviews: dealership._count.reviews,
      avgRating: dealership.overallRating,
      reputationScore: dealership.reputationScore,
      responseRate: dealership.responseRate,
      pendingResponses,
      reviewsThisMonth,
      reviewsLastMonth,
      ratingChange: 0,
    },
    recentReviews,
  };
}

export default async function DealerDashboardPage() {
  const user = await requireAuth();
  const data = await getDealerDashboardData(user.id);
  return <DealerOverviewPage data={data} />;
}
