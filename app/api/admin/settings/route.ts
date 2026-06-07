import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getAllFeatureFlags, setFeatureFlag } from "@/lib/admin/feature-flags";
import { isSuperAdmin } from "@/lib/admin/guards";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const flags = await getAllFeatureFlags();
  const slackWebhook = process.env.SLACK_WEBHOOK_URL ? "(configured)" : "";
  return NextResponse.json({ data: { flags, slackWebhook } });
}

const patchSchema = z.object({
  key: z.string(),
  value: z.union([z.boolean(), z.string(), z.number()]),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  await setFeatureFlag(parsed.data.key, parsed.data.value, session.user.id);
  return NextResponse.json({ ok: true });
}
