export type DealerPlanTier = "PRO" | "PRO_PLUS" | "ENTERPRISE" | "SPONSORED";

export type FeaturedDealerSpotlight = {
  dealershipName: string;
  ceoName: string;
  title: string;
  quote: string;
  planTier: DealerPlanTier;
  city?: string;
  imageUrl?: string;
  dealerSlug?: string;
};

export type ResearchStat = {
  value: string;
  label: string;
};

export type InterviewQA = {
  question: string;
  answer: string;
  speaker?: string;
  role?: string;
};

export type ResearchArticleMeta = {
  stats?: ResearchStat[];
  spotlights?: FeaturedDealerSpotlight[];
  interviews?: InterviewQA[];
};
