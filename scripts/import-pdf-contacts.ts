/**
 * Import dealership contacts from Desktop PDF folder.
 *
 * Usage:
 *   npx tsx scripts/import-pdf-contacts.ts
 *   npx tsx scripts/import-pdf-contacts.ts --dry-run
 *   npx tsx scripts/import-pdf-contacts.ts --folder "/path/to/Dealership Contacts"
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/utils";
import { parseAutomobileDealersPdf } from "../lib/importers/automobile-dealers-pdf";
import { parseCashlessGaragesPdf } from "../lib/importers/cashless-garages-pdf";
import { findDuplicate, loadIndiaDealerIndex } from "../lib/importers/dedupe";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const DEFAULT_FOLDER = path.join(process.env.HOME ?? "", "Desktop", "Dealership Contacts");
const AUTO_PDF = "599292477-Automobile-Dealers.pdf";
const GARAGE_PDF = "257497858-Cashless-Garages-Pan-India-List-new.pdf";

function pdfToText(filePath: string) {
  return execSync(`pdftotext -layout "${filePath}" -`, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
}

async function upsertDealer(
  data: {
    name: string;
    cityName: string;
    stateName: string;
    address: string;
    postalCode: string | null;
    phone: string | null;
    email: string | null;
    source: string;
    sourceNote: string;
  },
  countryId: string,
  index: ReturnType<typeof import("../lib/importers/dedupe").buildDuplicateIndex>,
  dryRun: boolean,
) {
  const dup = findDuplicate(
    { name: data.name, phone: data.phone, postalCode: data.postalCode ?? undefined },
    index,
  );

  if (dup) {
    if (!dryRun && data.email && !dup.email) {
      await prisma.dealership.update({
        where: { id: dup.id },
        data: {
          email: data.email,
          emailSource: data.source,
          phone: dup.phone ?? data.phone,
          outreachNotes: data.sourceNote,
          outreachStatus: "pending",
        },
      });
      return { action: "updated" as const, slug: dup.slug };
    }
    return { action: "skipped" as const, slug: dup.slug };
  }

  if (dryRun) return { action: "imported" as const, slug: "dry-run" };

  const slugBase = `${slugify(data.name)}-${slugify(data.cityName)}-${data.postalCode ?? "in"}`;
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 7)}`;
  const created = await prisma.dealership.create({
    data: {
      slug,
      name: data.name.slice(0, 120),
      countryId,
      cityName: data.cityName,
      stateName: data.stateName,
      address: data.address.slice(0, 500),
      postalCode: data.postalCode,
      phone: data.phone,
      email: data.email,
      emailSource: data.email ? data.source : null,
      status: "ACTIVE",
      category: "NEW_VEHICLE",
      outreachStatus: "pending",
      outreachNotes: data.sourceNote,
    },
  });

  return { action: "imported" as const, slug: created.slug };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const folder = process.argv.find((a) => a.startsWith("--folder="))?.split("=")[1] ?? DEFAULT_FOLDER;

  console.log("📄 DealerVoice PDF contact import");
  console.log(`   Folder: ${folder}`);
  if (dryRun) console.log("   Mode: DRY RUN");

  const autoPath = path.join(folder, AUTO_PDF);
  const garagePath = path.join(folder, GARAGE_PDF);

  if (!existsSync(autoPath)) throw new Error(`Missing ${autoPath}`);
  if (!existsSync(garagePath)) throw new Error(`Missing ${garagePath}`);

  const { country, index } = await loadIndiaDealerIndex(prisma);

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  const autoText = pdfToText(autoPath);
  const autoRows = parseAutomobileDealersPdf(autoText);
  console.log(`   Automobile-Dealers.pdf: ${autoRows.length} rows parsed`);

  for (const row of autoRows) {
    const result = await upsertDealer(
      {
        name: row.name,
        cityName: row.cityName,
        stateName: row.stateName,
        address: row.address,
        postalCode: row.postalCode,
        phone: row.phone,
        email: row.email,
        source: "pdf-automobile-dealers",
        sourceNote: "Imported from Automobile-Dealers.pdf (Desktop Dealership Contacts)",
      },
      country.id,
      index,
      dryRun,
    );
    if (result.action === "imported") imported++;
    else if (result.action === "updated") updated++;
    else skipped++;
  }

  const garageText = pdfToText(garagePath);
  const garageRows = parseCashlessGaragesPdf(garageText);
  console.log(`   Cashless-Garages.pdf: ${garageRows.length} rows parsed`);

  for (const row of garageRows) {
    const phone = row.mobile ?? row.phone;
    const result = await upsertDealer(
      {
        name: row.name,
        cityName: row.cityName,
        stateName: row.stateName,
        address: row.address,
        postalCode: null,
        phone,
        email: row.email,
        source: "pdf-cashless-garages",
        sourceNote: "Imported from Cashless-Garages-Pan-India-List-new.pdf",
      },
      country.id,
      index,
      dryRun,
    );
    if (result.action === "imported") imported++;
    else if (result.action === "updated") updated++;
    else skipped++;
  }

  if (!dryRun && imported > 0) {
    await prisma.country.update({
      where: { id: country.id },
      data: { dealerCount: { increment: imported } },
    }).catch(() => {});
  }

  console.log("\n✅ PDF import summary");
  console.log(`   New:     ${imported}`);
  console.log(`   Updated: ${updated} (email added to existing listing)`);
  console.log(`   Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
