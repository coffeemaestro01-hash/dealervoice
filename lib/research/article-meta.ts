import type { ResearchArticleMeta } from "./types";

const META: Record<string, ResearchArticleMeta> = {
  "us-outlet-level-dealer-trust-2026": {
    stats: [
      { value: "15.5M", label: "New vehicles sold in the U.S. (2025)" },
      { value: "16,000+", label: "Franchised rooftops nationwide" },
      { value: "72%", label: "Buyers who research dealers online first" },
      { value: "3×", label: "Typical doc-fee variance across metro dealers" },
    ],
  },
  "ceo-voices-us-premium-dealers": {
    spotlights: [
      {
        dealershipName: "Lakefront Auto Group",
        ceoName: "Marcus Webb",
        title: "Managing Director",
        quote:
          "Buyers don't choose a brand in isolation — they choose our rooftop. Outlet-level reviews with separate sales and service scores are what premium retail needs.",
        planTier: "ENTERPRISE",
        city: "Chicago, IL",
        imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format&fit=crop",
      },
      {
        dealershipName: "Metro Honda Dallas",
        ceoName: "Sarah Chen",
        title: "CEO",
        quote:
          "We invest in transparency because it compounds. DealerVoice lets us respond publicly and prove we're not hiding behind manufacturer NPS.",
        planTier: "PRO",
        city: "Dallas, TX",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop",
      },
    ],
  },
  "chicago-pilot-dealer-trust": {
    stats: [
      { value: "5", label: "Pro pilot dealers (target)" },
      { value: "Chicago", label: "Home market" },
      { value: "$49", label: "Lead fee on converted quotes" },
      { value: "90 days", label: "Pilot window" },
    ],
  },
  "ai-automotive-dealership-review-platform-research": {
    stats: [
      { value: "60%+", label: "Research completed on mobile before lot visit" },
      { value: "Schema.org", label: "Structured dealer profiles" },
      { value: "llms.txt", label: "AI-readable directory" },
      { value: "0", label: "Pay-to-win score boosts" },
    ],
  },
  "dealer-accountability-public-reviews-us": {
    interviews: [
      {
        question: "Why claim your dealership on DealerVoice before review volume scales?",
        answer:
          "Reputation infrastructure is a land-grab. Outlets that publish responses and inventory links today will own local search and AI citations tomorrow.",
        speaker: "Marcus Webb",
        role: "Managing Director, Lakefront Auto Group",
      },
      {
        question: "What do U.S. dealers want that generic review sites don't offer?",
        answer:
          "Automotive-specific structure — separate scores for transparency, F&I, delivery, and service — plus a clear line that sponsorship never touches the score.",
        speaker: "Sarah Chen",
        role: "CEO, Metro Honda Dallas",
      },
    ],
  },
};

export function getResearchArticleMeta(slug: string): ResearchArticleMeta {
  return META[slug] ?? {};
}
