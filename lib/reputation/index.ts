import prisma from "@/lib/db";
import { setCache, getCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import type { ReputationScore } from "@/types";

// Weights must sum to 100
const WEIGHTS = {
  avgRating: 35,
  verifiedPercent: 20,
  responseRate: 15,
  resolutionRate: 10,
  freshness: 10,
  trend: 10,
};

export async function calculateReputationScore(dealershipId: string): Promise<ReputationScore> {
  const cached = await getCache<ReputationScore>(CACHE_KEYS.reputationScore(dealershipId));
  if (cached) return cached;

  const dealership = await prisma.dealership.findUnique({
    where: { id: dealershipId },
    include: {
      reviews: {
        where: { status: "PUBLISHED", deletedAt: null },
        select: {
          overallRating: true,
          verificationStatus: true,
          createdAt: true,
          response: { select: { id: true, isResolved: true } },
        },
      },
    },
  });

  if (!dealership || dealership.reviews.length === 0) {
    const zero: ReputationScore = {
      total: 0,
      avgRating: 0,
      verifiedPercent: 0,
      responseRate: 0,
      resolutionRate: 0,
      freshness: 0,
      trend: 0,
      breakdown: { avgRating: 0, verifiedPercent: 0, responseRate: 0, resolutionRate: 0, freshness: 0 },
    };
    return zero;
  }

  const reviews = dealership.reviews;
  const total = reviews.length;

  // 1. Average rating (normalized 0-100)
  const avg = reviews.reduce((s, r) => s + r.overallRating, 0) / total;
  const avgNorm = ((avg - 1) / 4) * 100;

  // 2. Verified percent
  const verified = reviews.filter((r) => r.verificationStatus !== "UNVERIFIED").length;
  const verifiedPercent = (verified / total) * 100;

  // 3. Response rate
  const withResponse = reviews.filter((r) => r.response).length;
  const responseRate = (withResponse / total) * 100;

  // 4. Resolution rate
  const resolved = reviews.filter((r) => r.response?.isResolved).length;
  const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

  // 5. Freshness — weight recent reviews higher
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentReviews = reviews.filter((r) => r.createdAt >= thirtyDaysAgo).length;
  const freshness = Math.min(100, (recentReviews / Math.max(total * 0.2, 1)) * 100);

  // 6. Trend — compare last 30 days vs prior 30 days
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const priorReviews = reviews.filter((r) => r.createdAt >= sixtyDaysAgo && r.createdAt < thirtyDaysAgo);
  const recentAvg = reviews.filter((r) => r.createdAt >= thirtyDaysAgo).reduce((s, r, _, a) => s + r.overallRating / a.length, 0) || avg;
  const priorAvg = priorReviews.reduce((s, r, _, a) => s + r.overallRating / a.length, 0) || avg;
  const trendRaw = ((recentAvg - priorAvg) / 4) * 100;
  const trend = Math.max(0, Math.min(100, 50 + trendRaw));

  const score = Math.round(
    (avgNorm * WEIGHTS.avgRating +
      verifiedPercent * WEIGHTS.verifiedPercent +
      responseRate * WEIGHTS.responseRate +
      resolutionRate * WEIGHTS.resolutionRate +
      freshness * WEIGHTS.freshness +
      trend * WEIGHTS.trend) /
      100
  );

  const result: ReputationScore = {
    total: score,
    avgRating: avg,
    verifiedPercent,
    responseRate,
    resolutionRate,
    freshness,
    trend: trendRaw,
    breakdown: {
      avgRating: avgNorm,
      verifiedPercent,
      responseRate,
      resolutionRate,
      freshness,
    },
  };

  // Persist to DB and cache
  await prisma.dealership.update({
    where: { id: dealershipId },
    data: {
      reputationScore: score,
      responseRate: responseRate / 100,
      resolutionRate: resolutionRate / 100,
    },
  });

  await setCache(CACHE_KEYS.reputationScore(dealershipId), result, CACHE_TTL.MEDIUM);
  return result;
}

export async function updateDealershipAggregates(dealershipId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { dealershipId, status: "PUBLISHED", deletedAt: null },
    select: {
      overallRating: true,
      ratingTransparency: true,
      ratingPricing: true,
      ratingService: true,
      ratingDelivery: true,
      ratingAfterSales: true,
      verificationStatus: true,
    },
  });

  if (reviews.length === 0) return;

  const avg = (arr: (number | null)[]) => {
    const valid = arr.filter((n): n is number => n !== null);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
  };

  await prisma.dealership.update({
    where: { id: dealershipId },
    data: {
      totalReviews: reviews.length,
      verifiedReviews: reviews.filter((r) => r.verificationStatus !== "UNVERIFIED").length,
      overallRating: avg(reviews.map((r) => r.overallRating)),
      ratingTransparency: avg(reviews.map((r) => r.ratingTransparency ?? null)),
      ratingPricing: avg(reviews.map((r) => r.ratingPricing ?? null)),
      ratingService: avg(reviews.map((r) => r.ratingService ?? null)),
      ratingDelivery: avg(reviews.map((r) => r.ratingDelivery ?? null)),
      ratingAfterSales: avg(reviews.map((r) => r.ratingAfterSales ?? null)),
    },
  });
}
