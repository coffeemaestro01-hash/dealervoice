import { NextRequest, NextResponse } from "next/server";
import { searchSchema } from "@/lib/validations";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import prisma from "@/lib/db";
import { publicDealerWhere } from "@/lib/dealer/status";
import type { DealerCategory, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = searchSchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid search params", details: parsed.error.flatten() }, { status: 400 });
    }

    const { q, location, country, city, brand, category, rating, verified, sort, page, limit } = parsed.data;

    const cacheKey = CACHE_KEYS.searchResults(searchParams.toString());
    const cached = await getCache(cacheKey);
    if (cached) return NextResponse.json(cached);

    const andClauses: Record<string, unknown>[] = [];
    if (q) {
      andClauses.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { cityName: { contains: q, mode: "insensitive" } },
          { stateName: { contains: q, mode: "insensitive" } },
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

    const where: Prisma.DealershipWhereInput = {
      ...publicDealerWhere,
      ...(andClauses.length > 0 && { AND: andClauses }),
      ...(country && { country: { code: country.toUpperCase() } }),
      ...(city && { cityName: { contains: city, mode: "insensitive" } }),
      ...(category && { category: category as DealerCategory }),
      ...(rating && { overallRating: { gte: rating } }),
      ...(verified && { verifiedReviews: { gt: 0 } }),
      ...(brand && { brands: { some: { brand: { slug: brand } } } }),
    };

    const orderBy =
      {
        relevance: { reputationScore: "desc" as const },
        rating: { overallRating: "desc" as const },
        reviews: { totalReviews: "desc" as const },
        reputation: { reputationScore: "desc" as const },
        newest: { createdAt: "desc" as const },
      }[sort ?? "relevance"] ?? { reputationScore: "desc" as const };

    const dealers = await prisma.dealership.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, orderBy],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        country: { select: { name: true, code: true } },
        city: { select: { name: true, slug: true } },
        brands: {
          include: { brand: { select: { name: true, slug: true, logoUrl: true } } },
          take: 6,
        },
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
  } catch (err) {
    console.error("[search/dealers]", err);
    return NextResponse.json({ error: "Search temporarily unavailable" }, { status: 500 });
  }
}
