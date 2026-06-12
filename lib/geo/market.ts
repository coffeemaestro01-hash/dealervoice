/** Resolve visitor market for ads, content, and income attribution. */

const MARKET_PRIORITY = ["US", "CA", "GB", "AU", "DE", "AE"] as const;
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
  US: "United States",
  GB: "United Kingdom",
  AU: "Australia",
  CA: "Canada",
  DE: "Germany",
  AE: "UAE",
};

export const GLOBAL_AFFILIATE_DOMAINS = [
  "progressive.com",
  "geico.com",
  "bankrate.com",
  "cargurus.com",
  "edmunds.com",
  "autotrader.com",
  "confused.com",
  "gocompare.com",
  "carsales.com.au",
  "comparethemarket.com.au",
];

/** Third-party affiliate tracking / redirect hosts (e.g. Admitad, partner networks). */
export const AFFILIATE_TRACKER_DOMAINS = [
  "zmgig.com",
  "ad.admitad.com",
  "admitad.com",
];
