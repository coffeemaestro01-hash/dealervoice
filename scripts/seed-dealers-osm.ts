/**
 * Seed real dealerships from OpenStreetMap Overpass API — free, no ToS issues.
 * Covers Asia, Europe, and North America. Prioritises dealers that have
 * contact info (phone/website) so claim requests can be sent at launch.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/seed-dealers-osm.ts
 */

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const UA = "DealerVoice-Seeder/1.0 (dealership directory; contact: admin@dealervoice.com)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface CountrySpec {
  name: string;
  code: string;       // ISO 3166-1 alpha-2 (used for OSM area + our Country.code)
  code3: string;
  dialCode: string;
  currency: string;
  locale: string;
  flagEmoji: string;
  region: "Asia" | "Europe" | "North America";
  quota: number;      // target number of dealers to import
}

// ~6,000+ dealerships across three regions, prioritised by market size
const COUNTRIES: CountrySpec[] = [
  // North America
  { name: "United States", code: "US", code3: "USA", dialCode: "+1", currency: "USD", locale: "en-US", flagEmoji: "🇺🇸", region: "North America", quota: 800 },
  { name: "Canada", code: "CA", code3: "CAN", dialCode: "+1", currency: "CAD", locale: "en-CA", flagEmoji: "🇨🇦", region: "North America", quota: 300 },
  { name: "Mexico", code: "MX", code3: "MEX", dialCode: "+52", currency: "MXN", locale: "es-MX", flagEmoji: "🇲🇽", region: "North America", quota: 200 },
  // Europe
  { name: "United Kingdom", code: "GB", code3: "GBR", dialCode: "+44", currency: "GBP", locale: "en-GB", flagEmoji: "🇬🇧", region: "Europe", quota: 450 },
  { name: "Germany", code: "DE", code3: "DEU", dialCode: "+49", currency: "EUR", locale: "de-DE", flagEmoji: "🇩🇪", region: "Europe", quota: 450 },
  { name: "France", code: "FR", code3: "FRA", dialCode: "+33", currency: "EUR", locale: "fr-FR", flagEmoji: "🇫🇷", region: "Europe", quota: 350 },
  { name: "Italy", code: "IT", code3: "ITA", dialCode: "+39", currency: "EUR", locale: "it-IT", flagEmoji: "🇮🇹", region: "Europe", quota: 300 },
  { name: "Spain", code: "ES", code3: "ESP", dialCode: "+34", currency: "EUR", locale: "es-ES", flagEmoji: "🇪🇸", region: "Europe", quota: 250 },
  { name: "Netherlands", code: "NL", code3: "NLD", dialCode: "+31", currency: "EUR", locale: "nl-NL", flagEmoji: "🇳🇱", region: "Europe", quota: 150 },
  { name: "Poland", code: "PL", code3: "POL", dialCode: "+48", currency: "PLN", locale: "pl-PL", flagEmoji: "🇵🇱", region: "Europe", quota: 150 },
  { name: "Belgium", code: "BE", code3: "BEL", dialCode: "+32", currency: "EUR", locale: "nl-BE", flagEmoji: "🇧🇪", region: "Europe", quota: 100 },
  { name: "Sweden", code: "SE", code3: "SWE", dialCode: "+46", currency: "SEK", locale: "sv-SE", flagEmoji: "🇸🇪", region: "Europe", quota: 100 },
  { name: "Switzerland", code: "CH", code3: "CHE", dialCode: "+41", currency: "CHF", locale: "de-CH", flagEmoji: "🇨🇭", region: "Europe", quota: 100 },
  { name: "Austria", code: "AT", code3: "AUT", dialCode: "+43", currency: "EUR", locale: "de-AT", flagEmoji: "🇦🇹", region: "Europe", quota: 90 },
  { name: "Portugal", code: "PT", code3: "PRT", dialCode: "+351", currency: "EUR", locale: "pt-PT", flagEmoji: "🇵🇹", region: "Europe", quota: 90 },
  { name: "Ireland", code: "IE", code3: "IRL", dialCode: "+353", currency: "EUR", locale: "en-IE", flagEmoji: "🇮🇪", region: "Europe", quota: 70 },
  // Asia
  { name: "India", code: "IN", code3: "IND", dialCode: "+91", currency: "INR", locale: "en-IN", flagEmoji: "🇮🇳", region: "Asia", quota: 500 },
  { name: "Japan", code: "JP", code3: "JPN", dialCode: "+81", currency: "JPY", locale: "ja-JP", flagEmoji: "🇯🇵", region: "Asia", quota: 350 },
  { name: "South Korea", code: "KR", code3: "KOR", dialCode: "+82", currency: "KRW", locale: "ko-KR", flagEmoji: "🇰🇷", region: "Asia", quota: 200 },
  { name: "Indonesia", code: "ID", code3: "IDN", dialCode: "+62", currency: "IDR", locale: "id-ID", flagEmoji: "🇮🇩", region: "Asia", quota: 150 },
  { name: "Malaysia", code: "MY", code3: "MYS", dialCode: "+60", currency: "MYR", locale: "ms-MY", flagEmoji: "🇲🇾", region: "Asia", quota: 130 },
  { name: "Thailand", code: "TH", code3: "THA", dialCode: "+66", currency: "THB", locale: "th-TH", flagEmoji: "🇹🇭", region: "Asia", quota: 130 },
  { name: "Philippines", code: "PH", code3: "PHL", dialCode: "+63", currency: "PHP", locale: "en-PH", flagEmoji: "🇵🇭", region: "Asia", quota: 120 },
  { name: "United Arab Emirates", code: "AE", code3: "ARE", dialCode: "+971", currency: "AED", locale: "ar-AE", flagEmoji: "🇦🇪", region: "Asia", quota: 120 },
  { name: "Saudi Arabia", code: "SA", code3: "SAU", dialCode: "+966", currency: "SAR", locale: "ar-SA", flagEmoji: "🇸🇦", region: "Asia", quota: 120 },
  { name: "Singapore", code: "SG", code3: "SGP", dialCode: "+65", currency: "SGD", locale: "en-SG", flagEmoji: "🇸🇬", region: "Asia", quota: 80 },
];

interface OSMNode {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
}
function buildSlug(name: string, city: string, id: number): string {
  return `${slugify(name)}-${slugify(city || "x")}-${id.toString().slice(-7)}`.replace(/--+/g, "-");
}

function overpassQuery(iso: string, limit: number): string {
  // Pull more than quota so we can prioritise dealers with contact info
  const fetchLimit = Math.min(limit * 3, 3500);
  return `
    [out:json][timeout:120];
    area["ISO3166-1"="${iso}"][admin_level=2]->.a;
    (
      node["shop"="car"](area.a);
      way["shop"="car"](area.a);
    );
    out center ${fetchLimit};
  `;
}

async function fetchOSM(iso: string, limit: number): Promise<OSMNode[]> {
  const query = overpassQuery(iso, limit);
  const body = `data=${encodeURIComponent(query)}`;

  for (const url of OVERPASS_URLS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "User-Agent": UA,
          },
          body,
        });
        if (res.status === 429 || res.status === 504) {
          const wait = 8000 * (attempt + 1);
          console.log(`    ${url.split("/")[2]} -> ${res.status}, backoff ${wait / 1000}s`);
          await sleep(wait);
          continue;
        }
        if (!res.ok) { console.log(`    ${url.split("/")[2]} -> ${res.status}, next mirror`); break; }
        const data = await res.json();
        return (data.elements || []) as OSMNode[];
      } catch (e: any) {
        console.log(`    ${url.split("/")[2]} failed: ${e.message}`);
        await sleep(3000);
      }
    }
  }
  return [];
}

function score(tags: Record<string, string>): number {
  // Higher = more "established" / claim-worthy
  let s = 0;
  if (tags.website || tags["contact:website"]) s += 3;
  if (tags.phone || tags["contact:phone"]) s += 2;
  if (tags.brand || tags["brand:en"]) s += 2;
  if (tags["addr:street"]) s += 1;
  if (tags.opening_hours) s += 1;
  if (tags.email || tags["contact:email"]) s += 1;
  return s;
}

async function main() {
  console.log("🗺️  DealerVoice — real dealership import (Asia · Europe · North America)");
  console.log("=".repeat(64));
  let grandTotal = 0;
  const byRegion: Record<string, number> = { Asia: 0, Europe: 0, "North America": 0 };

  for (const c of COUNTRIES) {
    console.log(`\n📍 ${c.name} (${c.code}) — target ${c.quota}`);

    // Ensure country row exists
    const country = await prisma.country.upsert({
      where: { code: c.code },
      create: {
        name: c.name, code: c.code, code3: c.code3, dialCode: c.dialCode,
        currency: c.currency, locale: c.locale, flagEmoji: c.flagEmoji,
      },
      update: {},
    });

    const nodes = await fetchOSM(c.code, c.quota);
    console.log(`    fetched ${nodes.length} OSM nodes`);
    if (nodes.length === 0) continue;

    // Build candidate records (must have a name)
    const candidates = nodes
      .map((n) => {
        const tags = n.tags || {};
        const name = tags.name || tags["name:en"] || tags.brand;
        if (!name || name.length < 2) return null;
        const lat = n.lat ?? n.center?.lat ?? null;
        const lon = n.lon ?? n.center?.lon ?? null;
        const city = tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"] || tags["addr:state"] || "";
        return {
          slug: buildSlug(name, city, n.id),
          name: name.slice(0, 120),
          city,
          state: tags["addr:state"] || null,
          address: [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ") || null,
          postal: tags["addr:postcode"] || null,
          phone: tags.phone || tags["contact:phone"] || null,
          website: tags.website || tags["contact:website"] || null,
          lat, lon,
          brand: tags.brand || tags["brand:en"] || null,
          _score: score(tags),
        };
      })
      .filter(Boolean) as any[];

    // Prioritise by score (contact info first), dedupe by slug, take quota
    candidates.sort((a, b) => b._score - a._score);
    const seen = new Set<string>();
    const picked: any[] = [];
    for (const r of candidates) {
      if (seen.has(r.slug)) continue;
      seen.add(r.slug);
      picked.push(r);
      if (picked.length >= c.quota) break;
    }

    // Insert in chunks with skipDuplicates
    let inserted = 0;
    for (let i = 0; i < picked.length; i += 100) {
      const chunk = picked.slice(i, i + 100);
      const res = await prisma.dealership.createMany({
        data: chunk.map((r) => ({
          slug: r.slug,
          name: r.name,
          category: "NEW_VEHICLE" as const,
          status: "ACTIVE" as const,
          countryId: country.id,
          cityName: r.city || null,
          stateName: r.state,
          address: r.address,
          postalCode: r.postal,
          phone: r.phone,
          website: r.website,
          latitude: r.lat,
          longitude: r.lon,
          overallRating: 0,
          totalReviews: 0,
          reputationScore: 0,
          isVerified: false,
        })),
        skipDuplicates: true,
      });
      inserted += res.count;
    }

    await prisma.country.update({
      where: { id: country.id },
      data: { dealerCount: { increment: inserted } },
    }).catch(() => {});

    byRegion[c.region] += inserted;
    grandTotal += inserted;
    console.log(`    ✅ imported ${inserted} (with contact info prioritised)`);

    // be polite to Overpass (avoid 429)
    await sleep(4000);
  }

  console.log("\n" + "=".repeat(64));
  console.log(`🎉 Total imported: ${grandTotal}`);
  console.log(`   Asia: ${byRegion.Asia} · Europe: ${byRegion.Europe} · North America: ${byRegion["North America"]}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
