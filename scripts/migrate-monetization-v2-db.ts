/**
 * Lead fees, API keys, sponsorship fields
 * Usage: npm run db:migrate:monetization-v2
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const STATEMENTS = [
  `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "feeCents" INTEGER`,
  `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "feeChargedAt" TIMESTAMP(3)`,
  `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "feeExternalRef" TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Lead_feeExternalRef_key" ON "Lead"("feeExternalRef")`,
  `CREATE TABLE IF NOT EXISTS "DealerApiKey" (
    "id" TEXT NOT NULL,
    "dealershipId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    CONSTRAINT "DealerApiKey_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "DealerApiKey_dealershipId_key" ON "DealerApiKey"("dealershipId")`,
  `CREATE INDEX IF NOT EXISTS "DealerApiKey_keyHash_idx" ON "DealerApiKey"("keyHash")`,
];

async function main() {
  await prisma.$executeRawUnsafe(`SET statement_timeout = '120s'`);
  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }
  console.log("Monetization v2 schema ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
