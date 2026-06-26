import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`SET statement_timeout = '120s'`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SocialPostLog" (
      "id" TEXT NOT NULL,
      "platform" TEXT NOT NULL,
      "templateKey" TEXT NOT NULL,
      "contentHash" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "imageUrl" TEXT,
      "videoUrl" TEXT,
      "externalId" TEXT,
      "status" TEXT NOT NULL DEFAULT 'posted',
      "error" TEXT,
      "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SocialPostLog_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "SocialPostLog_platform_contentHash_key"
    ON "SocialPostLog"("platform", "contentHash")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "SocialPostLog_platform_postedAt_idx"
    ON "SocialPostLog"("platform", "postedAt")
  `);
  console.log("SocialPostLog table ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
