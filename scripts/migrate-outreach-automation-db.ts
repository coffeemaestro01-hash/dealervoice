/**
 * Outreach drip fields, per-dealer promos, subscription admin alerts
 * Usage: npm run db:migrate:outreach-automation
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const STATEMENTS = [
  `ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "outreachDripStep" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "outreachDripActive" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "nextOutreachAt" TIMESTAMP(3)`,
  `ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "outreachDripStartedAt" TIMESTAMP(3)`,
  `ALTER TABLE "DealerSubscription" ADD COLUMN IF NOT EXISTS "adminAlertSentAt" TIMESTAMP(3)`,
  `ALTER TABLE "PromotionCode" ADD COLUMN IF NOT EXISTS "dealershipId" TEXT`,
  `CREATE INDEX IF NOT EXISTS "PromotionCode_dealershipId_idx" ON "PromotionCode"("dealershipId")`,
];

async function main() {
  await prisma.$executeRawUnsafe(`SET statement_timeout = '120s'`);
  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.slice(0, 60).replace(/\s+/g, " "));
  }
  console.log("Outreach automation schema ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
