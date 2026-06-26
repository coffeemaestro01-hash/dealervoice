/**
 * Import car dealerships from OpenStreetMap into DealerVoice.
 */

import type { PrismaClient } from "@prisma/client";

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

const UA = "DealerVoice-Importer/1.0 (dealership directory; contact: admin@dealervoice.com)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface OSMNode {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function buildSlug(name: string, city: string, id: number) {
  return `${slugify(name)}-${slugify(city || "x")}-${id.toString().slice(-7)}`.replace(/--+/g, "-");
}

function score(tags: Record<string, string>) {
  let s = 0;
  if (tags.website || tags["contact:website"]) s += 3;
  if (tags.phone || tags["contact:phone"]) s += 2;
  if (tags.brand || tags["brand:en"]) s += 2;
  if (tags.email || tags["contact:email"]) s += 3;
  if (tags["addr:street"]) s += 1;
  return s;
}

export async function fetchOverpass(query: string): Promise<OSMNode[]> {
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
          await sleep(8000 * (attempt + 1));
          continue;
        }
        if (!res.ok) break;
        const data = await res.json();
        return (data.elements || []) as OSMNode[];
      } catch {
        await sleep(3000);
      }
    }
  }
  return [];
}

export function bboxCarDealerQuery(south: number, west: number, north: number, east: number, limit: number) {
  const box = `${south},${west},${north},${east}`;
  return `
    [out:json][timeout:180];
    (
      node["shop"="car"](${box});
      way["shop"="car"](${box});
      node["shop"="car_dealer"](${box});
      way["shop"="car_dealer"](${box});
      node["amenity"="car_dealer"](${box});
      way["amenity"="car_dealer"](${box});
    );
    out center ${limit};
  `;
}

export function illinoisCarDealerQuery(limit: number) {
  return `
    [out:json][timeout:180];
    area["ISO3166-2"="US-IL"][admin_level=4]->.il;
    (
      node["shop"="car"](area.il);
      way["shop"="car"](area.il);
      node["shop"="car_dealer"](area.il);
      way["shop"="car_dealer"](area.il);
      node["amenity"="car_dealer"](area.il);
      way["amenity"="car_dealer"](area.il);
    );
    out center ${limit};
  `;
}

export function nodesToDealerRecords(nodes: OSMNode[], stateDefault = "Illinois") {
  return nodes
    .map((n) => {
      const tags = n.tags || {};
      const name = tags.name || tags["name:en"] || tags.brand;
      if (!name || name.length < 2) return null;
      const lat = n.lat ?? n.center?.lat ?? null;
      const lon = n.lon ?? n.center?.lon ?? null;
      const city =
        tags["addr:city"] ||
        tags["addr:town"] ||
        tags["addr:suburb"] ||
        tags["addr:village"] ||
        "";
      const state = tags["addr:state"] || stateDefault;
      const email = tags.email || tags["contact:email"] || null;
      return {
        slug: buildSlug(name, city, n.id),
        name: name.slice(0, 120),
        city,
        state,
        district: tags["addr:county"] || tags["addr:district"] || null,
        address: [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ") || null,
        postal: tags["addr:postcode"] || null,
        phone: tags.phone || tags["contact:phone"] || null,
        website: tags.website || tags["contact:website"] || null,
        email,
        emailSource: email ? ("osm" as const) : null,
        lat,
        lon,
        _score: score(tags),
      };
    })
    .filter(Boolean) as Array<{
    slug: string;
    name: string;
    city: string;
    state: string;
    district: string | null;
    address: string | null;
    postal: string | null;
    phone: string | null;
    website: string | null;
    email: string | null;
    emailSource: "osm" | null;
    lat: number | null;
    lon: number | null;
    _score: number;
  }>;
}

export async function importDealerRecords(
  prisma: PrismaClient,
  countryId: string,
  records: ReturnType<typeof nodesToDealerRecords>,
  quota: number
) {
  const sorted = [...records].sort((a, b) => b._score - a._score);
  const seen = new Set<string>();
  const picked = [];
  for (const r of sorted) {
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
        countryId,
        cityName: r.city || null,
        stateName: r.state || "Illinois",
        districtName: r.district,
        address: r.address,
        postalCode: r.postal,
        phone: r.phone,
        website: r.website,
        email: r.email,
        emailSource: r.emailSource,
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

  if (inserted > 0) {
    await prisma.country.update({
      where: { id: countryId },
      data: { dealerCount: { increment: inserted } },
    }).catch(() => {});
  }

  return { fetched: records.length, picked: picked.length, inserted };
}
