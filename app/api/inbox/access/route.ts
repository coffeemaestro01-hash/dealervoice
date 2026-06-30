import { NextResponse } from "next/server";
import { getInboxSession, inboxErrorResponse } from "@/lib/inbox/session";

export async function GET() {
  try {
    const ctx = await getInboxSession();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({
      data: {
        userId: ctx.userId,
        dealershipId: ctx.dealershipId,
        access: ctx.access,
      },
    });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
