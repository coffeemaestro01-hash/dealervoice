/**
 * Email campaigns schema: EmailCampaign + CampaignRecipient
 * Usage: npm run db:migrate:campaigns
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const STATEMENTS = [
  `CREATE TYPE "EmailCampaignStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT', 'FAILED')`,
  `CREATE TYPE "EmailCampaignAudience" AS ENUM ('UNCLAIMED', 'CLAIMED', 'ALL')`,
  `CREATE TABLE IF NOT EXISTS "EmailCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "status" "EmailCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "audience" "EmailCampaignAudience" NOT NULL DEFAULT 'UNCLAIMED',
    "countryId" TEXT,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "unsubscribeCount" INTEGER NOT NULL DEFAULT 0,
    "conversionCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "CampaignRecipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "dealershipId" TEXT,
    "email" TEXT NOT NULL,
    "resendId" TEXT,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "EmailCampaign_status_idx" ON "EmailCampaign"("status")`,
  `CREATE INDEX IF NOT EXISTS "EmailCampaign_sentAt_idx" ON "EmailCampaign"("sentAt")`,
  `CREATE INDEX IF NOT EXISTS "EmailCampaign_createdAt_idx" ON "EmailCampaign"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "CampaignRecipient_campaignId_idx" ON "CampaignRecipient"("campaignId")`,
  `CREATE INDEX IF NOT EXISTS "CampaignRecipient_email_idx" ON "CampaignRecipient"("email")`,
  `CREATE INDEX IF NOT EXISTS "CampaignRecipient_resendId_idx" ON "CampaignRecipient"("resendId")`,
  `DO $$ BEGIN ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  console.log("Applying campaigns migration…\n");

  for (const sql of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log("  ok:", sql.slice(0, 55).replace(/\s+/g, " "));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already exists")) {
        console.log("  skip (exists):", sql.slice(0, 40));
      } else {
        throw e;
      }
    }
  }

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
