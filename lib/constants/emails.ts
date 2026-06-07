/** Canonical DealerVoice contact addresses — always @dealervoice.io */
export const EMAILS = {
  support: "support@dealervoice.io",
  dealers: "dealers@dealervoice.io",
  press: "press@dealervoice.io",
  advertise: "advertise@dealervoice.io",
  hello: "hello@dealervoice.io",
  careers: "careers@dealervoice.io",
  api: "api@dealervoice.io",
  privacy: "privacy@dealervoice.io",
  legal: "legal@dealervoice.io",
  billing: "billing@dealervoice.io",
  grievance: "grievance@dealervoice.io",
  dpo: "dpo@dealervoice.io",
  admin: "admin@dealervoice.io",
  noreply: "noreply@dealervoice.io",
} as const;

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
