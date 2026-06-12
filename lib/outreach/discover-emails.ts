import prisma from "@/lib/db";
import { usStateWhere } from "@/lib/outreach/regions";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SKIP_LOCAL = ["noreply", "no-reply", "donotreply", "privacy", "abuse", "postmaster"];

function normalizeWebsite(url: string) {
  const trimmed = url.trim();
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function pickBestEmail(emails: string[]) {
  const scored = emails
    .map((e) => e.toLowerCase())
    .filter((e) => !SKIP_LOCAL.some((s) => e.startsWith(s)))
    .map((e) => ({
      e,
      score: (e.includes("sales") ? 3 : 0) + (e.includes("info") ? 2 : 0) + (e.includes("contact") ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.e ?? null;
}

async function fetchEmailsFromUrl(url: string): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "DealerVoice-EmailDiscovery/1.0", Accept: "text/html" },
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
  for (const path of ["", "/contact", "/contact-us", "/about"]) {
    const emails = await fetchEmailsFromUrl(`${base.replace(/\/$/, "")}${path}`);
    const best = pickBestEmail(emails);
    if (best) return best;
  }
  return null;
}

export async function discoverDealerEmailsBatch(opts: { state?: string; limit?: number }) {
  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) return { scanned: 0, updated: 0 };

  const dealers = await prisma.dealership.findMany({
    where: {
      countryId: us.id,
      deletedAt: null,
      claimedAt: null,
      OR: [{ email: null }, { email: "" }],
      website: { not: null },
      NOT: { website: "" },
      ...(opts.state ? usStateWhere(opts.state) : {}),
    },
    take: opts.limit ?? 30,
    select: { id: true, name: true, website: true },
  });

  let updated = 0;
  for (const d of dealers) {
    if (!d.website) continue;
    const email = await discoverForWebsite(d.website);
    if (!email) continue;
    await prisma.dealership.update({
      where: { id: d.id },
      data: { email, emailSource: "website" },
    });
    updated++;
  }

  return { scanned: dealers.length, updated, state: opts.state ?? "all" };
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
