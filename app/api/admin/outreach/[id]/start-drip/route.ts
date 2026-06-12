import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { logAdminAction } from "@/lib/admin/audit";
import { startOutreachDrip } from "@/lib/outreach/drip";

export async function POST(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await startOutreachDrip(params.id, session.user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Failed to start drip" }, { status: 422 });
  }

  await logAdminAction({
    userId: session.user.id,
    action: "outreach.drip.start",
    resource: "Dealership",
    resourceId: params.id,
  });

  return NextResponse.json({ ok: true });
}
