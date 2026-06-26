/**
 * Growth sprint schema — review nudge timestamp.
 * Usage: npm run db:migrate:growth
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`SET statement_timeout = '120s'`);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "review_nudge_sent_at" TIMESTAMPTZ`
  );
  console.log("Growth sprint schema ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
