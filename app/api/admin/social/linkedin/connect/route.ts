import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { buildLinkedInAuthUrl, linkedInOAuthConfigured, signOAuthState } from "@/lib/social/linkedin/oauth";

/** Start LinkedIn OAuth — SUPER_ADMIN must be company page admin. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!linkedInOAuthConfigured()) {
    return NextResponse.json(
      {
        error: "Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to Vercel first",
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io"}/api/admin/social/linkedin/callback`,
      },
      { status: 503 }
    );
  }

  const state = signOAuthState(session.user.id);
  const url = buildLinkedInAuthUrl(state);
  return NextResponse.redirect(url);
}
