import type { TrustScore, TrustLabel, TrustColor, TrustScoreInput } from "./types";

export function getTrustLabel(score: number): TrustLabel {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 45) return "Fair";
  if (score > 0) return "Poor";
  return "Unrated";
}

export function getTrustColor(score: number): TrustColor {
  if (score >= 80) return "gold";
  if (score >= 65) return "green";
  if (score >= 45) return "yellow";
  if (score > 0) return "red";
  return "gray";
}

/**
 * Compute a TrustScore from dealership fields already available on the page
 * (no extra DB round-trip required).
 */
export function computeTrustScore(input: TrustScoreInput): TrustScore {
  // Claimed + verified dealers earn up to 10 bonus points on top of reputation score.
  const claimBonus = input.isPremiumClaimed ? 10 : input.isVerified ? 5 : 0;
  const raw = Math.min(100, input.reputationScore + claimBonus);

  const verifiedPercent =
    input.totalReviews && input.totalReviews > 0 && input.verifiedReviews != null
      ? (input.verifiedReviews / input.totalReviews) * 100
      : 0;

  return {
    score: raw,
    label: getTrustLabel(raw),
    color: getTrustColor(raw),
    breakdown: {
      avgRating:
        input.avgRating != null ? Math.round(((input.avgRating - 1) / 4) * 100) : 0,
      verifiedPercent: Math.round(verifiedPercent),
      responseRate: Math.round((input.responseRate ?? 0) * 100),
      resolutionRate: 0,
      freshness: 0,
      claimBonus,
    },
  };
}
