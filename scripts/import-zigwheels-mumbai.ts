/**
 * Import Mumbai dealerships from ZigWheels into DealerVoice.
 *
 * Usage:
 *   npx tsx scripts/import-zigwheels-mumbai.ts              # import only
 *   npx tsx scripts/import-zigwheels-mumbai.ts --dry-run   # preview counts
 *   npx tsx scripts/import-zigwheels-mumbai.ts --send-claims  # email claim invites (dealers with email)
 *
 * Source: https://www.zigwheels.com/dealers/Mumbai
 */

import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/utils";
import { parseZigWheelsDealers, normalizePhone } from "../lib/importers/zigwheels";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const SOURCE_URL = "https://www.zigwheels.com/dealers/Mumbai";
const UA = "DealerVoice-Importer/1.0 (contact: dealers@dealervoice.io)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.text();
}

type ExistingDealer = { id: string; slug: string; name: string; phone: string | null; postalCode: string | null };

function buildDuplicateIndex(existing: ExistingDealer[]) {
  const byPhone = new Map<string, ExistingDealer>();
  const byNamePostal = new Map<string, ExistingDealer>();

  for (const d of existing) {
    const phoneKey = normalizePhone(d.phone);
    if (phoneKey.length >= 10 && !byPhone.has(phoneKey)) byPhone.set(phoneKey, d);
    if (d.postalCode) {
      const key = `${d.name.toLowerCase()}|${d.postalCode}`;
      if (!byNamePostal.has(key)) byNamePostal.set(key, d);
    }
  }

  return { byPhone, byNamePostal };
}

function findDuplicate(
  dealer: ReturnType<typeof parseZigWheelsDealers>[number],
  index: ReturnType<typeof buildDuplicateIndex>,
) {
  const phoneKey = normalizePhone(dealer.phone);
  if (phoneKey.length >= 10) {
    const hit = index.byPhone.get(phoneKey);
    if (hit) return hit;
  }
  if (dealer.postalCode) {
    const hit = index.byNamePostal.get(`${dealer.name.toLowerCase()}|${dealer.postalCode}`);
    if (hit) return hit;
  }
  return null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const sendClaims = process.argv.includes("--send-claims");

  console.log("🚗 ZigWheels Mumbai import");
  console.log(`   Source: ${SOURCE_URL}`);
  if (dryRun) console.log("   Mode: DRY RUN (no DB writes, no emails)");
  if (sendClaims) console.log("   Will send claim emails to dealers with email addresses");

  const html = await fetchPage(SOURCE_URL);
  const parsed = parseZigWheelsDealers(html, "Mumbai");
  console.log(`   Parsed ${parsed.length} dealers from ZigWheels`);

  const country = await prisma.country.findUnique({ where: { code: "IN" } });
  if (!country) throw new Error("India country record missing — run db seed first");

  const existing = await prisma.dealership.findMany({
    where: {
      countryId: country.id,
      deletedAt: null,
      OR: [
        { cityName: { contains: "Mumbai", mode: "insensitive" } },
        { stateName: { contains: "Maharashtra", mode: "insensitive" } },
      ],
    },
    select: { id: true, slug: true, name: true, phone: true, postalCode: true },
  });
  const dupIndex = buildDuplicateIndex(existing);
  console.log(`   Existing Mumbai/Maharashtra dealers in DB: ${existing.length}`);

  let imported = 0;
  let skipped = 0;
  let updated = 0;
  const toEmail: { email: string; slug: string; name: string }[] = [];

  for (const dealer of parsed) {
    const dup = findDuplicate(dealer, dupIndex);

    if (dup) {
      if (!dryRun && dealer.email) {
        await prisma.dealership.update({
          where: { id: dup.id },
          data: {
            email: dealer.email,
            emailSource: "zigwheels",
            outreachNotes: `ZigWheels Mumbai listing — ${SOURCE_URL}`,
            outreachStatus: "pending",
          },
        }).catch(() => {});
        updated++;
        if (dealer.email) toEmail.push({ email: dealer.email, slug: dup.slug, name: dup.name });
      } else {
        skipped++;
      }
      continue;
    }

    const slug = `${slugify(dealer.name)}-mumbai-${dealer.postalCode ?? "in"}-${Math.random().toString(36).slice(2, 7)}`;

    if (dryRun) {
      imported++;
      if (dealer.email) toEmail.push({ email: dealer.email, slug, name: dealer.name });
      continue;
    }

    try {
      const created = await prisma.dealership.create({
        data: {
          slug,
          name: dealer.name.slice(0, 120),
          countryId: country.id,
          cityName: dealer.cityName,
          stateName: dealer.stateName,
          address: dealer.address,
          postalCode: dealer.postalCode,
          phone: dealer.phone,
          email: dealer.email,
          emailSource: dealer.email ? "zigwheels" : null,
          status: "ACTIVE",
          category: "NEW_VEHICLE",
          outreachStatus: "pending",
          outreachNotes: `Imported from ZigWheels Mumbai — ${SOURCE_URL}`,
        },
      });
      imported++;
      if (dealer.email) {
        toEmail.push({ email: dealer.email, slug: created.slug, name: created.name });
      }
    } catch {
      skipped++;
    }
  }

  if (!dryRun && imported > 0) {
    await prisma.country.update({
      where: { id: country.id },
      data: { dealerCount: { increment: imported } },
    }).catch(() => {});
  }

  console.log(`\n✅ Import summary`);
  console.log(`   New:     ${imported}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped} (likely already in DealerVoice)`);
  console.log(`   With email for claim outreach: ${toEmail.length}`);

  const phoneOnly = parsed.filter((d) => d.phone && !d.email).length;
  console.log(`   Phone-only (Admin → Outreach queue): ${phoneOnly}`);

  if (sendClaims && toEmail.length > 0) {
    if (dryRun) {
      console.log(`\n📧 Would send ${toEmail.length} claim emails (dry-run)`);
      return;
    }
    if (!process.env.RESEND_API_KEY) {
      console.warn("\n⚠ RESEND_API_KEY missing — skipping claim emails");
      return;
    }

    const { sendClaimOutreachEmail } = await import("../lib/email/claim-outreach");

    let sent = 0;
    let failed = 0;
    for (const d of toEmail) {
      try {
        await sendClaimOutreachEmail(d.email, {
          name: d.name,
          slug: d.slug,
          cityName: "Mumbai",
          stateName: "Maharashtra",
        });
        await prisma.dealership.updateMany({
          where: { slug: d.slug },
          data: { outreachStatus: "contacted", lastOutreachAt: new Date() },
        });
        sent++;
        await sleep(600);
      } catch (e) {
        failed++;
        console.warn(`   ✗ ${d.email}: ${e instanceof Error ? e.message : "failed"}`);
      }
    }
    console.log(`\n📧 Claim emails sent: ${sent} · failed: ${failed}`);
  } else if (!sendClaims && toEmail.length > 0) {
    console.log(`\n💡 Run with --send-claims to email ${toEmail.length} dealers their claim link`);
  }

  console.log(`\n📋 Phone outreach: /dashboard/admin/outreach (filter Maharashtra / Mumbai)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
