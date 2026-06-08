/**
 * State-by-state India dealership import from OpenStreetMap.
 * Higher coverage than country-wide query; captures district + email where tagged.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/seed-dealers-india-osm.ts
 * Optional: STATE=maharashtra npx tsx scripts/seed-dealers-india-osm.ts  (single state)
 */

import { PrismaClient } from "@prisma/client";
import { INDIA_STATES, type IndiaState } from "../lib/geo/india";

const prisma = new PrismaClient();

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const UA = "DealerVoice-India-Seeder/1.0 (contact: admin@dealervoice.io)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Per-state target — launch states get more */
const STATE_QUOTA: Record<string, number> = {
  maharashtra: 1200,
  karnataka: 1000,
  delhi: 800,
  "tamil-nadu": 900,
  gujarat: 800,
  "uttar-pradesh": 700,
  telangana: 600,
  "west-bengal": 600,
  rajasthan: 500,
  kerala: 500,
  "madhya-pradesh": 450,
  punjab: 400,
  haryana: 400,
  "andhra-pradesh": 400,
};

const DEFAULT_QUOTA = 250;

interface OSMNode {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function buildSlug(name: string, city: string, id: number): string {
  return `${slugify(name)}-${slugify(city || "in")}-${id.toString().slice(-7)}`.replace(/--+/g, "-");
}

function score(tags: Record<string, string>): number {
  let s = 0;
  if (tags.website || tags["contact:website"]) s += 3;
  if (tags.phone || tags["contact:phone"]) s += 2;
  if (tags.email || tags["contact:email"]) s += 3;
  if (tags.brand || tags["brand:en"]) s += 2;
  if (tags["addr:street"]) s += 1;
  if (tags["addr:district"]) s += 1;
  return s;
}

function overpassQuery(state: IndiaState, limit: number): string {
  const fetchLimit = Math.min(limit * 4, 4000);
  return `
    [out:json][timeout:180];
    area["ISO3166-2"="${state.code}"]->.a;
    (
      node["shop"="car"](area.a);
      way["shop"="car"](area.a);
      node["amenity"="car_dealer"](area.a);
      way["amenity"="car_dealer"](area.a);
    );
    out center ${fetchLimit};
  `;
}

async function fetchOSM(state: IndiaState, limit: number): Promise<OSMNode[]> {
  const query = overpassQuery(state, limit);
  const body = `data=${encodeURIComponent(query)}`;

  for (const url of OVERPASS_URLS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            "User-Agent": UA,
          },
          body,
        });
        if (res.status === 429 || res.status === 504) {
          await sleep(10000 * (attempt + 1));
          continue;
        }
        if (!res.ok) break;
        const data = await res.json();
        return (data.elements || []) as OSMNode[];
      } catch {
        await sleep(5000);
      }
    }
  }
  return [];
}

async function main() {
  const filterSlug = process.env.STATE?.toLowerCase();
  const states = filterSlug
    ? INDIA_STATES.filter((s) => s.slug === filterSlug)
    : INDIA_STATES;

  if (states.length === 0) {
    console.error(`Unknown state: ${filterSlug}`);
    process.exit(1);
  }

  const country = await prisma.country.upsert({
    where: { code: "IN" },
    create: {
      name: "India", code: "IN", code3: "IND", dialCode: "+91",
      currency: "INR", locale: "en-IN", flagEmoji: "🇮🇳",
    },
    update: {},
  });

  console.log("🇮🇳 DealerVoice — India state-by-state OSM import");
  console.log("=".repeat(60));

  let grandTotal = 0;

  for (const state of states) {
    const quota = STATE_QUOTA[state.slug] ?? DEFAULT_QUOTA;
    console.log(`\n📍 ${state.name} (${state.code}) — target ${quota}`);

    const nodes = await fetchOSM(state, quota);
    console.log(`    fetched ${nodes.length} OSM elements`);
    if (nodes.length === 0) {
      await sleep(6000);
      continue;
    }

    const candidates = nodes
      .map((n) => {
        const tags = n.tags || {};
        const name = tags.name || tags["name:en"] || tags.brand;
        if (!name || name.length < 2) return null;
        const email = tags.email || tags["contact:email"] || null;
        const city = tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"] || "";
        const district = tags["addr:district"] || tags["addr:county"] || null;
        return {
          slug: buildSlug(name, city || state.slug, n.id),
          name: name.slice(0, 120),
          city: city || null,
          district,
          stateName: state.name,
          stateCode: state.code.split("-")[1],
          address: [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ") || null,
          postal: tags["addr:postcode"] || null,
          phone: tags.phone || tags["contact:phone"] || null,
          website: tags.website || tags["contact:website"] || null,
          email,
          emailSource: email ? "osm" : null,
          lat: n.lat ?? n.center?.lat ?? null,
          lon: n.lon ?? n.center?.lon ?? null,
          _score: score(tags),
        };
      })
      .filter(Boolean) as any[];

    candidates.sort((a, b) => b._score - a._score);
    const seen = new Set<string>();
    const picked: any[] = [];
    for (const r of candidates) {
      if (seen.has(r.slug)) continue;
      seen.add(r.slug);
      picked.push(r);
      if (picked.length >= quota) break;
    }

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
          cityName: r.city,
          districtName: r.district,
          stateName: r.stateName,
          stateCode: r.stateCode,
          address: r.address,
          postalCode: r.postal,
          phone: r.phone,
          website: r.website,
          email: r.email,
          emailSource: r.emailSource,
          latitude: r.lat,
          longitude: r.lon,
        })),
        skipDuplicates: true,
      });
      inserted += res.count;
    }

    await prisma.country.update({
      where: { id: country.id },
      data: { dealerCount: { increment: inserted } },
    }).catch(() => {});

    grandTotal += inserted;
    const withEmail = picked.filter((p) => p.email).length;
    console.log(`    ✅ imported ${inserted} (${withEmail} had email in OSM)`);
    await sleep(5000);
  }

  console.log("\n" + "=".repeat(60));
  console.log(`🎉 India total imported this run: ${grandTotal}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
