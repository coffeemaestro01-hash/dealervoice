/**
 * Promotion codes table for Stripe discounts
 * Usage: npm run db:migrate:promotions
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const STATEMENTS = [
  `CREATE TYPE "PromotionDiscountType" AS ENUM ('FIXED', 'PERCENT')`,
  `CREATE TABLE IF NOT EXISTS "PromotionCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "plan" "SubscriptionPlan",
    "interval" TEXT,
    "discountType" "PromotionDiscountType" NOT NULL DEFAULT 'FIXED',
    "fixedPriceUsdCents" INTEGER,
    "percentOff" INTEGER,
    "stripeCouponId" TEXT NOT NULL,
    "stripePromotionCodeId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "maxRedemptions" INTEGER,
    "timesRedeemed" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromotionCode_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PromotionCode_code_key" ON "PromotionCode"("code")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PromotionCode_stripePromotionCodeId_key" ON "PromotionCode"("stripePromotionCodeId")`,
  `CREATE INDEX IF NOT EXISTS "PromotionCode_code_idx" ON "PromotionCode"("code")`,
  `CREATE INDEX IF NOT EXISTS "PromotionCode_active_idx" ON "PromotionCode"("active")`,
  // Upgrade path for tables created before percent discounts
  `ALTER TABLE "PromotionCode" ADD COLUMN IF NOT EXISTS "discountType" "PromotionDiscountType" NOT NULL DEFAULT 'FIXED'`,
  `ALTER TABLE "PromotionCode" ADD COLUMN IF NOT EXISTS "percentOff" INTEGER`,
  `ALTER TABLE "PromotionCode" ALTER COLUMN "fixedPriceUsdCents" DROP NOT NULL`,
];

async function main() {
  for (const sql of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Enum may already exist on re-run
      if (message.includes("PromotionDiscountType") && message.includes("already exists")) {
        continue;
      }
      throw err;
    }
  }
  console.log("PromotionCode table ready (FIXED + PERCENT discounts).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
