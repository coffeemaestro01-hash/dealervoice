import { MetadataRoute } from "next";
import prisma from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dealerships: { slug: string; updatedAt: Date }[] = [];
  let countries: { code: string }[] = [];
  let cities: { slug: string; country: { code: string } }[] = [];

  try {
    [dealerships, countries, cities] = await Promise.all([
      prisma.dealership.findMany({
        where: { status: "ACTIVE", deletedAt: null },
        select: { slug: true, updatedAt: true },
        orderBy: { reputationScore: "desc" },
        take: 50_000,
      }),
      prisma.country.findMany({ where: { isActive: true, dealerCount: { gt: 0 } }, select: { code: true } }),
      prisma.city.findMany({ where: { isActive: true, dealerCount: { gt: 0 } }, select: { slug: true, country: { select: { code: true } } }, take: 10_000 }),
    ]);
  } catch {
    // DB not yet migrated - return static pages only
  }

  const static_pages = [
    { url: `${BASE}/`, priority: 1.0 },
    { url: `${BASE}/dealers`, priority: 0.9 },
    { url: `${BASE}/about`, priority: 0.6 },
    { url: `${BASE}/pricing`, priority: 0.7 },
    { url: `${BASE}/blog`, priority: 0.6 },
    { url: `${BASE}/contact`, priority: 0.5 },
    { url: `${BASE}/privacy`, priority: 0.3 },
    { url: `${BASE}/terms`, priority: 0.3 },
  ].map((p) => ({ url: p.url, lastModified: new Date(), changeFrequency: "weekly" as const, priority: p.priority }));

  const dealerPages = dealerships.map((d) => ({
    url: `${BASE}/dealership/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const countryPages = countries.map((c) => ({
    url: `${BASE}/dealers/${c.code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const cityPages = cities.map((c) => ({
    url: `${BASE}/dealers/${c.country.code.toLowerCase()}/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...static_pages, ...dealerPages, ...countryPages, ...cityPages];
}
