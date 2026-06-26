import prisma from "@/lib/db";
import { usStateWhere } from "@/lib/outreach/regions";
import { chicagolandCityWhere } from "@/lib/geo/chicagoland";

export async function getMarketCoverageStats() {
  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) {
    return { il: 0, chicagoland: 0, ilWithEmail: 0, ilWithWebsite: 0, ilNoEmail: 0, usTotal: 0, customerUsers: 0 };
  }

  const base = { countryId: us.id, deletedAt: null };
  const [il, chicagoland, ilWithEmail, ilWithWebsite, ilNoEmail, usTotal, customerUsers] =
    await Promise.all([
      prisma.dealership.count({ where: { ...base, ...usStateWhere("Illinois") } }),
      prisma.dealership.count({ where: { ...base, ...chicagolandCityWhere() } }),
      prisma.dealership.count({
        where: {
          ...base,
          ...usStateWhere("Illinois"),
          email: { contains: "@" },
        },
      }),
      prisma.dealership.count({
        where: {
          ...base,
          ...usStateWhere("Illinois"),
          website: { not: null },
          NOT: { website: "" },
        },
      }),
      prisma.dealership.count({
        where: {
          ...base,
          claimedAt: null,
          ...usStateWhere("Illinois"),
          OR: [{ email: null }, { email: "" }],
          website: { not: null },
          NOT: { website: "" },
        },
      }),
      prisma.dealership.count({ where: base }),
      prisma.user.count({ where: { role: "CUSTOMER", deletedAt: null, emailVerified: { not: null } } }),
    ]);

  return { il, chicagoland, ilWithEmail, ilWithWebsite, ilNoEmail, usTotal, customerUsers };
}
