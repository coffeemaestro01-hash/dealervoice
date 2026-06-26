import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getLinkedInSetupInfo } from "@/lib/social/linkedin/oauth";

/** Setup checklist + exact redirect URI for LinkedIn Developer portal. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(getLinkedInSetupInfo());
}
