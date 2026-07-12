const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const SKIP_LOCAL = ["noreply", "no-reply", "donotreply", "privacy", "abuse", "postmaster", "you", "user"];
const SKIP_EMAIL_FRAGMENTS = [
  "sentry.io",
  "wixpress.com",
  "cloudflare.com",
  "schema.org",
  "example.com",
  "email.com",
  "domain.com",
  "ingest.sentry.io",
];
const SKIP_EXACT = new Set([
  "you@email.com",
  "user@domain.com",
  "name@example.com",
  "email@example.com",
]);

/** Website vendors, OEM portals, and helpdesks — not dealer decision-makers. */
const VENDOR_DOMAIN_FRAGMENTS = [
  "pixelmotion.com",
  "dealer.com",
  "dealeron.com",
  "dealerinspire.com",
  "dealerfire.com",
  "dealerweb",
  "fusionzone",
  "teamvelocity",
  "cdkglobal.com",
  "vinsolutions.com",
  "carsforsale.com",
  "sincro.com",
  "hireology.com",
  "autofusion",
  "ansira.com",
  "c-4analytics.com",
  "sokal.ai",
  "zoho.com",
  "zohodesk",
  "baldealer.com",
  "gmidealer.com",
  "forddirect.com",
  "shiftdigital.com",
  "dealertrack.com",
  "autodata.net",
  "dealereprocess.com",
  "chatlead.com",
  "automarketingteam.com",
  "edealerhub.com",
  "udcnet.com",
  "istudiosg.com",
  "host.udcnet.com",
];

const VENDOR_LOCAL_PREFIXES = ["support@", "help@", "webmaster@", "hostmaster@", "tickets@", "helpdesk@"];

function emailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function emailLocal(email: string): string {
  return email.split("@")[0]?.toLowerCase() ?? "";
}

/** Registrable-ish host from a website URL (www.jimbaier.net → jimbaier.net). */
export function websiteHostFromUrl(websiteUrl?: string | null): string | null {
  if (!websiteUrl?.trim()) return null;
  try {
    const host = new URL(normalizeWebsiteUrl(websiteUrl)).hostname.toLowerCase();
    return host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function domainMatchesWebsite(email: string, websiteUrl?: string | null): boolean {
  const host = websiteHostFromUrl(websiteUrl);
  if (!host) return false;
  const domain = emailDomain(email);
  return domain === host || domain.endsWith(`.${host}`) || host.endsWith(domain);
}

export function isVendorEmail(email: string, websiteUrl?: string | null): boolean {
  const e = email.toLowerCase();
  const domain = emailDomain(e);
  const local = emailLocal(e);

  if (VENDOR_DOMAIN_FRAGMENTS.some((frag) => domain.includes(frag.replace(/\s/g, "")))) {
    return true;
  }

  if (VENDOR_LOCAL_PREFIXES.some((prefix) => e.startsWith(prefix)) && !domainMatchesWebsite(e, websiteUrl)) {
    return true;
  }

  // Portal-style locals on vendor-ish domains (a12345@dealer.com)
  if (/^a\d+@/.test(e) && VENDOR_DOMAIN_FRAGMENTS.some((frag) => domain.includes(frag.split(".")[0]))) {
    return true;
  }

  // Email domain clearly not the dealer site and looks like a platform inbox
  const host = websiteHostFromUrl(websiteUrl);
  if (host && !domainMatchesWebsite(e, websiteUrl)) {
    if (local.includes("support") || local.includes("helpdesk") || local.includes("website")) {
      return true;
    }
  }

  // Corporate foundation / lead-routing inboxes, not GMs
  if ((local.includes("foundation") || local.startsWith("leads")) && !domainMatchesWebsite(e, websiteUrl)) {
    return true;
  }

  return false;
}

export function isUsableDealerEmail(email: string, websiteUrl?: string | null): boolean {
  const e = email.toLowerCase();
  if (SKIP_EXACT.has(e)) return false;
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(e)) return false;
  if (SKIP_LOCAL.some((s) => e.startsWith(s))) return false;
  if (SKIP_EMAIL_FRAGMENTS.some((f) => e.includes(f))) return false;
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(e)) return false;
  if (isVendorEmail(e, websiteUrl)) return false;
  return true;
}

export function extractEmailsFromText(text: string, websiteUrl?: string | null): string[] {
  return [...new Set((text.match(EMAIL_REGEX) ?? []).filter((e) => isUsableDealerEmail(e, websiteUrl)))];
}

export function pickBestDealerEmail(emails: string[], websiteUrl?: string | null): string | null {
  const scored = emails
    .map((e) => e.toLowerCase())
    .filter((e) => isUsableDealerEmail(e, websiteUrl))
    .map((e) => ({
      e,
      score:
        (domainMatchesWebsite(e, websiteUrl) ? 20 : 0) +
        (e.includes("sales") ? 4 : 0) +
        (e.includes("info") ? 3 : 0) +
        (e.includes("contact") ? 3 : 0) +
        (e.includes("gm@") || e.startsWith("gm@") ? 5 : 0) +
        (e.includes("general") ? 2 : 0) +
        (e.includes("service") ? 2 : 0) +
        (e.includes("marketing") ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.e ?? null;
}

export function normalizeWebsiteUrl(url: string): string {
  const trimmed = url.trim();
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}
