/**
 * Seed dealerships from OpenStreetMap Overpass API — 100% free, no ToS issues.
 * Queries OSM for car dealerships in target countries and imports them.
 *
 * Usage: npx tsx scripts/seed-dealers-osm.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Target areas — OSM area IDs (country level)
// Find more at: https://nominatim.openstreetmap.org/search?q=India&format=json
const TARGET_AREAS = [
  { name: "India", osmId: 3600304716, countryCode: "IN" },
  { name: "United States", osmId: 3600148838, countryCode: "US" },
  { name: "United Kingdom", osmId: 3600062149, countryCode: "GB" },
  { name: "Australia", osmId: 3600080500, countryCode: "AU" },
  { name: "United Arab Emirates", osmId: 3600307763, countryCode: "AE" },
];

// Batch size to avoid Overpass timeout
const BATCH_LIMIT = 500;

interface OSMNode {
  type: string;
  id: number;
  lat: number;
  lon: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}

function buildOverpassQuery(areaOsmId: number, limit: number): string {
  return `
    [out:json][timeout:60];
    area(${areaOsmId})->.searchArea;
    (
      node["shop"="car"](area.searchArea);
      node["amenity"="car_rental"]["brand"](area.searchArea);
      way["shop"="car"](area.searchArea);
    );
    out center ${limit};
  `;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildSlug(name: string, city: string, id: number): string {
  const base = `${slugify(name)}-${slugify(city || "unknown")}`;
  return `${base}-${id.toString().slice(-6)}`;
}

async function fetchOSMDealers(area: typeof TARGET_AREAS[0]): Promise<OSMNode[]> {
  console.log(`  Fetching OSM data for ${area.name}...`);
  const query = buildOverpassQuery(area.osmId, BATCH_LIMIT);

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);
  const data = await res.json();
  return (data.elements || []) as OSMNode[];
}

async function importDealers(nodes: OSMNode[], countryCode: string, countryId: string): Promise<number> {
  let imported = 0;

  for (const node of nodes) {
    const tags = node.tags || {};
    const name = tags.name || tags["name:en"] || tags.brand;
    if (!name || name.length < 2) continue;

    const lat = node.lat ?? node.center?.lat ?? null;
    const lon = node.lon ?? node.center?.lon ?? null;
    const city = tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"] || "";
    const slug = buildSlug(name, city, node.id);

    // Map OSM brand tags to our brand names
    const brandName = tags.brand || tags["brand:en"];

    try {
      const existing = await prisma.dealership.findUnique({ where: { slug } });
      if (existing) continue;

      await prisma.dealership.create({
        data: {
          slug,
          name,
          category: "NEW_VEHICLE",
          status: "ACTIVE",
          countryId,
          cityName: city || null,
          address: [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ") || null,
          postalCode: tags["addr:postcode"] || null,
          phone: tags.phone || tags["contact:phone"] || null,
          website: tags.website || tags["contact:website"] || null,
          latitude: lat,
          longitude: lon,
          overallRating: 0,
          totalReviews: 0,
          reputationScore: 0,
        },
      });

      // Link brand if known
      if (brandName) {
        const brand = await prisma.brand.findFirst({
          where: { name: { contains: brandName, mode: "insensitive" } },
        });
        if (brand) {
          const dealer = await prisma.dealership.findUnique({ where: { slug } });
          if (dealer) {
            await prisma.dealerBrand.upsert({
              where: { dealershipId_brandId: { dealershipId: dealer.id, brandId: brand.id } },
              create: { dealershipId: dealer.id, brandId: brand.id, isPrimary: true },
              update: {},
            }).catch(() => {});
          }
        }
      }

      imported++;
    } catch (err: any) {
      // Skip duplicates or constraint errors silently
      if (!err.message?.includes("Unique constraint")) {
        console.warn(`  Skip [${name}]: ${err.message}`);
      }
    }
  }

  return imported;
}

async function main() {
  console.log("🗺️  DealerVoice OSM Seeder");
  console.log("=".repeat(40));

  let totalImported = 0;

  for (const area of TARGET_AREAS) {
    console.log(`\n📍 Processing ${area.name} (${area.countryCode})...`);

    // Ensure country exists
    const country = await prisma.country.findUnique({ where: { code: area.countryCode } });
    if (!country) {
      console.log(`  ⚠️  Country ${area.countryCode} not in DB — run db:seed first`);
      continue;
    }

    try {
      const nodes = await fetchOSMDealers(area);
      console.log(`  Found ${nodes.length} OSM nodes`);

      const imported = await importDealers(nodes, area.countryCode, country.id);
      totalImported += imported;

      // Update country dealer count
      await prisma.country.update({
        where: { id: country.id },
        data: { dealerCount: { increment: imported } },
      });

      console.log(`  ✅ Imported ${imported} new dealerships`);

      // Rate limit — be polite to Overpass API
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err: any) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! Total imported: ${totalImported} dealerships`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
