import prisma from "@/lib/db";
import { INDIA_STATES } from "@/lib/geo/india";

export async function getIndiaAdminStats() {
  const country = await prisma.country.findUnique({ where: { code: "IN" }, select: { id: true, dealerCount: true } });
  if (!country) return null;

  const [emails, districts, reviews, stateRows] = await Promise.all([
    prisma.dealership.count({
      where: { countryId: country.id, deletedAt: null, email: { not: null }, NOT: { email: "" } },
    }),
    prisma.dealership.groupBy({
      by: ["districtName"],
      where: { countryId: country.id, deletedAt: null, districtName: { not: null } },
      _count: { id: true },
    }),
    prisma.review.count({
      where: { status: "PUBLISHED", deletedAt: null, dealership: { countryId: country.id } },
    }),
    prisma.dealership.groupBy({
      by: ["stateName"],
      where: { countryId: country.id, deletedAt: null, stateName: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  const stateMap = new Map(stateRows.map((r) => [r.stateName?.toLowerCase(), r._count.id]));

  return {
    dealerCount: country.dealerCount,
    emails,
    districts: districts.length,
    reviews,
    states: INDIA_STATES.map((s) => ({
      name: s.name,
      slug: s.slug,
      count: stateMap.get(s.name.toLowerCase()) ?? 0,
    })).sort((a, b) => b.count - a.count),
  };
}
