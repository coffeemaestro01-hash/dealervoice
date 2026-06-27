import crypto from "crypto";

const SCOPES = ["w_organization_social", "r_organization_social"].join(" ");

export function getLinkedInSetupInfo() {
  const redirectUri = linkedInRedirectUri();
  return {
    redirectUri,
    scopes: SCOPES,
    clientIdConfigured: !!process.env.LINKEDIN_CLIENT_ID,
    clientSecretConfigured: !!process.env.LINKEDIN_CLIENT_SECRET,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io",
    checklist: [
      "Create a NEW LinkedIn Developer app (e.g. DealerVoice Social) — Community Management API must be the ONLY product on the app",
      "Do NOT add Events, Conversions, or other products to that app (LinkedIn blocks mixed apps)",
      "Associate the new app with the DealerVoice company page",
      `Auth tab → add redirect URL exactly: ${redirectUri}`,
      "Products → request Community Management API only → wait for approval",
      "Update Vercel LINKEDIN_CLIENT_ID + LINKEDIN_CLIENT_SECRET to the new app credentials",
      "You must be super admin on linkedin.com/company/dealervoice/admin",
    ],
  };
}

export function linkedInOAuthConfigured() {
  return !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
}

export function linkedInRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
  return `${base.replace(/\/$/, "")}/api/admin/social/linkedin/callback`;
}

export function buildLinkedInAuthUrl(state: string) {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: linkedInRedirectUri(),
    scope: SCOPES,
    state,
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

export function signOAuthState(userId: string) {
  const secret = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || "dev";
  const payload = `${userId}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyOAuthState(state: string, userId: string): boolean {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const [uid, ts, sig] = decoded.split(":");
    if (uid !== userId) return false;
    if (Date.now() - Number(ts) > 15 * 60 * 1000) return false;
    const secret = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || "dev";
    const expected = crypto.createHmac("sha256", secret).update(`${uid}:${ts}`).digest("hex");
    return sig === expected;
  } catch {
    return false;
  }
}

export async function exchangeLinkedInCode(code: string) {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: linkedInRedirectUri(),
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${text.slice(0, 300)}`);
  return JSON.parse(text) as {
    access_token: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
  };
}

export async function resolveDealerVoiceOrgId(accessToken: string): Promise<string> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "LinkedIn-Version": "202401",
    "X-Restli-Protocol-Version": "2.0.0",
  };

  const vanityRes = await fetch(
    "https://api.linkedin.com/rest/organizations?q=vanityName&vanityName=dealervoice",
    { headers }
  );
  if (vanityRes.ok) {
    const data = (await vanityRes.json()) as { elements?: Array<{ id: number }> };
    const id = data.elements?.[0]?.id;
    if (id) return String(id);
  }

  const aclRes = await fetch(
    "https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
    { headers }
  );
  if (aclRes.ok) {
    const data = (await aclRes.json()) as { elements?: Array<{ organization: string }> };
    const org = data.elements?.[0]?.organization;
    if (org) return org.replace("urn:li:organization:", "");
  }

  throw new Error("Could not resolve DealerVoice organization ID. Ensure you are a company page super admin.");
}
