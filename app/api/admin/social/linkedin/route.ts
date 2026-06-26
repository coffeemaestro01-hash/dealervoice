import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getLinkedInSocialStatus, publishNextLinkedInPost } from "@/lib/social/linkedin/publish";
import { saveLinkedInCredentials } from "@/lib/social/linkedin/credentials";
import { resolveDealerVoiceOrgId } from "@/lib/social/linkedin/oauth";

async function connectManualToken(accessToken: string, userId: string) {
  const probe = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!probe.ok) {
    const text = await probe.text();
    throw new Error(`Invalid token (${probe.status}): ${text.slice(0, 200)}`);
  }

  const organizationId = await resolveDealerVoiceOrgId(accessToken);
  await saveLinkedInCredentials({
    accessToken,
    organizationId,
    scopes: "manual",
    connectedBy: userId,
  });
  return { organizationId };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const status = await getLinkedInSocialStatus();
  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  if (body.accessToken && typeof body.accessToken === "string") {
    try {
      const result = await connectManualToken(body.accessToken.trim(), session.user.id);
      return NextResponse.json({ ok: true, connected: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Token save failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (body.preview) {
    return NextResponse.json(await publishNextLinkedInPost({ dryRun: true }));
  }

  try {
    const result = await publishNextLinkedInPost();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Post failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
