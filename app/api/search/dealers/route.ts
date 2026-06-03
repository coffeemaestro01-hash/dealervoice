import { NextRequest, NextResponse } from "next/server";
import { searchSchema } from "@/lib/validations";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = searchSchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search params" }, { status: 400 });
  }

  const { q, location, country, city, brand, category, rating, verified, sort, page, limit } = parsed.data;

  const cacheKey = CACHE_KEYS.searchResults(searchParams.toString());
  const cached = await getCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  // q and location each need their own OR group, so combine them under AND.
  const andClauses: any[] = [];
  if (q) {
    andClauses.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { cityName: { contains: q, mode: "insensitive" } },
        { brands: { some: { brand: { name: { contains: q, mode: "insensitive" } } } } },
      ],
    });
  }
  if (location) {
    andClauses.push({
      OR: [
        { cityName: { contains: location, mode: "insensitive" } },
        { stateName: { contains: location, mode: "insensitive" } },
        { postalCode: { contains: location, mode: "insensitive" } },
        { country: { name: { contains: location, mode: "insensitive" } } },
      ],
    });
  }

  const where: any = {
    status: "ACTIVE",
    deletedAt: null,
    ...(andClauses.length > 0 && { AND: andClauses }),
    ...(country && { country: { code: country.toUpperCase() } }),
    ...(city && { cityName: { contains: city, mode: "insensitive" } }),
    ...(category && { category }),
    ...(rating && { overallRating: { gte: rating } }),
    ...(verified && { verifiedReviews: { gt: 0 } }),
    ...(brand && { brands: { some: { brand: { slug: brand } } } }),
  };

  const orderBy: any = {
    relevance: { reputationScore: "desc" as const },
    rating: { overallRating: "desc" as const },
    reviews: { totalReviews: "desc" as const },
    reputation: { reputationScore: "desc" as const },
    newest: { createdAt: "desc" as const },
  }[sort ?? "relevance"] ?? { reputationScore: "desc" as const };

  // Sequential (not Promise.all) — the pooled connection limit is small, so
  // running these in parallel can exhaust the pool and time out (P2024).
  const dealers = await prisma.dealership.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, orderBy],
    skip: (page - 1) * limit,
    take: limit,
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: { include: { brand: { select: { name: true, slug: true, logoUrl: true } } }, take: 6 },
      subscription: { select: { plan: true } },
    },
  });
  const total = await prisma.dealership.count({ where });

  const result = {
    data: dealers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  await setCache(cacheKey, result, CACHE_TTL.SHORT);
  return NextResponse.json(result);
}
