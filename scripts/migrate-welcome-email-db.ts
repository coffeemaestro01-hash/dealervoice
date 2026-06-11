/**
 * Add welcomeEmailSentAt to DealerSubscription for post-payment email idempotency.
 * Usage: npm run db:migrate:welcome-email
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "DealerSubscription" ADD COLUMN IF NOT EXISTS "welcomeEmailSentAt" TIMESTAMP(3)`
  );
  console.log("DealerSubscription.welcomeEmailSentAt ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
