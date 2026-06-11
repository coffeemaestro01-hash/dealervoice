/**
 * Admitad API client — OAuth2 client credentials.
 * @see https://developers.admitad.com/
 */

import { buildAdmitadLink } from "./admitad";

const TOKEN_URL = "https://api.admitad.com/token/";
const API_BASE = "https://api.admitad.com";

type TokenCache = { accessToken: string; expiresAt: number };
let cache: TokenCache | null = null;

function credentials(): { id: string; secret: string } | null {
  const id = process.env.ADMITAD_CLIENT_ID?.trim();
  const secret = process.env.ADMITAD_CLIENT_SECRET?.trim();
  if (!id || !secret) return null;
  return { id, secret };
}

export function isAdmitadConfigured(): boolean {
  return credentials() !== null;
}

export async function getAdmitadAccessToken(): Promise<string | null> {
  const creds = credentials();
  if (!creds) return null;

  if (cache && cache.expiresAt > Date.now() + 60_000) {
    return cache.accessToken;
  }

  const basic = Buffer.from(`${creds.id}:${creds.secret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "advcampaigns advcampaigns_for_website",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[admitad] token error", res.status, err.slice(0, 200));
    return null;
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cache.accessToken;
}

export type AdmitadProgram = {
  id: number;
  name: string;
  status: string;
  site_url: string;
  goto_cookie_lifetime: number;
};

export async function listAdmitadPrograms(limit = 50): Promise<AdmitadProgram[]> {
  const token = await getAdmitadAccessToken();
  if (!token) return [];

  const websiteId = process.env.ADMITAD_WEBSITE_ID?.trim();
  const path = websiteId
    ? `/advcampaigns/website/${websiteId}/?limit=${limit}`
    : `/advcampaigns/?limit=${limit}`;

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("[admitad] programs error", res.status);
    return [];
  }

  const data = (await res.json()) as { results?: AdmitadProgram[] };
  return data.results ?? [];
}

export function admitadDeeplink(programId: number | string, landingUrl: string, subid?: string) {
  return buildAdmitadLink(String(programId), landingUrl, subid);
}
