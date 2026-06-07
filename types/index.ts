export type { User, Dealership, Review, ReviewResponse, Country, City, Brand } from "@prisma/client";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchParams {
  q?: string;
  country?: string;
  city?: string;
  brand?: string;
  category?: string;
  rating?: number;
  verified?: boolean;
  sort?: "rating" | "reviews" | "newest" | "relevance";
  page?: number;
  limit?: number;
}

export interface DealershipWithRelations {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  category: string;
  status: string;
  overallRating: number;
  totalReviews: number;
  verifiedReviews: number;
  reputationScore: number;
  responseRate: number;
  ratingTransparency: number;
  ratingPricing: number;
  ratingService: number;
  ratingDelivery: number;
  ratingAfterSales: number;
  address?: string | null;
  cityName?: string | null;
  stateName?: string | null;
  countryId: string;
  phone?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isFeatured: boolean;
  isVerified: boolean;
  isPremiumClaimed?: boolean;
  inventoryUrl?: string | null;
  country: { name: string; code: string };
  city?: { name: string; slug: string } | null;
  brands: Array<{ brand: { name: string; slug: string; logoUrl?: string | null }; isPrimary: boolean }>;
  subscription?: { plan: string } | null;
}

export interface ReviewWithRelations {
  id: string;
  dealershipId: string;
  reviewType: string;
  reviewCategory?: string | null;
  salesConsultantName?: string | null;
  serviceAdvisorName?: string | null;
  serviceRendered?: string | null;
  status: string;
  verificationStatus: string;
  overallRating: number;
  ratingTransparency?: number | null;
  ratingPricing?: number | null;
  ratingService?: number | null;
  ratingDelivery?: number | null;
  ratingAfterSales?: number | null;
  wouldRecommend?: boolean | null;
  title: string;
  body: string;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  visitDate?: Date | null;
  helpfulCount: number;
  sentimentLabel?: string | null;
  createdAt: Date;
  author: { id: string; name: string; avatarUrl?: string | null; reputationScore: number; totalReviews: number };
  response?: ReviewResponse | null;
  media: Array<{ url: string; type: string; altText?: string | null }>;
}

interface ReviewResponse {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  isResolved: boolean;
}

export interface ReputationScore {
  total: number;
  avgRating: number;
  verifiedPercent: number;
  responseRate: number;
  resolutionRate: number;
  freshness: number;
  trend: number;
  breakdown: {
    avgRating: number;
    verifiedPercent: number;
    responseRate: number;
    resolutionRate: number;
    freshness: number;
  };
}

export interface DashboardStats {
  totalReviews: number;
  avgRating: number;
  reputationScore: number;
  responseRate: number;
  pendingResponses: number;
  reviewsThisMonth: number;
  reviewsLastMonth: number;
  ratingChange: number;
}

export interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  score: number;
  label: string;
}

export interface PlanFeatures {
  maxLocations: number;
  analytics: boolean;
  aiInsights: boolean;
  competitorMonitoring: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  FREE: {
    maxLocations: 1,
    analytics: false,
    aiInsights: false,
    competitorMonitoring: false,
    apiAccess: false,
    whiteLabel: false,
    prioritySupport: false,
    customBranding: false,
  },
  PRO: {
    maxLocations: 5,
    analytics: true,
    aiInsights: true,
    competitorMonitoring: true,
    apiAccess: false,
    whiteLabel: false,
    prioritySupport: true,
    customBranding: true,
  },
  ENTERPRISE: {
    maxLocations: 999,
    analytics: true,
    aiInsights: true,
    competitorMonitoring: true,
    apiAccess: true,
    whiteLabel: true,
    prioritySupport: true,
    customBranding: true,
  },
};
