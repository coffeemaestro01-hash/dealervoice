import {
  extractEmailsFromText,
  normalizeWebsiteUrl,
  pickBestDealerEmail,
} from "@/lib/outreach/email-parse";

const ACTOR_ID = "jurassic_jove~website-email-extractor";

export type ApifyEmailResult = {
  url: string;
  email: string | null;
  rawEmails?: string[];
};

function apifyToken(): string | null {
  return process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN || null;
}

async function waitForRun(token: string, runId: string, maxWaitMs: number) {
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
    if (!res.ok) throw new Error(`Apify run status failed: ${res.status}`);
    const json = (await res.json()) as { data: { status: string; defaultDatasetId?: string } };
    const status = json.data.status;
    if (status === "SUCCEEDED") return json.data.defaultDatasetId ?? null;
    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
      throw new Error(`Apify run ${status}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Apify run timed out waiting for completion");
}

async function fetchDatasetItems(token: string, datasetId: string) {
  const res = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&format=json&clean=true&limit=500`
  );
  if (!res.ok) throw new Error(`Apify dataset fetch failed: ${res.status}`);
  return (await res.json()) as Record<string, unknown>[];
}

function emailFromApifyItem(item: Record<string, unknown>, websiteUrl?: string): string | null {
  const emails = item.emails;
  if (Array.isArray(emails) && emails.length) {
    const list = emails.map(String);
    return pickBestDealerEmail(list, websiteUrl);
  }
  const email = item.email;
  if (typeof email === "string" && email.includes("@")) {
    return pickBestDealerEmail([email], websiteUrl);
  }
  const text = [item.markdown, item.text, item.html, item.content]
    .filter((v) => typeof v === "string")
    .join("\n");
  if (text) return pickBestDealerEmail(extractEmailsFromText(text, websiteUrl), websiteUrl);
  return null;
}

/** Batch extract emails via Apify Playwright actor (JS-heavy dealer sites). */
export async function discoverEmailsViaApify(
  websites: string[],
  opts?: { maxConcurrency?: number; timeoutPerUrl?: number; maxWaitMs?: number }
): Promise<ApifyEmailResult[]> {
  const token = apifyToken();
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not configured");
  }
  if (websites.length === 0) return [];

  const urls = websites.map(normalizeWebsiteUrl);
  const timeoutPerUrl = opts?.timeoutPerUrl ?? 25;
  const maxConcurrency = opts?.maxConcurrency ?? 3;
  const batches = Math.ceil(urls.length / maxConcurrency);
  const maxWaitMs =
    opts?.maxWaitMs ??
    Math.min(1_800_000, Math.max(180_000, batches * timeoutPerUrl * 1000 * 2 + 120_000));

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls,
        scrapeEmails: true,
        scrapePhones: false,
        scrapeSocials: false,
        followLinkPages: false,
        maxConcurrency,
        timeoutPerUrl,
      }),
    }
  );
  if (!runRes.ok) {
    const err = await runRes.text();
    throw new Error(`Apify start failed: ${runRes.status} ${err.slice(0, 200)}`);
  }

  const runJson = (await runRes.json()) as { data: { id: string; defaultDatasetId?: string } };
  const datasetId = await waitForRun(token, runJson.data.id, maxWaitMs);
  if (!datasetId) throw new Error("Apify run missing dataset");

  const items = await fetchDatasetItems(token, datasetId);
  const byUrl = new Map<string, ApifyEmailResult>();

  for (const item of items) {
    const url =
      (typeof item.url === "string" && item.url) ||
      (typeof item.inputUrl === "string" && item.inputUrl) ||
      (typeof item.website === "string" && item.website) ||
      "";
    if (!url) continue;
    byUrl.set(url, {
      url,
      email: emailFromApifyItem(item, url),
      rawEmails: Array.isArray(item.emails) ? item.emails.map(String) : undefined,
    });
  }

  return urls.map((url) => byUrl.get(url) ?? { url, email: null });
}

export function apifyEmailDiscoveryConfigured(): boolean {
  return !!apifyToken();
}
