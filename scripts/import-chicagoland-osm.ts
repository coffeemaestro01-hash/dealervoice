/**
 * Bulk import Chicagoland + Illinois dealerships from OpenStreetMap.
 * Usage: npm run seed:chicagoland [-- --il-only] [-- --metro-only]
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";
import { CHICAGOLAND_BBOX } from "../lib/geo/chicagoland";
import {
  bboxCarDealerQuery,
  fetchOverpass,
  illinoisCarDealerQuery,
  importDealerRecords,
  nodesToDealerRecords,
} from "../lib/geo/osm-dealer-import";

loadProjectEnv();
const prisma = new PrismaClient();

async function main() {
  const ilOnly = process.argv.includes("--il-only");
  const metroOnly = process.argv.includes("--metro-only");

  const us = await prisma.country.upsert({
    where: { code: "US" },
    create: {
      name: "United States",
      code: "US",
      code3: "USA",
      dialCode: "+1",
      currency: "USD",
      locale: "en-US",
      flagEmoji: "🇺🇸",
    },
    update: {},
  });

  let totalInserted = 0;

  if (!ilOnly) {
    console.log("📍 Chicagoland metro bbox import (target 1200)…");
    const { south, west, north, east } = CHICAGOLAND_BBOX;
    const query = bboxCarDealerQuery(south, west, north, east, 4000);
    const nodes = await fetchOverpass(query);
    console.log(`   Fetched ${nodes.length} OSM nodes`);
    const records = nodesToDealerRecords(nodes, "Illinois");
    const metro = await importDealerRecords(prisma, us.id, records, 1200);
    console.log(`   ✅ Inserted ${metro.inserted} Chicagoland dealers`);
    totalInserted += metro.inserted;
  }

  if (!metroOnly) {
    console.log("📍 Illinois statewide import (target 800)…");
    const nodes = await fetchOverpass(illinoisCarDealerQuery(3500));
    console.log(`   Fetched ${nodes.length} OSM nodes`);
    const records = nodesToDealerRecords(nodes, "Illinois");
    const il = await importDealerRecords(prisma, us.id, records, 800);
    console.log(`   ✅ Inserted ${il.inserted} Illinois dealers`);
    totalInserted += il.inserted;
  }

  const ilCount = await prisma.dealership.count({
    where: {
      countryId: us.id,
      deletedAt: null,
      OR: [
        { stateName: { equals: "IL", mode: "insensitive" } },
        { stateName: { contains: "Illinois", mode: "insensitive" } },
      ],
    },
  });

  console.log(`\n🎉 Done. ${totalInserted} new dealers imported. Illinois total on platform: ${ilCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
