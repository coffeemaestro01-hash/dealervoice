import { NextResponse } from "next/server";

// Stripe webhooks replaced by Razorpay - see /api/webhooks/razorpay
export async function POST() {
  return NextResponse.json({ message: "Use /api/webhooks/razorpay" }, { status: 410 });
}
