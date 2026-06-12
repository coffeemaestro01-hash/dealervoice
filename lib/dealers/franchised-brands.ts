/**
 * OEM franchise allowlist — franchised dealerships only.
 * Used by importers, backfill, and public directory filters.
 */

export const FRANCHISED_BRANDS = [
  "Acura",
  "Audi",
  "BMW",
  "Cadillac",
  "Chevrolet",
  "Ford",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "Mercedes",
  "Nissan",
  "Porsche",
  "RAM",
  "Ram",
  "Subaru",
  "Toyota",
  "Volkswagen",
  "VW",
  "Volvo",
] as const;

export type FranchisedBrand = (typeof FRANCHISED_BRANDS)[number];

const NORMALIZED = FRANCHISED_BRANDS.map((b) => ({
  canonical: b,
  key: normalizeBrandKey(b),
}));

function normalizeBrandKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Match franchise from dealer name, OSM brand tag, or website title. */
export function detectFranchiseBrand(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  const hay = text.toLowerCase();
  for (const { canonical, key } of NORMALIZED) {
    if (hay.includes(key) || hay.includes(canonical.toLowerCase())) {
      return canonical === "Mercedes" ? "Mercedes-Benz" : canonical === "Ram" ? "RAM" : canonical === "VW" ? "Volkswagen" : canonical;
    }
  }
  return null;
}

/** True if name/brand suggests a franchised OEM dealer (not independent used lot). */
export function isFranchisedDealerName(name: string, brandTag?: string | null): boolean {
  if (detectFranchiseBrand(brandTag)) return true;
  if (detectFranchiseBrand(name)) return true;
  // Negative signals — independent / used-only
  const lower = name.toLowerCase();
  const blocklist = [
    "used car",
    "used auto",
    "pre-owned only",
    "buy here pay here",
    "bhph",
    "auto sales llc",
    "car lot",
    "independent",
    "wholesale",
    "auction",
    "rental",
  ];
  if (blocklist.some((b) => lower.includes(b))) return false;
  return detectFranchiseBrand(name) !== null;
}

export function franchisedBrandSlug(brand: string): string {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
