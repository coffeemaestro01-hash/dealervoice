/**
 * Service areas + Enterprise account links.
 * Usage: npm run db:migrate:service-areas
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

async function exec(sql: string, ignoreExists = false) {
  try {
    await prisma.$executeRawUnsafe(sql);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (ignoreExists && (message.includes("already exists") || message.includes("duplicate key"))) {
      return;
    }
    throw err;
  }
}

async function main() {
  console.log("Applying service areas schema…");

  await exec(`
    CREATE TABLE IF NOT EXISTS "DealershipServiceArea" (
      "id" TEXT NOT NULL,
      "dealershipId" TEXT NOT NULL,
      "cityName" TEXT NOT NULL,
      "stateName" TEXT,
      "stateCode" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DealershipServiceArea_pkey" PRIMARY KEY ("id")
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS "EnterpriseAccountLink" (
      "id" TEXT NOT NULL,
      "primaryDealershipId" TEXT NOT NULL,
      "linkedDealershipId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "EnterpriseAccountLink_pkey" PRIMARY KEY ("id")
    );
  `);

  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "DealershipServiceArea_dealershipId_cityName_key" ON "DealershipServiceArea"("dealershipId", "cityName")`);
  await exec(`CREATE INDEX IF NOT EXISTS "DealershipServiceArea_dealershipId_idx" ON "DealershipServiceArea"("dealershipId")`);
  await exec(`CREATE INDEX IF NOT EXISTS "DealershipServiceArea_cityName_idx" ON "DealershipServiceArea"("cityName")`);
  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "EnterpriseAccountLink_linkedDealershipId_key" ON "EnterpriseAccountLink"("linkedDealershipId")`);
  await exec(`CREATE INDEX IF NOT EXISTS "EnterpriseAccountLink_primaryDealershipId_idx" ON "EnterpriseAccountLink"("primaryDealershipId")`);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DealershipServiceArea_dealershipId_fkey') THEN
        ALTER TABLE "DealershipServiceArea"
          ADD CONSTRAINT "DealershipServiceArea_dealershipId_fkey"
          FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EnterpriseAccountLink_primaryDealershipId_fkey') THEN
        ALTER TABLE "EnterpriseAccountLink"
          ADD CONSTRAINT "EnterpriseAccountLink_primaryDealershipId_fkey"
          FOREIGN KEY ("primaryDealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EnterpriseAccountLink_linkedDealershipId_fkey') THEN
        ALTER TABLE "EnterpriseAccountLink"
          ADD CONSTRAINT "EnterpriseAccountLink_linkedDealershipId_fkey"
          FOREIGN KEY ("linkedDealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  console.log("Done. Run: npx prisma generate");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
