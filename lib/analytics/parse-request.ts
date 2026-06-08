import UAParser from "ua-parser-js";

export interface ParsedRequestMeta {
  ipAddress: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

export function parseIp(req: { headers: { get: (k: string) => string | null } }): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip")?.trim() ?? null;
}

export function parseUserAgent(ua: string | null): Pick<ParsedRequestMeta, "device" | "browser" | "os"> {
  if (!ua) return { device: null, browser: null, os: null };
  const parsed = new UAParser(ua).getResult();
  const device = parsed.device.type ?? "desktop";
  const browser = parsed.browser.name ? `${parsed.browser.name}${parsed.browser.version ? ` ${parsed.browser.version}` : ""}` : null;
  const os = parsed.os.name ? `${parsed.os.name}${parsed.os.version ? ` ${parsed.os.version}` : ""}` : null;
  return { device, browser, os };
}

export function parseGeoHeaders(req: { headers: { get: (k: string) => string | null } }): Pick<ParsedRequestMeta, "country" | "region" | "city"> {
  return {
    country: req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? null,
    region: req.headers.get("x-vercel-ip-country-region") ?? null,
    city: req.headers.get("x-vercel-ip-city") ?? null,
  };
}

export function parseUtm(searchParams: URLSearchParams): Pick<ParsedRequestMeta, "utmSource" | "utmMedium" | "utmCampaign"> {
  return {
    utmSource: searchParams.get("utm_source"),
    utmMedium: searchParams.get("utm_medium"),
    utmCampaign: searchParams.get("utm_campaign"),
  };
}

export function buildRequestMeta(
  req: { headers: { get: (k: string) => string | null } },
  referrer?: string | null,
  searchParams?: URLSearchParams
): ParsedRequestMeta {
  const ua = req.headers.get("user-agent");
  const { device, browser, os } = parseUserAgent(ua);
  const geo = parseGeoHeaders(req);
  const utm = searchParams ? parseUtm(searchParams) : { utmSource: null, utmMedium: null, utmCampaign: null };
  return {
    ipAddress: parseIp(req),
    referrer: referrer ?? req.headers.get("referer"),
    device,
    browser,
    os,
    ...geo,
    ...utm,
  };
}
