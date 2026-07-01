/**
 * Business command center — job run log + review gift card fulfillment.
 * Usage: npm run db:migrate:business-tracking
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`SET statement_timeout = '120s'`);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "AdminJobType" AS ENUM (
        'OUTREACH_CHICAGOLAND_PUSH',
        'OUTREACH_DRIP',
        'GROWTH_CRON',
        'GROWTH_ACTION',
        'GIFT_CARD_UPDATE',
        'BUYER_OUTREACH',
        'EMAIL_DISCOVERY'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "AdminJobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "ReviewGiftCardStatus" AS ENUM ('ELIGIBLE', 'APPROVED', 'SENT', 'DECLINED');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "ReviewGiftCardProgram" AS ENUM ('CHICAGO_LAUNCH_10');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "admin_job_runs" (
      "id" TEXT NOT NULL,
      "jobType" "AdminJobType" NOT NULL,
      "status" "AdminJobStatus" NOT NULL DEFAULT 'SUCCESS',
      "summary" TEXT NOT NULL,
      "payload" JSONB,
      "actor_user_id" TEXT,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "finished_at" TIMESTAMPTZ,
      "error_message" TEXT,
      CONSTRAINT "admin_job_runs_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "admin_job_runs_jobType_idx" ON "admin_job_runs"("jobType");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "admin_job_runs_started_at_idx" ON "admin_job_runs"("started_at");
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "admin_job_runs"
        ADD CONSTRAINT "admin_job_runs_actor_user_id_fkey"
        FOREIGN KEY ("actor_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "review_gift_cards" (
      "id" TEXT NOT NULL,
      "review_id" TEXT NOT NULL,
      "dealership_id" TEXT NOT NULL,
      "program" "ReviewGiftCardProgram" NOT NULL DEFAULT 'CHICAGO_LAUNCH_10',
      "status" "ReviewGiftCardStatus" NOT NULL DEFAULT 'ELIGIBLE',
      "amount_cents" INTEGER NOT NULL DEFAULT 2500,
      "recipient_email" TEXT NOT NULL,
      "recipient_name" TEXT,
      "notes" TEXT,
      "approved_at" TIMESTAMPTZ,
      "sent_at" TIMESTAMPTZ,
      "declined_at" TIMESTAMPTZ,
      "marked_by_user_id" TEXT,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "review_gift_cards_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "review_gift_cards_review_id_key" ON "review_gift_cards"("review_id");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "review_gift_cards_status_idx" ON "review_gift_cards"("status");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "review_gift_cards_program_idx" ON "review_gift_cards"("program");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "review_gift_cards_dealership_id_idx" ON "review_gift_cards"("dealership_id");
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "review_gift_cards"
        ADD CONSTRAINT "review_gift_cards_review_id_fkey"
        FOREIGN KEY ("review_id") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "review_gift_cards"
        ADD CONSTRAINT "review_gift_cards_dealership_id_fkey"
        FOREIGN KEY ("dealership_id") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "review_gift_cards"
        ADD CONSTRAINT "review_gift_cards_marked_by_user_id_fkey"
        FOREIGN KEY ("marked_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  console.log("Business tracking schema ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
