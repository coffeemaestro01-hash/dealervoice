import type { Prisma } from "@prisma/client";

/** Sort dealers with Enterprise plan first in location directories, then featured, then reputation. */
export function directoryListingOrderBy(
  secondary: Prisma.DealershipOrderByWithRelationInput = { reputationScore: "desc" }
): Prisma.DealershipOrderByWithRelationInput[] {
  return [{ isFeatured: "desc" }, secondary, { name: "asc" }];
}

/** Post-fetch sort: Enterprise subscribers pinned to top when Prisma can't order by relation plan. */
export function sortDealersForDirectory<
  T extends { subscription?: { plan?: string | null } | null; isFeatured?: boolean; reputationScore?: number },
>(dealers: T[]): T[] {
  return [...dealers].sort((a, b) => {
    const aEnt = a.subscription?.plan === "ENTERPRISE" ? 1 : 0;
    const bEnt = b.subscription?.plan === "ENTERPRISE" ? 1 : 0;
    if (bEnt !== aEnt) return bEnt - aEnt;
    const aFeat = a.isFeatured ? 1 : 0;
    const bFeat = b.isFeatured ? 1 : 0;
    if (bFeat !== aFeat) return bFeat - aFeat;
    return (b.reputationScore ?? 0) - (a.reputationScore ?? 0);
  });
}

export function cityDirectoryWhere(cityName: string): Prisma.DealershipWhereInput {
  return {
    OR: [
      { cityName: { contains: cityName, mode: "insensitive" } },
      {
        serviceAreas: {
          some: { cityName: { contains: cityName, mode: "insensitive" } },
        },
      },
    ],
  };
}
