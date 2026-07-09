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

export function isUsableDealerEmail(email: string): boolean {
  const e = email.toLowerCase();
  if (SKIP_EXACT.has(e)) return false;
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(e)) return false;
  if (SKIP_LOCAL.some((s) => e.startsWith(s))) return false;
  if (SKIP_EMAIL_FRAGMENTS.some((f) => e.includes(f))) return false;
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(e)) return false;
  return true;
}

export function extractEmailsFromText(text: string): string[] {
  return [...new Set((text.match(EMAIL_REGEX) ?? []).filter(isUsableDealerEmail))];
}

export function pickBestDealerEmail(emails: string[]): string | null {
  const scored = emails
    .map((e) => e.toLowerCase())
    .filter(isUsableDealerEmail)
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

export function normalizeWebsiteUrl(url: string): string {
  const trimmed = url.trim();
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}
