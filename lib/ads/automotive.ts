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
    badge: "Car Loan · India",
    headline: "Compare car loan rates in minutes",
    subheadline: "Check eligibility across leading Indian banks — no dealership pressure.",
    ctaLabel: "Check loan offers",
    ctaHref: `https://www.bankbazaar.com/car-loan.html?${UTM}&utm_campaign=financing`,
    accent: "from-gold-600 to-amber-500",
  },
  Sponsored_Local_Dealer: {
    type: "Sponsored_Local_Dealer",
    badge: "Sponsored listing",
    headline: "Promote your dealership on DealerVoice",
    subheadline: "Reach in-market car buyers researching dealers in your city. Direct sponsorship slots available.",
    ctaLabel: "Advertise with us",
    ctaHref: "/advertise",
    accent: "from-slate-800 to-slate-900",
  },
  Auto_Ecosystem_Partner: {
    type: "Auto_Ecosystem_Partner",
    badge: "Insurance Partner",
    headline: "Save on car insurance in India",
    subheadline: "Compare comprehensive & third-party policies from top insurers — takes under 2 minutes.",
    ctaLabel: "Get a quote",
    ctaHref: `https://www.policybazaar.com/motor-insurance/car-insurance/?${UTM}&utm_campaign=insurance`,
    accent: "from-indigo-700 to-blue-800",
  },
};
