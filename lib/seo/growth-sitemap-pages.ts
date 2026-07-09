import { CHICAGOLAND_CITIES } from "@/lib/geo/chicagoland";
import { citySlug } from "@/lib/dealers/seo-url";
import prisma from "@/lib/db";
import { publicDealerWhere } from "@/lib/dealer/status";
import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";

/** High-intent static pages for organic + conversion (not yet in DB-driven sitemap). */
export function growthStaticSitemapPages(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] }[] = [
    { path: "/chicago", priority: 0.95, changeFrequency: "daily" },
    { path: "/chicago/review", priority: 0.95, changeFrequency: "weekly" },
    { path: "/for-dealers", priority: 0.9, changeFrequency: "weekly" },
    { path: "/claim", priority: 0.9, changeFrequency: "weekly" },
    { path: "/write-review", priority: 0.85, changeFrequency: "weekly" },
    { path: "/promotions", priority: 0.85, changeFrequency: "weekly" },
    { path: "/dealer-inbox", priority: 0.75, changeFrequency: "monthly" },
    { path: "/trust", priority: 0.6, changeFrequency: "monthly" },
    { path: "/methodology", priority: 0.55, changeFrequency: "monthly" },
  ];

  return pages.map((p) => ({
    url: `${BASE}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}

/** Programmatic SEO: city ranking pages where we have inventory. */
export async function chicagolandRankingSitemapPages(): Promise<MetadataRoute.Sitemap> {
  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) return [];

  const pages: MetadataRoute.Sitemap = [];
  for (const city of CHICAGOLAND_CITIES) {
    const count = await prisma.dealership.count({
      where: {
        countryId: us.id,
        ...publicDealerWhere,
        cityName: { contains: city, mode: "insensitive" },
      },
    });
    if (count === 0) continue;
    pages.push({
      url: `${BASE}/best-car-dealerships-in/${citySlug(city)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  return pages;
}
