import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import { calculateReputationScore } from "@/lib/reputation";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dealershipId = searchParams.get("dealershipId");
  const period = searchParams.get("period") ?? "30d";

  if (!dealershipId) return NextResponse.json({ error: "dealershipId required" }, { status: 400 });

  // Verify access
  const staff = await prisma.dealerStaff.findFirst({ where: { dealershipId, userId: session.user.id, isActive: true } });
  const isAdmin = ["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string);
  if (!staff && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Check Pro/Enterprise
  const sub = await prisma.dealerSubscription.findUnique({ where: { dealershipId } });
  if (!isAdmin && sub?.plan === "FREE") {
    return NextResponse.json({ error: "Analytics require a Pro subscription." }, { status: 403 });
  }

  const cacheKey = CACHE_KEYS.analytics(dealershipId, period);
  const cached = await getCache(cacheKey);
  if (cached) return NextResponse.json({ data: cached });

  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

  const [reviews, prevReviews, reputation, ratingDist] = await Promise.all([
    prisma.review.findMany({
      where: { dealershipId, status: "PUBLISHED", deletedAt: null, publishedAt: { gte: startDate } },
      select: { overallRating: true, publishedAt: true, sentimentLabel: true, verificationStatus: true },
      orderBy: { publishedAt: "asc" },
    }),
    prisma.review.findMany({
      where: { dealershipId, status: "PUBLISHED", deletedAt: null, publishedAt: { gte: prevStartDate, lt: startDate } },
      select: { overallRating: true },
    }),
    calculateReputationScore(dealershipId),
    prisma.review.groupBy({
      by: ["overallRating"],
      where: { dealershipId, status: "PUBLISHED", deletedAt: null },
      _count: true,
    }),
  ]);

  // Daily breakdown
  const dailyMap = new Map<string, { count: number; totalRating: number }>();
  reviews.forEach((r) => {
    const day = r.publishedAt?.toISOString().slice(0, 10) ?? "";
    if (!day) return;
    const existing = dailyMap.get(day) ?? { count: 0, totalRating: 0 };
    dailyMap.set(day, { count: existing.count + 1, totalRating: existing.totalRating + r.overallRating });
  });

  const dailyReviews = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    count: v.count,
    avgRating: v.totalRating / v.count,
  }));

  // Sentiment breakdown
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  reviews.forEach((r) => {
    if (r.sentimentLabel === "positive") sentimentCounts.positive++;
    else if (r.sentimentLabel === "negative") sentimentCounts.negative++;
    else sentimentCounts.neutral++;
  });

  // Rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    rating: star,
    count: ratingDist.find((r) => r.overallRating === star)?._count ?? 0,
  }));

  const currentAvg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length : 0;
  const prevAvg = prevReviews.length > 0 ? prevReviews.reduce((s, r) => s + r.overallRating, 0) / prevReviews.length : 0;

  const data = {
    period,
    reviewCount: reviews.length,
    reviewCountChange: reviews.length - prevReviews.length,
    avgRating: currentAvg,
    avgRatingChange: currentAvg - prevAvg,
    verifiedPercent: reviews.length > 0
      ? (reviews.filter((r) => r.verificationStatus !== "UNVERIFIED").length / reviews.length) * 100
      : 0,
    reputation,
    sentiment: sentimentCounts,
    dailyReviews,
    ratingDistribution,
  };

  await setCache(cacheKey, data, CACHE_TTL.MEDIUM);
  return NextResponse.json({ data });
}
