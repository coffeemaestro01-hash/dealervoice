/**
 * Admitad affiliate deep links — https://www.admitad.com/en/webmaster/
 * Format: https://ad.admitad.com/g/{campaignId}/?ulp={encodedDestination}&subid={optional}
 */

export const ADMITAD_HOST = "ad.admitad.com";

export function isAdmitadMode(param: string | null | undefined): boolean {
  if (!param) return false;
  const p = param.trim().toLowerCase();
  return p === "admitad" || p === "admitad_g" || p === "g";
}

/** Admitad program / advcampaign id from your Admitad dashboard. */
export function buildAdmitadLink(
  campaignId: string,
  destinationUrl: string,
  subid?: string | null
): string {
  const id = campaignId.trim();
  if (!id || destinationUrl.startsWith("/")) return destinationUrl;

  try {
    const ulp = encodeURIComponent(destinationUrl);
    let link = `https://${ADMITAD_HOST}/g/${id}/?ulp=${ulp}`;
    const sub = subid?.trim() || process.env.ADMITAD_SUBID?.trim();
    if (sub) link += `&subid=${encodeURIComponent(sub)}`;
    return link;
  } catch {
    return destinationUrl;
  }
}

export function isAdmitadRedirectUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === ADMITAD_HOST || host.endsWith(".admitad.com");
  } catch {
    return false;
  }
}
