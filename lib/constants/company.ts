/** Public company positioning — Chicago HQ, global product. No personal PII required. */
export const COMPANY = {
  name: "DealerVoice",
  hqCity: process.env.NEXT_PUBLIC_COMPANY_HQ_CITY || "Chicago",
  hqState: process.env.NEXT_PUBLIC_COMPANY_HQ_STATE || "Illinois",
  hqCountry: process.env.NEXT_PUBLIC_COMPANY_HQ_COUNTRY || "United States",
  tagline: "Built in Chicago. Available worldwide.",
  governingLaw: "State of Illinois, United States",
} as const;

export const CEO = {
  name: "Divyakumar Soni",
  title: "CEO",
  organization: "DealerVoice",
  tagline: "Trust at every touchpoint — from the showroom floor to the service lane.",
  headshotPath: "/images/team/divyakumar-soni-ceo.png",
} as const;

export function companyHqLine(): string {
  return `${COMPANY.hqCity}, ${COMPANY.hqState}, ${COMPANY.hqCountry}`;
}
