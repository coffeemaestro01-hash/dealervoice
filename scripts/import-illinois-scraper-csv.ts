/**
 * Import illinois_dealers_emails.csv into DealerVoice (match by website domain, update emails).
 * Usage: npm run outreach:import-il-csv
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { loadProjectEnv } from "./load-env";
import prisma from "@/lib/db";
import {
  isVendorEmail,
  normalizeWebsiteUrl,
  pickBestDealerEmail,
  websiteHostFromUrl,
} from "@/lib/outreach/email-parse";
import { autoStartOutreachDrips } from "@/lib/outreach/drip";
import { logAdminJobRun } from "@/lib/admin/business-tracking";

loadProjectEnv();

type CsvRow = {
  name: string;
  city: string;
  website: string;
  emails: string;
  sourcePage: string;
};

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function readCsv(path: string): CsvRow[] {
  const raw = readFileSync(path, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const rows: CsvRow[] = [];
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    if (cols.length < 4) continue;
    rows.push({
      name: cols[0] ?? "",
      city: cols[1] ?? "",
      website: cols[2] ?? "",
      emails: cols[3] ?? "",
      sourcePage: cols[4] ?? "",
    });
  }
  return rows;
}

function hostKey(url: string): string | null {
  try {
    return websiteHostFromUrl(normalizeWebsiteUrl(url));
  } catch {
    return null;
  }
}

function bestEmailFromRow(row: CsvRow): string | null {
  const list = row.emails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return pickBestDealerEmail(list, row.website || undefined);
}

async function main() {
  const csvPath =
    process.env.IL_SCRAPER_CSV ||
    resolve(process.cwd(), "scrapers/illinois_dealer_emails/illinois_dealers_emails.csv");

  if (!existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const rows = readCsv(csvPath);
  console.log(`\n=== Import IL scraper CSV (${rows.length} rows) ===\n`);

  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) {
    console.error("US country not found");
    process.exit(1);
  }

  const allDealers = await prisma.dealership.findMany({
    where: { countryId: us.id, deletedAt: null, website: { not: null } },
    select: { id: true, name: true, website: true, email: true, cityName: true, stateCode: true },
  });

  const byHost = new Map<string, (typeof allDealers)[0]>();
  for (const d of allDealers) {
    if (!d.website) continue;
    const h = hostKey(d.website);
    if (h) byHost.set(h, d);
  }

  let updated = 0;
  let skippedVendor = 0;
  let skippedNoEmail = 0;
  let skippedNoMatch = 0;
  let skippedHasEmail = 0;

  for (const row of rows) {
    const email = bestEmailFromRow(row);
    if (!email) {
      skippedNoEmail++;
      continue;
    }
    if (isVendorEmail(email, row.website)) {
      skippedVendor++;
      continue;
    }

    const host = row.website ? hostKey(row.website) : null;
    const match = host ? byHost.get(host) : null;

    if (!match) {
      skippedNoMatch++;
      continue;
    }

    const needsEmail =
      !match.email ||
      match.email === "" ||
      isVendorEmail(match.email, match.website);

    if (!needsEmail) {
      skippedHasEmail++;
      continue;
    }

    await prisma.dealership.update({
      where: { id: match.id },
      data: {
        email,
        emailSource: "iada_scraper",
        outreachNotes: `IL scraper import ${new Date().toISOString().slice(0, 10)}`,
      },
    });
    updated++;
    console.log(`  ✓ ${match.name} → ${email}`);
  }

  let dripStarted = 0;
  if (updated > 0 && process.env.RESEND_API_KEY) {
    const drip = await autoStartOutreachDrips(Math.min(30, updated), "US", "Illinois");
    dripStarted = drip.started;
  }

  const summary = {
    rows: rows.length,
    updated,
    skippedVendor,
    skippedNoEmail,
    skippedNoMatch,
    skippedHasEmail,
    dripStarted,
  };

  await logAdminJobRun({
    jobType: "EMAIL_DISCOVERY",
    summary: `IL scraper CSV import — ${updated} emails updated, ${dripStarted} drips started`,
    payload: summary,
  });

  console.log("\n", JSON.stringify(summary, null, 2), "\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
