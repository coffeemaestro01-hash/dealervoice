import { MetadataRoute } from "next";
import prisma from "@/lib/db";
import { publicDealerWhere } from "@/lib/dealer/status";
import { stateSlug } from "@/lib/geo";
import { dealerCanonicalPath } from "@/lib/dealers/seo-url";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dealerships: {
    slug: string;
    updatedAt: Date;
    cityName: string | null;
    stateCode: string | null;
    stateName: string | null;
    country: { code: string };
  }[] = [];
  let countries: { code: string }[] = [];
  let cities: { slug: string; country: { code: string } }[] = [];
  let stateRows: { stateCode: string | null; stateName: string | null; country: { code: string } }[] = [];
  let blogPosts: { slug: string; updatedAt: Date; publishedAt: Date | null }[] = [];

  try {
    [dealerships, countries, cities, stateRows, blogPosts] = await Promise.all([
      prisma.dealership.findMany({
        where: publicDealerWhere,
        select: {
          slug: true,
          updatedAt: true,
          cityName: true,
          stateCode: true,
          stateName: true,
          country: { select: { code: true } },
        },
        orderBy: { reputationScore: "desc" },
        take: 50_000,
      }),
      prisma.country.findMany({ where: { isActive: true, dealerCount: { gt: 0 } }, select: { code: true } }),
      prisma.city.findMany({ where: { isActive: true, dealerCount: { gt: 0 } }, select: { slug: true, country: { select: { code: true } } }, take: 10_000 }),
      prisma.dealership.findMany({
        where: { deletedAt: null, OR: [{ stateCode: { not: null } }, { stateName: { not: null } }] },
        select: { stateCode: true, stateName: true, country: { select: { code: true } } },
        distinct: ["stateCode", "stateName", "countryId"],
        take: 5000,
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true, publishedAt: true },
        take: 200,
      }),
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
    url: `${BASE}${dealerCanonicalPath(d)}`,
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

  const seen = new Set<string>();
  const statePages = stateRows
    .map((s) => {
      const slug = stateSlug(s.stateCode, s.stateName);
      if (!slug) return null;
      const url = `${BASE}/dealers/${s.country.code.toLowerCase()}/state/${slug}`;
      if (seen.has(url)) return null;
      seen.add(url);
      return { url, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.65 };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const blogPages = blogPosts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.publishedAt ?? p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: p.slug.includes("research") ? 0.75 : 0.55,
  }));

  return [...static_pages, ...blogPages, ...dealerPages, ...countryPages, ...statePages, ...cityPages];
}
