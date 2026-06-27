/**
 * One-time backfill: sync Chicago Jackpot entries for claimed Chicagoland dealers.
 * Usage: npx tsx scripts/sync-chicago-jackpot-backfill.ts
 */

import { loadProjectEnv } from "./load-env";
loadProjectEnv();

import prisma from "@/lib/db";
import {
  getChicagoJackpotAdminSummary,
  isChicagoDealership,
  isClaimedDealership,
  syncChicagoJackpotForDealership,
} from "@/lib/promotions/chicago-jackpot";

async function main() {
  const dealers = await prisma.dealership.findMany({
    where: {
      deletedAt: null,
      OR: [{ status: "CLAIMED" }, { claimedAt: { not: null } }],
    },
    select: { id: true, cityName: true, stateCode: true, status: true, claimedAt: true },
  });

  let synced = 0;
  for (const d of dealers) {
    if (isChicagoDealership(d) && isClaimedDealership(d)) {
      await syncChicagoJackpotForDealership(d.id).catch(() => {});
      synced += 1;
    }
  }

  const jackpot = await getChicagoJackpotAdminSummary();
  console.log(JSON.stringify({ synced, jackpot }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
