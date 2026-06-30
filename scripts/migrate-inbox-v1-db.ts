/**
 * DealerVoice Inbox schema (customer support ticketing).
 * Usage: npm run db:migrate:inbox-v1
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const STATEMENTS = [
  `CREATE TYPE "InboxTicketStatus" AS ENUM ('NEW','OPEN','IN_PROGRESS','WAITING','RESOLVED','CLOSED')`,
  `CREATE TYPE "InboxTicketPriority" AS ENUM ('HIGH','MEDIUM','LOW')`,
  `CREATE TYPE "InboxTicketChannel" AS ENUM ('EMAIL','WEB_FORM','PHONE','WALK_IN','OTHER')`,
  `CREATE TYPE "InboxMessageDirection" AS ENUM ('INBOUND','OUTBOUND','INTERNAL')`,
  `CREATE TYPE "InboxEmailProvider" AS ENUM ('GMAIL','MICROSOFT','IMAP','FORWARDING','OTHER')`,
  `CREATE TYPE "InboxConnectionStatus" AS ENUM ('PENDING','CONNECTED','ERROR','DISCONNECTED')`,
  `CREATE TYPE "InboxCSATScore" AS ENUM ('VERY_HAPPY','NEUTRAL','UNHAPPY')`,
];

const TABLES = `
CREATE TABLE IF NOT EXISTS "InboxEmailConnection" (
  "id" TEXT NOT NULL,
  "dealershipId" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'Support',
  "address" TEXT,
  "provider" "InboxEmailProvider" NOT NULL DEFAULT 'OTHER',
  "status" "InboxConnectionStatus" NOT NULL DEFAULT 'PENDING',
  "config" JSONB,
  "lastError" TEXT,
  "connectedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InboxEmailConnection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "InboxEmailConnection_dealershipId_idx" ON "InboxEmailConnection"("dealershipId");
ALTER TABLE "InboxEmailConnection" ADD CONSTRAINT "InboxEmailConnection_dealershipId_fkey"
  FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "InboxContact" (
  "id" TEXT NOT NULL,
  "dealershipId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "phone" TEXT,
  "company" TEXT,
  "vehicleInfo" TEXT,
  "tags" TEXT[],
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InboxContact_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "InboxContact_dealershipId_email_key" ON "InboxContact"("dealershipId", "email");
CREATE INDEX IF NOT EXISTS "InboxContact_dealershipId_idx" ON "InboxContact"("dealershipId");
ALTER TABLE "InboxContact" ADD CONSTRAINT "InboxContact_dealershipId_fkey"
  FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE SEQUENCE IF NOT EXISTS "InboxTicket_ticketNumber_seq";
CREATE TABLE IF NOT EXISTS "InboxTicket" (
  "id" TEXT NOT NULL,
  "ticketNumber" INTEGER NOT NULL DEFAULT nextval('"InboxTicket_ticketNumber_seq"'),
  "dealershipId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "status" "InboxTicketStatus" NOT NULL DEFAULT 'NEW',
  "priority" "InboxTicketPriority" NOT NULL DEFAULT 'MEDIUM',
  "channel" "InboxTicketChannel" NOT NULL DEFAULT 'EMAIL',
  "connectionId" TEXT,
  "contactId" TEXT NOT NULL,
  "assignedToId" TEXT,
  "tags" TEXT[],
  "summary" TEXT,
  "intent" TEXT,
  "sentiment" TEXT,
  "snoozedUntil" TIMESTAMP(3),
  "firstResponseAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InboxTicket_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "InboxTicket_ticketNumber_key" ON "InboxTicket"("ticketNumber");
CREATE INDEX IF NOT EXISTS "InboxTicket_dealershipId_status_idx" ON "InboxTicket"("dealershipId", "status");
CREATE INDEX IF NOT EXISTS "InboxTicket_dealershipId_createdAt_idx" ON "InboxTicket"("dealershipId", "createdAt");
CREATE INDEX IF NOT EXISTS "InboxTicket_assignedToId_idx" ON "InboxTicket"("assignedToId");
ALTER TABLE "InboxTicket" ADD CONSTRAINT "InboxTicket_dealershipId_fkey"
  FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InboxTicket" ADD CONSTRAINT "InboxTicket_connectionId_fkey"
  FOREIGN KEY ("connectionId") REFERENCES "InboxEmailConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InboxTicket" ADD CONSTRAINT "InboxTicket_contactId_fkey"
  FOREIGN KEY ("contactId") REFERENCES "InboxContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InboxTicket" ADD CONSTRAINT "InboxTicket_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "InboxMessage" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "bodyHtml" TEXT,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  "direction" "InboxMessageDirection" NOT NULL,
  "authorId" TEXT,
  "isAiDraft" BOOLEAN NOT NULL DEFAULT false,
  "externalId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "InboxMessage_ticketId_createdAt_idx" ON "InboxMessage"("ticketId", "createdAt");
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "InboxTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "InboxTicketEvent" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "actorId" TEXT,
  "type" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InboxTicketEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "InboxTicketEvent_ticketId_createdAt_idx" ON "InboxTicketEvent"("ticketId", "createdAt");
ALTER TABLE "InboxTicketEvent" ADD CONSTRAINT "InboxTicketEvent_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "InboxTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "InboxCannedResponse" (
  "id" TEXT NOT NULL,
  "dealershipId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "shortcut" TEXT,
  "category" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InboxCannedResponse_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "InboxCannedResponse_dealershipId_idx" ON "InboxCannedResponse"("dealershipId");
ALTER TABLE "InboxCannedResponse" ADD CONSTRAINT "InboxCannedResponse_dealershipId_fkey"
  FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "InboxAutomationRule" (
  "id" TEXT NOT NULL,
  "dealershipId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "trigger" TEXT NOT NULL,
  "conditions" JSONB NOT NULL,
  "actions" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "runCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InboxAutomationRule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "InboxAutomationRule_dealershipId_idx" ON "InboxAutomationRule"("dealershipId");
ALTER TABLE "InboxAutomationRule" ADD CONSTRAINT "InboxAutomationRule_dealershipId_fkey"
  FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "InboxSLAConfig" (
  "id" TEXT NOT NULL,
  "dealershipId" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "label" TEXT,
  "firstResponseHours" INTEGER NOT NULL DEFAULT 24,
  "resolutionHours" INTEGER NOT NULL DEFAULT 72,
  CONSTRAINT "InboxSLAConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "InboxSLAConfig_dealershipId_priority_key" ON "InboxSLAConfig"("dealershipId", "priority");
ALTER TABLE "InboxSLAConfig" ADD CONSTRAINT "InboxSLAConfig_dealershipId_fkey"
  FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "InboxSavedView" (
  "id" TEXT NOT NULL,
  "dealershipId" TEXT NOT NULL,
  "ownerId" TEXT,
  "name" TEXT NOT NULL,
  "filters" JSONB NOT NULL,
  "isShared" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InboxSavedView_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "InboxSavedView_dealershipId_idx" ON "InboxSavedView"("dealershipId");
ALTER TABLE "InboxSavedView" ADD CONSTRAINT "InboxSavedView_dealershipId_fkey"
  FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "InboxCSATSurvey" (
  "id" TEXT NOT NULL,
  "dealershipId" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "score" "InboxCSATScore",
  "comment" TEXT,
  "sentAt" TIMESTAMP(3),
  "respondedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InboxCSATSurvey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "InboxCSATSurvey_token_key" ON "InboxCSATSurvey"("token");
CREATE INDEX IF NOT EXISTS "InboxCSATSurvey_dealershipId_idx" ON "InboxCSATSurvey"("dealershipId");
CREATE INDEX IF NOT EXISTS "InboxCSATSurvey_ticketId_idx" ON "InboxCSATSurvey"("ticketId");
ALTER TABLE "InboxCSATSurvey" ADD CONSTRAINT "InboxCSATSurvey_dealershipId_fkey"
  FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InboxCSATSurvey" ADD CONSTRAINT "InboxCSATSurvey_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "InboxTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InboxCSATSurvey" ADD CONSTRAINT "InboxCSATSurvey_contactId_fkey"
  FOREIGN KEY ("contactId") REFERENCES "InboxContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "InboxOnboardingSession" (
  "id" TEXT NOT NULL,
  "dealershipId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "step" TEXT NOT NULL DEFAULT 'welcome',
  "provider" "InboxEmailProvider",
  "transcript" JSONB,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InboxOnboardingSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "InboxOnboardingSession_dealershipId_idx" ON "InboxOnboardingSession"("dealershipId");
CREATE INDEX IF NOT EXISTS "InboxOnboardingSession_userId_idx" ON "InboxOnboardingSession"("userId");
ALTER TABLE "InboxOnboardingSession" ADD CONSTRAINT "InboxOnboardingSession_dealershipId_fkey"
  FOREIGN KEY ("dealershipId") REFERENCES "Dealership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;

async function execSafe(sql: string) {
  try {
    await prisma.$executeRawUnsafe(sql);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.includes("already exists") ||
      msg.includes("duplicate") ||
      msg.includes("multiple primary keys") ||
      msg.includes("already has")
    ) {
      return;
    }
    throw e;
  }
}

async function main() {
  await prisma.$executeRawUnsafe(`SET statement_timeout = '120s'`);
  for (const sql of STATEMENTS) await execSafe(sql);
  for (const chunk of TABLES.split(";").map((s) => s.trim()).filter(Boolean)) {
    await execSafe(chunk);
  }
  console.log("DealerVoice Inbox schema ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
