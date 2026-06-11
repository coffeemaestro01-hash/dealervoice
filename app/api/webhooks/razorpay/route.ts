import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Use /api/webhooks/cashfree" }, { status: 410 });
}
