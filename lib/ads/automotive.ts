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

const UTM = "utm_source=dealervoice&utm_medium=sponsored";

export const FALLBACK_AUTOMOTIVE_ADS: Record<AutomotiveAdType, AutomotiveAd> = {
  Tier2_OEM_Offer: {
    type: "Tier2_OEM_Offer",
    badge: "Auto financing · U.S.",
    headline: "Compare auto loan rates in minutes",
    subheadline: "Check eligibility from national lenders — no dealership pressure.",
    ctaLabel: "Explore financing",
    ctaHref: `https://www.bankrate.com/loans/auto-loans/?${UTM}&utm_campaign=financing`,
    accent: "from-gold-600 to-amber-500",
  },
  Sponsored_Local_Dealer: {
    type: "Sponsored_Local_Dealer",
    badge: "Sponsored listing",
    headline: "Promote your dealership on DealerVoice",
    subheadline: "Reach in-market car buyers researching dealers in Chicago and nationwide.",
    ctaLabel: "Advertise with us",
    ctaHref: "/advertise",
    accent: "from-slate-800 to-slate-900",
  },
  Auto_Ecosystem_Partner: {
    type: "Auto_Ecosystem_Partner",
    badge: "Insurance Partner",
    headline: "Save on car insurance",
    subheadline: "Compare policies from top U.S. insurers — takes under 2 minutes.",
    ctaLabel: "Get a quote",
    ctaHref: `https://www.progressive.com/auto/?${UTM}&utm_campaign=insurance`,
    accent: "from-indigo-700 to-blue-800",
  },
};
