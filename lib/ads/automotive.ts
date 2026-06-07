export type AutomotiveAdType =
  | "Tier2_OEM_Offer"
  | "Sponsored_Local_Dealer"
  | "Auto_Ecosystem_Partner";

export interface AutomotiveAd {
  type: AutomotiveAdType;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  badge: string;
  accent: string;
}

export const FALLBACK_AUTOMOTIVE_ADS: Record<AutomotiveAdType, AutomotiveAd> = {
  Tier2_OEM_Offer: {
    type: "Tier2_OEM_Offer",
    badge: "Regional Financing",
    headline: "0.9% APR for 60 Months",
    subheadline: "Qualified buyers on select new models at participating dealers in your metro area.",
    ctaLabel: "Check eligibility",
    ctaHref: "/dealers?category=NEW_VEHICLE",
    accent: "from-gold-600 to-amber-500",
  },
  Sponsored_Local_Dealer: {
    type: "Sponsored_Local_Dealer",
    badge: "Top-Rated Local Lot",
    headline: "Premier Auto Exchange",
    subheadline: "4.9★ rated used inventory — transparent pricing, 7-day return policy, nationwide delivery.",
    ctaLabel: "Browse inventory",
    ctaHref: "/dealers?category=USED_VEHICLE&sort=rating",
    accent: "from-slate-800 to-slate-900",
  },
  Auto_Ecosystem_Partner: {
    type: "Auto_Ecosystem_Partner",
    badge: "Insurance Partner",
    headline: "Save up to 25% on Auto Insurance",
    subheadline: "Compare quotes from national carriers in under 2 minutes — no dealership pressure.",
    ctaLabel: "Get a quote",
    ctaHref: "/advertise",
    accent: "from-indigo-700 to-blue-800",
  },
};
