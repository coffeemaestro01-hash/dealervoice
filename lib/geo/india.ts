/** India states & union territories — ISO 3166-2 codes for OSM + URL slugs. */

export interface IndiaState {
  name: string;
  code: string; // ISO 3166-2 e.g. IN-MH
  slug: string;
  type: "state" | "ut";
}

export const INDIA_STATES: IndiaState[] = [
  { name: "Andhra Pradesh", code: "IN-AP", slug: "andhra-pradesh", type: "state" },
  { name: "Arunachal Pradesh", code: "IN-AR", slug: "arunachal-pradesh", type: "state" },
  { name: "Assam", code: "IN-AS", slug: "assam", type: "state" },
  { name: "Bihar", code: "IN-BR", slug: "bihar", type: "state" },
  { name: "Chhattisgarh", code: "IN-CT", slug: "chhattisgarh", type: "state" },
  { name: "Goa", code: "IN-GA", slug: "goa", type: "state" },
  { name: "Gujarat", code: "IN-GJ", slug: "gujarat", type: "state" },
  { name: "Haryana", code: "IN-HR", slug: "haryana", type: "state" },
  { name: "Himachal Pradesh", code: "IN-HP", slug: "himachal-pradesh", type: "state" },
  { name: "Jharkhand", code: "IN-JH", slug: "jharkhand", type: "state" },
  { name: "Karnataka", code: "IN-KA", slug: "karnataka", type: "state" },
  { name: "Kerala", code: "IN-KL", slug: "kerala", type: "state" },
  { name: "Madhya Pradesh", code: "IN-MP", slug: "madhya-pradesh", type: "state" },
  { name: "Maharashtra", code: "IN-MH", slug: "maharashtra", type: "state" },
  { name: "Manipur", code: "IN-MN", slug: "manipur", type: "state" },
  { name: "Meghalaya", code: "IN-ML", slug: "meghalaya", type: "state" },
  { name: "Mizoram", code: "IN-MZ", slug: "mizoram", type: "state" },
  { name: "Nagaland", code: "IN-NL", slug: "nagaland", type: "state" },
  { name: "Odisha", code: "IN-OR", slug: "odisha", type: "state" },
  { name: "Punjab", code: "IN-PB", slug: "punjab", type: "state" },
  { name: "Rajasthan", code: "IN-RJ", slug: "rajasthan", type: "state" },
  { name: "Sikkim", code: "IN-SK", slug: "sikkim", type: "state" },
  { name: "Tamil Nadu", code: "IN-TN", slug: "tamil-nadu", type: "state" },
  { name: "Telangana", code: "IN-TG", slug: "telangana", type: "state" },
  { name: "Tripura", code: "IN-TR", slug: "tripura", type: "state" },
  { name: "Uttar Pradesh", code: "IN-UP", slug: "uttar-pradesh", type: "state" },
  { name: "Uttarakhand", code: "IN-UT", slug: "uttarakhand", type: "state" },
  { name: "West Bengal", code: "IN-WB", slug: "west-bengal", type: "state" },
  { name: "Andaman and Nicobar Islands", code: "IN-AN", slug: "andaman-nicobar", type: "ut" },
  { name: "Chandigarh", code: "IN-CH", slug: "chandigarh", type: "ut" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "IN-DH", slug: "dadra-nagar-haveli-daman-diu", type: "ut" },
  { name: "Delhi", code: "IN-DL", slug: "delhi", type: "ut" },
  { name: "Jammu and Kashmir", code: "IN-JK", slug: "jammu-kashmir", type: "ut" },
  { name: "Ladakh", code: "IN-LA", slug: "ladakh", type: "ut" },
  { name: "Lakshadweep", code: "IN-LD", slug: "lakshadweep", type: "ut" },
  { name: "Puducherry", code: "IN-PY", slug: "puducherry", type: "ut" },
];

/** Launch-priority metros for merchandising and outreach. */
export const INDIA_LAUNCH_STATES = ["maharashtra", "karnataka", "delhi", "tamil-nadu", "gujarat"] as const;

export function findIndiaState(slugOrCode: string): IndiaState | undefined {
  const q = slugOrCode.toLowerCase().replace(/_/g, "-");
  return INDIA_STATES.find((s) => s.slug === q || s.code.toLowerCase() === q || s.code.split("-")[1]?.toLowerCase() === q);
}

export function districtSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function districtHref(countryCode: string, stateSlug: string, districtName: string) {
  return `/dealers/${countryCode.toLowerCase()}/state/${stateSlug}/district/${districtSlug(districtName)}`;
}
