import prisma from "@/lib/db";
import { usStateWhere } from "@/lib/outreach/regions";
import { chicagolandCityWhere } from "@/lib/geo/chicagoland";
import {
  extractEmailsFromText,
  isVendorEmail,
  normalizeWebsiteUrl,
  pickBestDealerEmail,
} from "@/lib/outreach/email-parse";
import {
  apifyEmailDiscoveryConfigured,
  discoverEmailsViaApify,
} from "@/lib/outreach/apify-email-discovery";
import { autoStartOutreachDrips } from "@/lib/outreach/drip";
import { logAdminJobRun } from "@/lib/admin/business-tracking";

const SCRAPE_PATHS = ["", "/contact", "/contact-us", "/about", "/about-us", "/team"];

const CONCURRENCY = 8;

export type DiscoverRegion = "chicagoland" | "illinois" | "all";

function regionWhere(region?: DiscoverRegion) {
  if (region === "chicagoland") return chicagolandCityWhere();
  if (region === "illinois") return usStateWhere("Illinois");
  return {};
}

async function discoverForWebsiteDirect(website: string): Promise<string | null> {
  const base = normalizeWebsiteUrl(website);
  const found: string[] = [];
  for (const path of SCRAPE_PATHS) {
    const emails = await fetchEmailsFromUrl(`${base.replace(/\/$/, "")}${path}`, website);
    found.push(...emails);
    const best = pickBestDealerEmail(found, website);
    if (best) return best;
  }
  return pickBestDealerEmail(found, website);
}

async function fetchEmailsFromUrl(url: string, website?: string): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "DealerVoice-EmailDiscovery/2.0", Accept: "text/html" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    return extractEmailsFromText(html, website);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function processBatch<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);
    results.push(...(await Promise.all(chunk.map(fn))));
  }
  return results;
}

type DealerRow = { id: string; name: string; website: string | null };

async function loadCandidates(opts: {
  region?: DiscoverRegion;
  state?: string;
  limit: number;
}) {
  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) return [];

  const regionFilter = opts.region ? regionWhere(opts.region) : opts.state ? usStateWhere(opts.state) : {};

  return prisma.dealership.findMany({
    where: {
      countryId: us.id,
      deletedAt: null,
      claimedAt: null,
      OR: [{ email: null }, { email: "" }],
      website: { not: null },
      NOT: { website: "" },
      ...regionFilter,
    },
    take: opts.limit,
    orderBy: [{ isFranchised: "desc" }, { cityName: "asc" }],
    select: { id: true, name: true, website: true },
  });
}

export async function discoverDealerEmailsBatch(opts: {
  state?: string;
  region?: DiscoverRegion;
  limit?: number;
  useApifyFallback?: boolean;
  apifyMaxUrls?: number;
  autoStartDrip?: boolean;
}) {
  const limit = opts.limit ?? 30;
  const dealers = await loadCandidates({ ...opts, limit });

  let directUpdated = 0;
  const failed: DealerRow[] = [];

  await processBatch(dealers, async (d) => {
    if (!d.website) return;
    const email = await discoverForWebsiteDirect(d.website);
    if (email && !isVendorEmail(email, d.website)) {
      await prisma.dealership.update({
        where: { id: d.id },
        data: { email, emailSource: "website" },
      });
      directUpdated++;
    } else {
      failed.push(d);
    }
  });

  let apifyUpdated = 0;
  let apifySkipped = false;
  const apifyMax = opts.apifyMaxUrls ?? 40;

  if (opts.useApifyFallback !== false && failed.length > 0 && apifyEmailDiscoveryConfigured()) {
    const batch = failed.slice(0, apifyMax);
    const APIFY_CHUNK = 15;
    for (let offset = 0; offset < batch.length; offset += APIFY_CHUNK) {
      const chunk = batch.slice(offset, offset + APIFY_CHUNK);
      const websites = chunk.map((d) => d.website!).filter(Boolean);
      try {
        const results = await discoverEmailsViaApify(websites);
        for (let i = 0; i < chunk.length; i++) {
          const email = results[i]?.email;
          const website = chunk[i].website;
          if (!email || isVendorEmail(email, website)) continue;
          await prisma.dealership.update({
            where: { id: chunk[i].id },
            data: { email, emailSource: "apify" },
          });
          apifyUpdated++;
        }
      } catch (err) {
        apifySkipped = true;
        console.error(`Apify fallback failed (chunk ${offset / APIFY_CHUNK + 1}):`, err);
      }
    }
  } else if (failed.length > 0 && !apifyEmailDiscoveryConfigured()) {
    apifySkipped = true;
  }

  let dripStarted = 0;
  if (opts.autoStartDrip && process.env.RESEND_API_KEY) {
    const drip = await autoStartOutreachDrips(Math.min(50, directUpdated + apifyUpdated), "US", "Illinois");
    dripStarted = drip.started;
  }

  return {
    scanned: dealers.length,
    directUpdated,
    apifyUpdated,
    totalUpdated: directUpdated + apifyUpdated,
    updated: directUpdated + apifyUpdated,
    directFailed: failed.length - apifyUpdated,
    apifyConfigured: apifyEmailDiscoveryConfigured(),
    apifySkipped,
    dripStarted,
    state: opts.state ?? opts.region ?? "all",
  };
}

export async function runIllinoisEmailDiscoveryJob(opts?: {
  limit?: number;
  apifyMaxUrls?: number;
  actorUserId?: string;
}) {
  const result = await discoverDealerEmailsBatch({
    region: "illinois",
    limit: opts?.limit ?? 120,
    useApifyFallback: true,
    apifyMaxUrls: opts?.apifyMaxUrls ?? 40,
    autoStartDrip: true,
  });

  await logAdminJobRun({
    jobType: "EMAIL_DISCOVERY",
    summary: `IL email discovery — ${result.totalUpdated} updated (${result.directUpdated} direct, ${result.apifyUpdated} Apify)`,
    payload: result,
    actorUserId: opts?.actorUserId,
    status: result.totalUpdated === 0 && result.scanned > 0 ? "PARTIAL" : "SUCCESS",
  });

  return result;
}

const OUTREACH_RESET = {
  outreachDripStep: 0,
  outreachDripActive: false,
  outreachStatus: null as string | null,
  lastOutreachAt: null as Date | null,
  nextOutreachAt: null as Date | null,
  outreachDripStartedAt: null as Date | null,
};

/** Clear vendor/platform emails and optionally re-scrape dealer websites. */
export async function remediateVendorEmails(opts?: {
  limit?: number;
  rediscover?: boolean;
  autoStartDrip?: boolean;
}) {
  const limit = opts?.limit ?? 200;
  const dealers = await prisma.dealership.findMany({
    where: { deletedAt: null, email: { not: null }, NOT: { email: "" } },
    select: {
      id: true,
      name: true,
      email: true,
      website: true,
      outreachDripStep: true,
    },
  });

  const flagged = dealers.filter((d) => d.email && isVendorEmail(d.email, d.website)).slice(0, limit);

  let cleared = 0;
  let rediscovered = 0;
  let stillVendor = 0;

  for (const d of flagged) {
    await prisma.dealership.update({
      where: { id: d.id },
      data: {
        email: null,
        emailSource: null,
        ...(d.outreachDripStep > 0 ? OUTREACH_RESET : {}),
      },
    });
    cleared++;

    if (!opts?.rediscover || !d.website) continue;

    let email = await discoverForWebsiteDirect(d.website);
    if (!email && apifyEmailDiscoveryConfigured()) {
      try {
        const [result] = await discoverEmailsViaApify([d.website]);
        email = result?.email ?? null;
      } catch {
        /* Apify optional */
      }
    }

    if (email && !isVendorEmail(email, d.website)) {
      await prisma.dealership.update({
        where: { id: d.id },
        data: { email, emailSource: "website" },
      });
      rediscovered++;
    } else if (email && isVendorEmail(email, d.website)) {
      stillVendor++;
    }
  }

  let dripStarted = 0;
  if (opts?.autoStartDrip && rediscovered > 0 && process.env.RESEND_API_KEY) {
    const drip = await autoStartOutreachDrips(Math.min(20, rediscovered), "US");
    dripStarted = drip.started;
  }

  const summary = `Vendor email remediation — ${cleared} cleared, ${rediscovered} re-discovered`;
  await logAdminJobRun({
    jobType: "EMAIL_DISCOVERY",
    summary,
    payload: { cleared, rediscovered, stillVendor, flagged: flagged.length, dripStarted },
  });

  return { flagged: flagged.length, cleared, rediscovered, stillVendor, dripStarted, dealers: flagged.map((d) => d.name) };
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
