/** Canonical DealerVoice contact — Illinois/U.S. company; ImprovMX forwards all aliases to primary inbox */
export const PRIMARY_INBOX = "info@dealervoice.io";

export const EMAILS = {
  info: PRIMARY_INBOX,
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
  dpo: "privacy@dealervoice.io",
  admin: "admin@dealervoice.io",
  noreply: "noreply@dealervoice.io",
} as const;

/** Role addresses configured as ImprovMX aliases forwarding to the primary inbox */
export const IMPROVMX_ALIASES = [
  "info", "support", "dealers", "press", "hello", "billing", "privacy", "legal",
  "grievance", "dpo", "advertise", "careers", "api", "admin", "noreply", "trust", "outreach",
] as const;

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
