/** Merge admin-pasted affiliate ref into outbound ad URL. */
export function resolveAdHref(
  baseHref: string,
  affiliateRef?: string | null,
  affiliateParam?: string | null
): string {
  if (!affiliateRef?.trim() || baseHref.startsWith("/")) return baseHref;
  try {
    const url = new URL(baseHref);
    const param = affiliateParam?.trim() || "utm_content";
    url.searchParams.set(param, affiliateRef.trim());
    return url.toString();
  } catch {
    return baseHref;
  }
}
