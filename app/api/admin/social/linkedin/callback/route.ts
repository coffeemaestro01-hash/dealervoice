import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  exchangeLinkedInCode,
  resolveDealerVoiceOrgId,
  verifyOAuthState,
} from "@/lib/social/linkedin/oauth";
import { saveLinkedInCredentials } from "@/lib/social/linkedin/credentials";

const ADMIN_SOCIAL = "/dashboard/admin/social";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(`${ADMIN_SOCIAL}?error=forbidden`);
  }

  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(`${ADMIN_SOCIAL}?error=${encodeURIComponent(error)}`);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || !verifyOAuthState(state, session.user.id)) {
    return NextResponse.redirect(`${ADMIN_SOCIAL}?error=invalid_state`);
  }

  try {
    const token = await exchangeLinkedInCode(code);
    const scopes = token.scope ?? "";
    if (!scopes.includes("w_organization_social")) {
      return NextResponse.redirect(
        `${ADMIN_SOCIAL}?error=${encodeURIComponent("Missing w_organization_social scope. Request Community Management API product on your LinkedIn app, then reconnect.")}`
      );
    }

    const organizationId = await resolveDealerVoiceOrgId(token.access_token);
    const expiresAt = token.expires_in
      ? Math.floor(Date.now() / 1000) + token.expires_in
      : undefined;

    await saveLinkedInCredentials({
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt,
      organizationId,
      scopes,
      connectedBy: session.user.id,
    });

    return NextResponse.redirect(`${ADMIN_SOCIAL}?connected=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "LinkedIn connect failed";
    return NextResponse.redirect(`${ADMIN_SOCIAL}?error=${encodeURIComponent(message)}`);
  }
}
