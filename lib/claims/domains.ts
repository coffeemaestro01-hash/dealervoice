/** Extract normalized hostname from email or URL. */
export function normalizeDomain(input: string): string | null {
  try {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return null;
    if (trimmed.includes("@")) {
      return trimmed.split("@")[1]?.replace(/^www\./, "") ?? null;
    }
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function domainsMatch(a: string, b: string): boolean {
  const da = normalizeDomain(a);
  const db = normalizeDomain(b);
  if (!da || !db) return false;
  return da === db || da.endsWith(`.${db}`) || db.endsWith(`.${da}`);
}

/** Domain-match auto-approve, or all claims when CLAIM_AUTO_APPROVE_ALL=true. */
export function shouldAutoApproveClaim(
  businessEmail: string,
  dealership: { website?: string | null; email?: string | null }
): boolean {
  if (process.env.CLAIM_AUTO_APPROVE_ALL === "true") return true;
  // PlatformSetting checked at runtime in API if needed; env is fallback

  const claimDomain = normalizeDomain(businessEmail);
  if (!claimDomain) return false;

  for (const source of [dealership.website, dealership.email]) {
    if (!source) continue;
    if (domainsMatch(businessEmail, source)) return true;
  }
  return false;
}
