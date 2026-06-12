/** Slugify a state name or code for URL segments. */
export function stateSlug(stateCode?: string | null, stateName?: string | null): string {
  const raw = (stateCode || stateName || "").trim().toLowerCase();
  return raw
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function stateHref(countryCode: string, stateCode?: string | null, stateName?: string | null) {
  const slug = stateSlug(stateCode, stateName);
  if (!slug) return null;
  return `/dealers/${countryCode.toLowerCase()}/state/${slug}`;
}

export function districtSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function districtHref(countryCode: string, stateSlugParam: string, districtName: string) {
  return `/dealers/${countryCode.toLowerCase()}/state/${stateSlugParam}/district/${districtSlug(districtName)}`;
}
