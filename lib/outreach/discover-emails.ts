import prisma from "@/lib/db";
import { usStateWhere } from "@/lib/outreach/regions";
import { chicagolandCityWhere } from "@/lib/geo/chicagoland";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SKIP_LOCAL = ["noreply", "no-reply", "donotreply", "privacy", "abuse", "postmaster", "you", "user"];
const SKIP_EMAIL_FRAGMENTS = ["sentry.io", "wixpress.com", "cloudflare.com", "schema.org", "example.com", "email.com"];
const SKIP_EXACT = new Set(["you@email.com", "user@domain.com", "name@example.com"]);

const SCRAPE_PATHS = [
  "",
  "/contact",
  "/contact-us",
  "/about",
  "/about-us",
  "/team",
  "/contact.html",
  "/about.html",
];

const CONCURRENCY = 8;

function isUsableEmail(email: string) {
  const e = email.toLowerCase();
  if (SKIP_EXACT.has(e)) return false;
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(e)) return false;
  if (SKIP_LOCAL.some((s) => e.startsWith(s))) return false;
  if (SKIP_EMAIL_FRAGMENTS.some((f) => e.includes(f))) return false;
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(e)) return false;
  return true;
}

function normalizeWebsite(url: string) {
  const trimmed = url.trim();
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function pickBestEmail(emails: string[]) {
  const scored = emails
    .map((e) => e.toLowerCase())
    .filter(isUsableEmail)
    .map((e) => ({
      e,
      score:
        (e.includes("sales") ? 4 : 0) +
        (e.includes("info") ? 3 : 0) +
        (e.includes("contact") ? 3 : 0) +
        (e.includes("service") ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.e ?? null;
}

async function fetchEmailsFromUrl(url: string): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "DealerVoice-EmailDiscovery/2.0", Accept: "text/html" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    return [...new Set(html.match(EMAIL_REGEX) ?? [])];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function discoverForWebsite(website: string) {
  const base = normalizeWebsite(website);
  const found: string[] = [];
  for (const path of SCRAPE_PATHS) {
    const emails = await fetchEmailsFromUrl(`${base.replace(/\/$/, "")}${path}`);
    found.push(...emails);
    const best = pickBestEmail(found);
    if (best) return best;
  }
  return pickBestEmail(found);
}

async function processBatch<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

export type DiscoverRegion = "chicagoland" | "illinois" | "all";

function regionWhere(region?: DiscoverRegion) {
  if (region === "chicagoland") return chicagolandCityWhere();
  if (region === "illinois") return usStateWhere("Illinois");
  return {};
}

export async function discoverDealerEmailsBatch(opts: {
  state?: string;
  region?: DiscoverRegion;
  limit?: number;
}) {
  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) return { scanned: 0, updated: 0 };

  const regionFilter = opts.region ? regionWhere(opts.region) : opts.state ? usStateWhere(opts.state) : {};

  const dealers = await prisma.dealership.findMany({
    where: {
      countryId: us.id,
      deletedAt: null,
      claimedAt: null,
      OR: [{ email: null }, { email: "" }],
      website: { not: null },
      NOT: { website: "" },
      ...regionFilter,
    },
    take: opts.limit ?? 30,
    orderBy: [{ isFranchised: "desc" }, { cityName: "asc" }],
    select: { id: true, name: true, website: true },
  });

  let updated = 0;
  await processBatch(dealers, async (d) => {
    if (!d.website) return;
    const email = await discoverForWebsite(d.website);
    if (!email) return;
    await prisma.dealership.update({
      where: { id: d.id },
      data: { email, emailSource: "website" },
    });
    updated++;
  });

  return {
    scanned: dealers.length,
    updated,
    state: opts.state ?? opts.region ?? "all",
  };
}

export async function getOutreachDripStats() {
  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) {
    return { withEmail: 0, dripActive: 0, dripComplete: 0, notStarted: 0, illinoisWithEmail: 0 };
  }

  const base = { countryId: us.id, deletedAt: null, claimedAt: null };
  const [withEmail, dripActive, dripComplete, notStarted, illinoisWithEmail] = await Promise.all([
    prisma.dealership.count({
      where: { ...base, email: { not: null }, NOT: { email: "" } },
    }),
    prisma.dealership.count({ where: { ...base, outreachDripActive: true } }),
    prisma.dealership.count({ where: { ...base, outreachDripStep: { gte: 3 } } }),
    prisma.dealership.count({
      where: {
        ...base,
        outreachDripStep: 0,
        email: { not: null },
        NOT: { email: "" },
      },
    }),
    prisma.dealership.count({
      where: {
        ...base,
        ...usStateWhere("Illinois"),
        email: { not: null },
        NOT: { email: "" },
      },
    }),
  ]);

  return { withEmail, dripActive, dripComplete, notStarted, illinoisWithEmail };
}
