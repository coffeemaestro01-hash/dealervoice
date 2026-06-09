/**
 * Sprint 2 schema: SavedDealer table + Lead.userId
 * Usage: npx tsx scripts/migrate-sprint2-db.ts
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();

const prisma = new PrismaClient();

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "SavedDealer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealershipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedDealer_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SavedDealer_userId_dealershipId_key" ON "SavedDealer"("userId", "dealershipId")`,
  `CREATE INDEX IF NOT EXISTS "SavedDealer_userId_idx" ON "SavedDealer"("userId")`,
  `CREATE INDEX IF NOT EXISTS "SavedDealer_dealershipId_idx" ON "SavedDealer"("dealershipId")`,
  `DO $$ BEGIN
    ALTER TABLE "SavedDealer" ADD CONSTRAINT "SavedDealer_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "SavedDealer" ADD CONSTRAINT "SavedDealer_dealershipId_fkey"
      FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "userId" TEXT`,
  `CREATE INDEX IF NOT EXISTS "Lead_userId_idx" ON "Lead"("userId")`,
  `DO $$ BEGIN
    ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set — add it to .env.local");
    process.exit(1);
  }

  console.log("Applying Sprint 2 database migration…\n");

  for (const sql of STATEMENTS) {
    const label = sql.slice(0, 60).replace(/\s+/g, " ");
    process.stdout.write(`  → ${label}… `);
    await prisma.$executeRawUnsafe(sql);
    console.log("ok");
  }

  const saved = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'SavedDealer'
    ) AS exists
  `;
  const leadCol = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Lead' AND column_name = 'userId'
    ) AS exists
  `;

  console.log("\nVerification:");
  console.log(`  SavedDealer table: ${saved[0]?.exists ? "✓" : "✗"}`);
  console.log(`  Lead.userId column: ${leadCol[0]?.exists ? "✓" : "✗"}`);
  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
