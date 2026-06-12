import prisma from "@/lib/db";
import { publicDealerFilter } from "@/lib/dealer/status";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function fetchDealershipBySlug(slug: string) {
  return prisma.dealership.findFirst({
    where: { slug, ...publicDealerFilter() },
    include: {
      country: true,
      city: true,
      brands: { include: { brand: true }, orderBy: { isPrimary: "desc" } },
      awards: { orderBy: { year: "desc" } },
      subscription: { select: { plan: true } },
      media: { where: { type: "IMAGE" }, take: 10 },
      _count: { select: { reviews: { where: { status: "PUBLISHED" } } } },
    },
  });
}

export async function getDealershipBySlug(slug: string) {
  const cached = await getCache(CACHE_KEYS.dealership(slug));
  if (cached) return cached as Awaited<ReturnType<typeof fetchDealershipBySlug>>;
  const data = await fetchDealershipBySlug(slug);
  if (data) await setCache(CACHE_KEYS.dealership(slug), data, CACHE_TTL.MEDIUM);
  return data;
}

export async function buildDealershipMetadata(slug: string) {
  const dealer = await getDealershipBySlug(slug);
  if (!dealer) return {};
  const location = [dealer.cityName, dealer.stateName, dealer.country?.name].filter(Boolean).join(", ");
  const { dealerCanonicalPath } = await import("@/lib/dealers/seo-url");
  const canonical = dealerCanonicalPath(dealer);
  return {
    title: `${dealer.name} Reviews - ${location}`,
    description:
      dealer.metaDescription ??
      dealer.description ??
      `Read verified reviews for ${dealer.name} in ${location}. Trust Score and buyer ratings on DealerVoice.`,
    alternates: { canonical },
    openGraph: {
      title: `${dealer.name} - ${dealer.overallRating.toFixed(1)}★ (${dealer.totalReviews} reviews)`,
      description: dealer.description ?? `Dealership reviews for ${dealer.name}`,
      images: dealer.coverImageUrl ? [{ url: dealer.coverImageUrl }] : [],
      url: canonical,
    },
  };
}
