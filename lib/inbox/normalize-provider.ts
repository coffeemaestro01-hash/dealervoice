import type { InboxEmailProvider } from "@prisma/client";

/** Map free-text / AI output to Prisma enum — invalid values become null. */
export function normalizeInboxProvider(raw: string | null | undefined): InboxEmailProvider | null {
  if (!raw) return null;
  const s = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (s.includes("GMAIL") || s.includes("GOOGLE")) return "GMAIL";
  if (s.includes("MICROSOFT") || s.includes("OUTLOOK") || s.includes("OFFICE") || s.includes("365"))
    return "MICROSOFT";
  if (s.includes("IMAP") || s.includes("SMTP")) return "IMAP";
  if (s.includes("FORWARD")) return "FORWARDING";
  if (s === "OTHER") return "OTHER";
  return null;
}

export function detectProviderFromText(text: string): InboxEmailProvider | null {
  const lower = text.toLowerCase();
  if (/gmail|google workspace/.test(lower)) return "GMAIL";
  if (/microsoft|office 365|outlook|o365|365/.test(lower)) return "MICROSOFT";
  if (/imap|smtp|hostinger|godaddy email|c panel/.test(lower)) return "IMAP";
  if (/forward|alias|redirect/.test(lower)) return "FORWARDING";
  return null;
}
