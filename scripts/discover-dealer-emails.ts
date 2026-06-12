/**
 * Discover public emails from dealer websites (Chicago / Illinois priority).
 * Usage: npm run outreach:discover-emails [-- --limit 50] [-- --state Illinois]
 */

import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();
const prisma = new PrismaClient();

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SKIP_DOMAINS = ["example.com", "sentry.io", "wixpress.com", "cloudflare.com", "schema.org"];
const SKIP_LOCAL = ["noreply", "no-reply", "donotreply", "privacy", "abuse", "postmaster"];

function parseArgs() {
  const args = process.argv.slice(2);
  const limit = Number(args[args.indexOf("--limit") + 1] ?? 40);
  const state = args.includes("--state") ? args[args.indexOf("--state") + 1] : "Illinois";
  const dryRun = args.includes("--dry-run");
  return { limit, state, dryRun };
}

function normalizeWebsite(url: string) {
  const trimmed = url.trim();
  if (trimmed.startsWith("http")) return trimmed;
  return `https://${trimmed}`;
}

function pickBestEmail(emails: string[]) {
  const scored = emails
    .map((e) => e.toLowerCase())
    .filter((e) => !SKIP_LOCAL.some((s) => e.startsWith(s)))
    .filter((e) => !SKIP_DOMAINS.some((d) => e.endsWith(`@${d}`)))
    .map((e) => {
      let score = 0;
      if (e.includes("sales")) score += 3;
      if (e.includes("info")) score += 2;
      if (e.includes("contact")) score += 2;
      if (e.includes("service")) score += 1;
      return { e, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.e ?? null;
}

async function fetchEmailsFromUrl(url: string): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "DealerVoice-EmailDiscovery/1.0 (+https://dealervoice.io)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = html.match(EMAIL_REGEX) ?? [];
    return [...new Set(matches)];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function discoverForWebsite(website: string) {
  const base = normalizeWebsite(website);
  const paths = ["", "/contact", "/contact-us", "/about", "/about-us"];
  const found = new Set<string>();
  for (const path of paths) {
    const emails = await fetchEmailsFromUrl(`${base.replace(/\/$/, "")}${path}`);
    emails.forEach((e) => found.add(e));
    if (found.size >= 3) break;
  }
  return pickBestEmail([...found]);
}

async function main() {
  const { limit, state, dryRun } = parseArgs();

  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) throw new Error("US country not found");

  const dealers = await prisma.dealership.findMany({
    where: {
      countryId: us.id,
      deletedAt: null,
      claimedAt: null,
      OR: [{ email: null }, { email: "" }],
      website: { not: null },
      NOT: { website: "" },
      ...(state ? { stateName: { contains: state, mode: "insensitive" } } : {}),
    },
    take: limit,
    orderBy: { cityName: "asc" },
    select: { id: true, name: true, website: true, cityName: true, stateName: true },
  });

  console.log(`Scanning ${dealers.length} dealers in ${state}…${dryRun ? " (dry run)" : ""}\n`);

  let updated = 0;
  for (const d of dealers) {
    if (!d.website) continue;
    const email = await discoverForWebsite(d.website);
    if (!email) {
      console.log(`  — ${d.name}: no email found`);
      continue;
    }
    console.log(`  ✓ ${d.name} (${d.cityName}): ${email}`);
    if (!dryRun) {
      await prisma.dealership.update({
        where: { id: d.id },
        data: { email, emailSource: "website" },
      });
      updated++;
    }
  }

  console.log(`\nDone. ${updated} emails saved.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
