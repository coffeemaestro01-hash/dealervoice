/**
 * Admitad affiliate deep links — https://www.admitad.com/en/webmaster/
 * Format: https://ad.admitad.com/g/{campaignId}/?ulp={encodedDestination}&subid={optional}
 */

import { AFFILIATE_TRACKER_DOMAINS } from "@/lib/geo/market";

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
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === ADMITAD_HOST || host.endsWith(".admitad.com")) return true;
    if (AFFILIATE_TRACKER_DOMAINS.includes(host) && /^\/g\/[\w-]+\/?$/i.test(u.pathname)) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
