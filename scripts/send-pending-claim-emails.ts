/**
 * Send claim-profile emails to all unclaimed India dealerships with email on file.
 *
 * Usage:
 *   npx tsx scripts/send-pending-claim-emails.ts --dry-run
 *   npx tsx scripts/send-pending-claim-emails.ts
 *   npx tsx scripts/send-pending-claim-emails.ts --limit 50
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 2500;

  console.log("📧 DealerVoice claim outreach batch");
  if (dryRun) console.log("   Mode: DRY RUN (no emails sent)");

  const india = await prisma.country.findUnique({ where: { code: "IN" } });
  if (!india) throw new Error("India country missing");

  const dealers = await prisma.dealership.findMany({
    where: {
      countryId: india.id,
      deletedAt: null,
      claimedAt: null,
      email: { not: null },
      NOT: { email: "" },
      OR: [{ outreachStatus: null }, { outreachStatus: "pending" }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      cityName: true,
      stateName: true,
      outreachNotes: true,
    },
  });

  const valid = dealers.filter((d) => d.email && d.email.includes("@"));
  console.log(`   Queue: ${valid.length} dealers with email (unclaimed, not yet contacted)`);

  if (dryRun || valid.length === 0) return;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required to send claim emails");
  }

  const { sendClaimOutreachEmail } = await import("../lib/email/claim-outreach");

  let sent = 0;
  let failed = 0;

  for (const d of valid) {
    try {
      await sendClaimOutreachEmail(d.email!, {
        name: d.name,
        slug: d.slug,
        cityName: d.cityName,
        stateName: d.stateName,
      });
      await prisma.dealership.update({
        where: { id: d.id },
        data: { outreachStatus: "contacted", lastOutreachAt: new Date() },
      });
      sent++;
      if (sent % 25 === 0) console.log(`   … sent ${sent}/${valid.length}`);
      await sleep(500);
    } catch (e) {
      failed++;
      console.warn(`   ✗ ${d.email}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  console.log(`\n✅ Claim emails sent: ${sent} · failed: ${failed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
