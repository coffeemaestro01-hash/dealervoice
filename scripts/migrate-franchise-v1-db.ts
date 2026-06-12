/**
 * Phase 1 franchise schema — DealerGroup, isFranchised, isPublished, googleMapsUrl.
 * Usage: npm run db:migrate:franchise-v1
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

async function main() {
  console.log("Applying franchise v1 schema patches…");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DealerGroup" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "website" TEXT,
      "headquarters" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DealerGroup_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "DealerGroup_slug_key" ON "DealerGroup"("slug");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "DealerGroup_slug_idx" ON "DealerGroup"("slug");
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "isFranchised" BOOLEAN NOT NULL DEFAULT false;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "googleMapsUrl" TEXT;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "dealerGroupId" TEXT;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Dealership_isFranchised_idx" ON "Dealership"("isFranchised");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Dealership_isPublished_idx" ON "Dealership"("isPublished");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Dealership_dealerGroupId_idx" ON "Dealership"("dealerGroupId");
  `);

  console.log("Done. Run: npx prisma generate");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
