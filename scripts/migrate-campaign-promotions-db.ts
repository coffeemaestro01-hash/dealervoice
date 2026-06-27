/**
 * Campaign promotions — billing-period bonuses + Chicago Jackpot.
 * Usage: npm run db:migrate:campaign-promotions
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
  console.log("Applying campaign promotions schema…");

  await exec(`CREATE TYPE "BillingPeriodBonusType" AS ENUM ('ANNUAL', 'SEMIANNUAL', 'MONTHLY')`, true);
  await exec(`CREATE TYPE "ChicagoJackpotStatus" AS ENUM ('ELIGIBLE', 'QUALIFIED', 'WINNER', 'FORFEITED')`, true);

  await exec(`ALTER TABLE "DealerSubscription" ADD COLUMN IF NOT EXISTS "bonusAccessUntil" TIMESTAMP(3)`);

  await exec(`
    CREATE TABLE IF NOT EXISTS "BillingPeriodRedemption" (
      "id" TEXT NOT NULL,
      "dealershipId" TEXT NOT NULL,
      "bonusType" "BillingPeriodBonusType" NOT NULL,
      "plan" "SubscriptionPlan" NOT NULL,
      "billingInterval" TEXT NOT NULL,
      "bonusDays" INTEGER NOT NULL,
      "accessUntil" TIMESTAMP(3) NOT NULL,
      "stripeInvoiceId" TEXT,
      "stripeCheckoutSessionId" TEXT,
      "subscriptionId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BillingPeriodRedemption_pkey" PRIMARY KEY ("id")
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS "ChicagoJackpotEntry" (
      "id" TEXT NOT NULL,
      "dealershipId" TEXT NOT NULL,
      "status" "ChicagoJackpotStatus" NOT NULL DEFAULT 'ELIGIBLE',
      "verifiedReviewCount" INTEGER NOT NULL DEFAULT 0,
      "qualifiedAt" TIMESTAMP(3),
      "wonAt" TIMESTAMP(3),
      "enterpriseUntil" TIMESTAMP(3),
      "lastComplianceCheckAt" TIMESTAMP(3),
      "reviewsThisMonth" INTEGER NOT NULL DEFAULT 0,
      "complianceMonth" TEXT,
      "forfeitedAt" TIMESTAMP(3),
      "forfeitedReason" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ChicagoJackpotEntry_pkey" PRIMARY KEY ("id")
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS "ChicagoJackpotComplianceLog" (
      "id" TEXT NOT NULL,
      "entryId" TEXT NOT NULL,
      "month" TEXT NOT NULL,
      "reviewCount" INTEGER NOT NULL,
      "compliant" BOOLEAN NOT NULL,
      "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ChicagoJackpotComplianceLog_pkey" PRIMARY KEY ("id")
    );
  `);

  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "BillingPeriodRedemption_stripeInvoiceId_key" ON "BillingPeriodRedemption"("stripeInvoiceId") WHERE "stripeInvoiceId" IS NOT NULL`);
  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "BillingPeriodRedemption_stripeCheckoutSessionId_key" ON "BillingPeriodRedemption"("stripeCheckoutSessionId") WHERE "stripeCheckoutSessionId" IS NOT NULL`);
  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "ChicagoJackpotEntry_dealershipId_key" ON "ChicagoJackpotEntry"("dealershipId")`);
  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "ChicagoJackpotComplianceLog_entryId_month_key" ON "ChicagoJackpotComplianceLog"("entryId", "month")`);
  await exec(`CREATE INDEX IF NOT EXISTS "BillingPeriodRedemption_dealershipId_idx" ON "BillingPeriodRedemption"("dealershipId")`);
  await exec(`CREATE INDEX IF NOT EXISTS "BillingPeriodRedemption_dealershipId_bonusType_idx" ON "BillingPeriodRedemption"("dealershipId", "bonusType")`);
  await exec(`CREATE INDEX IF NOT EXISTS "ChicagoJackpotEntry_status_idx" ON "ChicagoJackpotEntry"("status")`);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BillingPeriodRedemption_dealershipId_fkey') THEN
        ALTER TABLE "BillingPeriodRedemption"
          ADD CONSTRAINT "BillingPeriodRedemption_dealershipId_fkey"
          FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BillingPeriodRedemption_subscriptionId_fkey') THEN
        ALTER TABLE "BillingPeriodRedemption"
          ADD CONSTRAINT "BillingPeriodRedemption_subscriptionId_fkey"
          FOREIGN KEY ("subscriptionId") REFERENCES "DealerSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChicagoJackpotEntry_dealershipId_fkey') THEN
        ALTER TABLE "ChicagoJackpotEntry"
          ADD CONSTRAINT "ChicagoJackpotEntry_dealershipId_fkey"
          FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChicagoJackpotComplianceLog_entryId_fkey') THEN
        ALTER TABLE "ChicagoJackpotComplianceLog"
          ADD CONSTRAINT "ChicagoJackpotComplianceLog_entryId_fkey"
          FOREIGN KEY ("entryId") REFERENCES "ChicagoJackpotEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
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
