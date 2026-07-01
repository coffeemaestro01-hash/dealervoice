import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getBusinessCommandCenterData } from "@/lib/admin/business-tracking";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await getBusinessCommandCenterData();
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.action === "backfill_gift_cards") {
    const { backfillChicagoGiftCards } = await import("@/lib/reviews/gift-cards");
    const { logAdminJobRun } = await import("@/lib/admin/business-tracking");
    const result = await backfillChicagoGiftCards();
    await logAdminJobRun({
      jobType: "GIFT_CARD_UPDATE",
      summary: `Gift card backfill — ${result.created} created`,
      payload: result,
      actorUserId: session.user.id,
    });
    return NextResponse.json({ ok: true, result });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
