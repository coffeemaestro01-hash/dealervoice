import { stateSlug } from "@/lib/geo";
import { isCountryCode, isUsStateSlug } from "@/lib/geo/us-states";

export function citySlug(cityName?: string | null): string {
  if (!cityName?.trim()) return "unknown";
  return cityName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type DealerGeo = {
  slug: string;
  cityName?: string | null;
  stateCode?: string | null;
  stateName?: string | null;
  country?: { code: string } | null;
};

/** Canonical public URL for a dealership profile. */
export function dealerCanonicalPath(dealer: DealerGeo): string {
  const countryCode = dealer.country?.code?.toUpperCase();
  if (countryCode === "US") {
    const state = stateSlug(dealer.stateCode, dealer.stateName);
    const city = citySlug(dealer.cityName);
    if (state && state !== "unknown") {
      return `/dealers/${state}/${city}/${dealer.slug}`;
    }
  }
  return `/dealership/${dealer.slug}`;
}

export function dealerCanonicalUrl(dealer: DealerGeo, base = "https://dealervoice.io"): string {
  return `${base.replace(/\/$/, "")}${dealerCanonicalPath(dealer)}`;
}

export function googleMapsUrl(lat?: number | null, lon?: number | null, name?: string): string | null {
  if (lat == null || lon == null) return null;
  const q = encodeURIComponent(name ?? `${lat},${lon}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=&center=${lat}%2C${lon}`;
}

/** Parse /dealers/{a}/{b}/{c} — US state path vs country/city/slug. */
export function parseDealersPathSegment(first: string): "us-state" | "country" | "unknown" {
  const lower = first.toLowerCase();
  if (isUsStateSlug(lower)) return "us-state";
  if (isCountryCode(lower)) return "country";
  return "unknown";
}
