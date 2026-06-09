export type TrustLabel = "Excellent" | "Good" | "Fair" | "Poor" | "Unrated";
export type TrustColor = "gold" | "green" | "yellow" | "red" | "gray";

export interface TrustScoreBreakdown {
  avgRating: number;       // 0-100
  verifiedPercent: number; // 0-100
  responseRate: number;    // 0-100
  resolutionRate: number;  // 0-100
  freshness: number;       // 0-100
  claimBonus: number;      // 0, 5, or 10 bonus points
}

export interface TrustScore {
  score: number;
  label: TrustLabel;
  color: TrustColor;
  breakdown: TrustScoreBreakdown;
}

export interface TrustScoreInput {
  reputationScore: number;
  isVerified: boolean;
  isPremiumClaimed?: boolean | null;
  avgRating?: number;
  totalReviews?: number;
  verifiedReviews?: number;
  responseRate?: number; // 0-1 float from DB
}
