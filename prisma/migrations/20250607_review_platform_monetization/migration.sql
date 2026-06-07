-- DealerVoice: Review platform pivot + Day 1 monetization fields

CREATE TYPE "ReviewCategory" AS ENUM ('SALES_FINANCING', 'SERVICE_PARTS');

ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "is_premium_claimed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Dealership" ADD COLUMN IF NOT EXISTS "inventoryUrl" TEXT;

ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "reviewCategory" "ReviewCategory";
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "salesConsultantName" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "serviceAdvisorName" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "serviceRendered" TEXT;

-- Backfill premium flag for existing paid subscribers
UPDATE "Dealership" d
SET "is_premium_claimed" = true
FROM "DealerSubscription" s
WHERE s."dealershipId" = d.id
  AND s.plan IN ('PRO', 'ENTERPRISE')
  AND s.status = 'ACTIVE';
