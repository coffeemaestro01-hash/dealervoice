import type { ResearchArticleMeta } from "./types";

const META: Record<string, ResearchArticleMeta> = {
  "india-outlet-level-dealer-trust-2026": {
    stats: [
      { value: "4.2M+", label: "Passenger vehicles sold in India (FY25)" },
      { value: "18,000+", label: "Authorized outlets nationwide" },
      { value: "67%", label: "Buyers who research dealers online first" },
      { value: "3.2×", label: "Variance in on-road quotes across outlets" },
    ],
  },
  "ceo-voices-premium-dealers-review-platform": {
    spotlights: [
      {
        dealershipName: "Prestige Motors Bengaluru",
        ceoName: "Rajesh Menon",
        title: "Managing Director",
        quote:
          "Buyers don't choose a brand in isolation — they choose our outlet. A neutral review layer that separates sales, delivery, and service ratings is exactly what premium retail needs.",
        planTier: "ENTERPRISE",
        city: "Bengaluru",
        imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format&fit=crop",
      },
      {
        dealershipName: "Horizon Auto Mumbai",
        ceoName: "Priya Shah",
        title: "CEO",
        quote:
          "We invest in transparency because it compounds. DealerVoice lets us respond publicly, publish inventory, and prove we are not hiding behind a manufacturer NPS score.",
        planTier: "PRO",
        city: "Mumbai",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop",
      },
      {
        dealershipName: "Capital Cars Delhi NCR",
        ceoName: "Vikram Oberoi",
        title: "Group CEO",
        quote:
          "Multi-outlet groups need outlet-level accountability. Enterprise analytics on DealerVoice finally give our GMs a reputation dashboard that matches our sales reports.",
        planTier: "ENTERPRISE",
        city: "Delhi NCR",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop",
      },
      {
        dealershipName: "Coastal Hyundai Chennai",
        ceoName: "Anitha Krishnan",
        title: "Proprietor",
        quote:
          "Sponsored visibility is fine when it is labelled and scores stay honest. We claimed our profile on day one because verified reviews are the new word-of-mouth.",
        planTier: "SPONSORED",
        city: "Chennai",
        imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop",
      },
    ],
  },
  "case-for-rapid-growth-reviews-inventory-accountability": {
    stats: [
      { value: "5×", label: "Organic traffic lift with review density" },
      { value: "41%", label: "Buyers who abandon dealers with no recent reviews" },
      { value: "2.8M", label: "Monthly automotive searches in India" },
      { value: "12 mo", label: "Window to own outlet-level SEO" },
    ],
  },
  "dealerceo-interview-trust-platform-india": {
    interviews: [
      {
        question: "Why did you claim your dealership on DealerVoice before review volume scaled?",
        answer:
          "Because reputation infrastructure is a land-grab. The outlets that publish responses, inventory links, and verified buyer stories today will own local search and AI citations tomorrow. Waiting until reviews are fashionable is waiting until you are invisible.",
        speaker: "Rajesh Menon",
        role: "Managing Director, Prestige Motors Bengaluru",
      },
      {
        question: "What do premium dealers want that generic review sites do not offer?",
        answer:
          "Automotive-specific structure — separate scores for transparency, delivery, and after-sales. We also need enterprise roll-ups for dealer groups, public response tools, and a clear line that sponsorship never touches the score. DealerVoice is building that stack deliberately.",
        speaker: "Priya Shah",
        role: "CEO, Horizon Auto Mumbai",
      },
      {
        question: "How does inventory linking change the buyer journey?",
        answer:
          "Reviews answer 'can I trust you?' Inventory answers 'do you have what I want?' When both live on the same profile, we shorten the research loop from three websites to one — and buyers reward that with showroom visits.",
        speaker: "Vikram Oberoi",
        role: "Group CEO, Capital Cars Delhi NCR",
      },
      {
        question: "What would you tell a dealer still skeptical about public reviews?",
        answer:
          "Silence is not neutrality — it is abdication. Buyers are already talking about you on maps and social feeds without context. Claiming your profile lets you correct data, respond with dignity, and show the service recovery stories that never make it to Instagram.",
        speaker: "Anitha Krishnan",
        role: "Proprietor, Coastal Hyundai Chennai",
      },
    ],
    spotlights: [
      {
        dealershipName: "Prestige Motors Bengaluru",
        ceoName: "Rajesh Menon",
        title: "Managing Director",
        quote: "We are not buying stars — we are buying accountability at outlet level.",
        planTier: "ENTERPRISE",
        city: "Bengaluru",
        imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format&fit=crop",
      },
      {
        dealershipName: "Horizon Auto Mumbai",
        ceoName: "Priya Shah",
        title: "CEO",
        quote: "Public responses turned our worst review into our best retention story.",
        planTier: "PRO",
        city: "Mumbai",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop",
      },
    ],
  },
};

export function getResearchArticleMeta(slug: string): ResearchArticleMeta {
  return META[slug] ?? {};
}
