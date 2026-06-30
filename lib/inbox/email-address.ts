/** Per-dealership ingest address on Resend receiving domain (e.g. inbox-{slug}@mail.dealervoice.io). */

export function getInboxInboundDomain(): string {
  return process.env.INBOX_INBOUND_DOMAIN || "mail.dealervoice.io";
}

export function buildInboxInboundAddress(dealershipSlug: string): string {
  const safe = dealershipSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `inbox-${safe || "dealer"}@${getInboxInboundDomain()}`;
}

/** Extract dealership slug token from an ingest address local part. */
export function parseSlugFromInboundAddress(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at === -1) return null;
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  if (domain !== getInboxInboundDomain().toLowerCase()) return null;
  if (!local.startsWith("inbox-")) return null;
  const slug = local.slice("inbox-".length);
  return slug || null;
}

export function parseTicketNumberFromSubject(subject: string): number | null {
  const match = subject.match(/\[DV-(\d{6})\]/i);
  if (!match) return null;
  return parseInt(match[1], 10);
}
