/**
 * Billing v2 — dealership-scoped invoices, invoice emails, support tickets.
 * Usage: npm run db:migrate:billing-v2
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
  console.log("Applying billing v2 schema patches…");

  await exec(`CREATE TYPE "InvoiceType" AS ENUM ('SUBSCRIPTION', 'LEAD_FEE', 'SPONSORSHIP')`, true);
  await exec(`CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`, true);
  await exec(`CREATE TYPE "SupportTicketCategory" AS ENUM ('BILLING', 'TECHNICAL', 'CLAIM', 'REVIEWS', 'OTHER')`, true);

  await exec(`ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "dealershipId" TEXT`);
  await exec(`ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "type" "InvoiceType" NOT NULL DEFAULT 'SUBSCRIPTION'`);
  await exec(`ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "description" TEXT`);
  await exec(`ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT`);
  await exec(`ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "emailSentAt" TIMESTAMP(3)`);

  await exec(`
    UPDATE "Invoice" i
    SET "dealershipId" = s."dealershipId"
    FROM "DealerSubscription" s
    WHERE i."subscriptionId" = s."id"
      AND i."dealershipId" IS NULL
  `);

  await exec(`ALTER TABLE "Invoice" ALTER COLUMN "subscriptionId" DROP NOT NULL`);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_dealershipId_fkey'
      ) THEN
        ALTER TABLE "Invoice"
          ADD CONSTRAINT "Invoice_dealershipId_fkey"
          FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id")
          ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  await exec(`CREATE INDEX IF NOT EXISTS "Invoice_dealershipId_idx" ON "Invoice"("dealershipId")`);
  await exec(`CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber") WHERE "invoiceNumber" IS NOT NULL`);

  await exec(`
    CREATE TABLE IF NOT EXISTS "SupportTicket" (
      "id" TEXT NOT NULL,
      "dealershipId" TEXT,
      "userId" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "category" "SupportTicketCategory" NOT NULL DEFAULT 'OTHER',
      "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
      "adminNotes" TEXT,
      "resolvedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS "SupportTicketReply" (
      "id" TEXT NOT NULL,
      "ticketId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "isStaff" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SupportTicketReply_pkey" PRIMARY KEY ("id")
    );
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupportTicket_dealershipId_fkey') THEN
        ALTER TABLE "SupportTicket"
          ADD CONSTRAINT "SupportTicket_dealershipId_fkey"
          FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id")
          ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupportTicket_userId_fkey') THEN
        ALTER TABLE "SupportTicket"
          ADD CONSTRAINT "SupportTicket_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id")
          ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupportTicketReply_ticketId_fkey') THEN
        ALTER TABLE "SupportTicketReply"
          ADD CONSTRAINT "SupportTicketReply_ticketId_fkey"
          FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupportTicketReply_userId_fkey') THEN
        ALTER TABLE "SupportTicketReply"
          ADD CONSTRAINT "SupportTicketReply_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id")
          ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  await exec(`CREATE INDEX IF NOT EXISTS "SupportTicket_dealershipId_idx" ON "SupportTicket"("dealershipId")`);
  await exec(`CREATE INDEX IF NOT EXISTS "SupportTicket_userId_idx" ON "SupportTicket"("userId")`);
  await exec(`CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status")`);
  await exec(`CREATE INDEX IF NOT EXISTS "SupportTicketReply_ticketId_idx" ON "SupportTicketReply"("ticketId")`);

  console.log("Done. Run: npx prisma generate");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
