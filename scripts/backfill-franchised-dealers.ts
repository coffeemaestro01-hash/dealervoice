/**
 * Backfill isFranchised + DealerBrand links from dealer names.
 * Usage: npm run backfill:franchised [-- --limit 5000]
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";
import { detectFranchiseBrand, isFranchisedDealerName } from "../lib/dealers/franchised-brands";
import { googleMapsUrl } from "../lib/dealers/seo-url";

loadProjectEnv();
const prisma = new PrismaClient();

async function main() {
  const limit = Number(process.argv[process.argv.indexOf("--limit") + 1] ?? 5000);
  const dealers = await prisma.dealership.findMany({
    where: { deletedAt: null },
    take: limit,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      brands: { select: { id: true } },
    },
  });

  let tagged = 0;
  let brandsLinked = 0;

  for (const d of dealers) {
    const franchise = detectFranchiseBrand(d.name);
    const isFranchised = isFranchisedDealerName(d.name);
    const maps = googleMapsUrl(d.latitude, d.longitude, d.name);

    await prisma.dealership.update({
      where: { id: d.id },
      data: {
        isFranchised,
        isPublished: true,
        googleMapsUrl: maps ?? undefined,
      },
    });
    if (isFranchised) tagged++;

    if (franchise && d.brands.length === 0) {
      const brand = await prisma.brand.upsert({
        where: { slug: franchise.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
        create: { name: franchise, slug: franchise.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
        update: {},
      });
      await prisma.dealerBrand.upsert({
        where: { dealershipId_brandId: { dealershipId: d.id, brandId: brand.id } },
        create: { dealershipId: d.id, brandId: brand.id, isPrimary: true },
        update: { isPrimary: true },
      });
      brandsLinked++;
    }
  }

  console.log(`Processed ${dealers.length} dealers · franchised: ${tagged} · brands linked: ${brandsLinked}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
