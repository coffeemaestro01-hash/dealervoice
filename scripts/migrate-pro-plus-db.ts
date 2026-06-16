/**
 * Pro+ plan enum value and featured badge toggle column.
 * Usage: npm run db:migrate:pro-plus
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const STATEMENTS = [
  `ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'PRO_PLUS'`,
  `ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "featured_badge_enabled" BOOLEAN NOT NULL DEFAULT true`,
];

async function main() {
  await prisma.$executeRawUnsafe(`SET statement_timeout = '120s'`);
  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }
  console.log("Pro+ plan and featured badge schema ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
