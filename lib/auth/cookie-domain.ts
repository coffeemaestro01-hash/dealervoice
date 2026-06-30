/** Shared session cookies across dealervoice.io and ticketing.dealervoice.io. */
export const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".dealervoice.io" : undefined;

export const CANONICAL_AUTH_ORIGIN =
  process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://dealervoice.io";

export const TICKETING_HOST = "ticketing.dealervoice.io";

export const ALLOWED_AUTH_REDIRECT_ORIGINS = [
  CANONICAL_AUTH_ORIGIN,
  "https://dealervoice.io",
  "https://www.dealervoice.io",
  `https://${TICKETING_HOST}`,
];
