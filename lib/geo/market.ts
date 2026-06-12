/** Resolve visitor market for ads, content, and income attribution. */

const MARKET_PRIORITY = ["IN", "US", "GB", "AU", "CA", "DE", "AE"] as const;
export type MarketCode = (typeof MARKET_PRIORITY)[number] | string;

export function normalizeCountryCode(code: string | null | undefined): string | null {
  if (!code || code.length !== 2) return null;
  return code.toUpperCase();
}

/** Pick ad country: visitor geo → fallback global (null = worldwide placements). */
export function resolveAdCountry(visitorCountry: string | null | undefined): string | null {
  const c = normalizeCountryCode(visitorCountry);
  if (c && MARKET_PRIORITY.includes(c as (typeof MARKET_PRIORITY)[number])) return c;
  return null;
}

export const MARKET_LABELS: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  AU: "Australia",
  CA: "Canada",
  DE: "Germany",
  AE: "UAE",
};

export const GLOBAL_AFFILIATE_DOMAINS = [
  "policybazaar.com",
  "acko.com",
  "bankbazaar.com",
  "progressive.com",
  "geico.com",
  "cargurus.com",
  "edmunds.com",
  "autotrader.com",
  "confused.com",
  "gocompare.com",
  "carsales.com.au",
  "cardekho.com",
  "carwale.com",
  "cars24.com",
  "bajajfinserv.in",
  "hdfcbank.com",
  "icicibank.com",
  "bankrate.com",
  "comparethemarket.com.au",
];

/** Third-party affiliate tracking / redirect hosts (e.g. Admitad, partner networks). */
export const AFFILIATE_TRACKER_DOMAINS = [
  "zmgig.com",
  "ad.admitad.com",
  "admitad.com",
];
