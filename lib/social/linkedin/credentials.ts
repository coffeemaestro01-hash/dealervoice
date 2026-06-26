import prisma from "@/lib/db";

const KEYS = {
  accessToken: "linkedin.access_token",
  refreshToken: "linkedin.refresh_token",
  expiresAt: "linkedin.expires_at",
  organizationId: "linkedin.organization_id",
  scopes: "linkedin.scopes",
  connectedAt: "linkedin.connected_at",
  connectedBy: "linkedin.connected_by",
} as const;

export type LinkedInCredentials = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  organizationId: string;
  scopes?: string;
};

async function readSetting(key: string): Promise<string | undefined> {
  const row = await prisma.platformSetting.findUnique({ where: { key } });
  if (!row?.value) return undefined;
  if (typeof row.value === "string") return row.value;
  if (typeof row.value === "number") return String(row.value);
  return undefined;
}

export async function getLinkedInCredentials(): Promise<LinkedInCredentials | null> {
  const envToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const envOrg = process.env.LINKEDIN_ORGANIZATION_ID?.replace(/^urn:li:organization:/, "");
  if (envToken && envOrg) {
    return { accessToken: envToken, organizationId: envOrg };
  }

  const accessToken = await readSetting(KEYS.accessToken);
  const organizationId = (await readSetting(KEYS.organizationId))?.replace(/^urn:li:organization:/, "");
  if (!accessToken || !organizationId) return null;

  const expiresAtRaw = await readSetting(KEYS.expiresAt);
  const refreshToken = await readSetting(KEYS.refreshToken);
  const scopes = await readSetting(KEYS.scopes);

  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAtRaw ? Number(expiresAtRaw) : undefined,
    organizationId,
    scopes,
  };
}

export async function saveLinkedInCredentials(
  creds: LinkedInCredentials & { connectedBy?: string }
) {
  const orgId = creds.organizationId.replace(/^urn:li:organization:/, "");
  const entries: Array<{ key: string; value: string; updatedBy?: string }> = [
    { key: KEYS.accessToken, value: creds.accessToken, updatedBy: creds.connectedBy },
    { key: KEYS.organizationId, value: orgId, updatedBy: creds.connectedBy },
    { key: KEYS.connectedAt, value: new Date().toISOString(), updatedBy: creds.connectedBy },
  ];
  if (creds.refreshToken) entries.push({ key: KEYS.refreshToken, value: creds.refreshToken, updatedBy: creds.connectedBy });
  if (creds.expiresAt) entries.push({ key: KEYS.expiresAt, value: String(creds.expiresAt), updatedBy: creds.connectedBy });
  if (creds.scopes) entries.push({ key: KEYS.scopes, value: creds.scopes, updatedBy: creds.connectedBy });

  for (const entry of entries) {
    await prisma.platformSetting.upsert({
      where: { key: entry.key },
      create: { key: entry.key, value: entry.value, updatedBy: entry.updatedBy },
      update: { value: entry.value, updatedBy: entry.updatedBy, updatedAt: new Date() },
    });
  }
}

export async function clearLinkedInCredentials() {
  await prisma.platformSetting.deleteMany({
    where: { key: { startsWith: "linkedin." } },
  });
}

export async function getLinkedInConnectionMeta() {
  const creds = await getLinkedInCredentials();
  if (!creds) return { connected: false as const };

  const connectedAt = await readSetting(KEYS.connectedAt);
  const connectedBy = await readSetting(KEYS.connectedBy);
  const hasOrgScope = creds.scopes?.includes("w_organization_social") ?? false;
  const expiresAt = creds.expiresAt;
  const expired = expiresAt ? Date.now() / 1000 > expiresAt : false;

  return {
    connected: true as const,
    organizationId: creds.organizationId,
    scopes: creds.scopes,
    hasOrgScope,
    expired,
    expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
    connectedAt,
    connectedBy,
    source: process.env.LINKEDIN_ACCESS_TOKEN ? "env" : "oauth",
  };
}

export async function refreshLinkedInTokenIfNeeded(): Promise<LinkedInCredentials | null> {
  const creds = await getLinkedInCredentials();
  if (!creds) return null;

  const bufferSec = 7 * 24 * 60 * 60;
  if (!creds.expiresAt || !creds.refreshToken) return creds;
  if (Date.now() / 1000 < creds.expiresAt - bufferSec) return creds;

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) return creds;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: creds.refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return creds;

  const data = (await res.json()) as {
    access_token: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
  };

  const updated: LinkedInCredentials = {
    ...creds,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? creds.refreshToken,
    expiresAt: data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : creds.expiresAt,
    scopes: data.scope ?? creds.scopes,
  };
  await saveLinkedInCredentials(updated);
  return updated;
}
