import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { createRazorpayOrder, RAZORPAY_ENABLED } from "@/lib/payment";
import { z } from "zod";
import crypto from "crypto";

// Razorpay Standard Checkout — Step 1: create an order.
// Reuses createRazorpayOrder() from lib/payment (no duplicate logic).
const schema = z.object({
  amount: z.number().int().min(100), // paise; Razorpay minimum is 100 (₹1.00)
  currency: z.string().length(3).optional(),
  receipt: z.string().max(40).optional(),
  notes: z.record(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  // Auth required to create a paid order.
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!RAZORPAY_ENABLED) {
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid amount. Minimum is 100 paise (₹1.00)." },
      { status: 400 }
    );
  }

  const { amount, currency = "INR", receipt } = parsed.data;
  const receiptId = receipt ?? `rcpt_${crypto.randomBytes(8).toString("hex")}`;

  try {
    const order = await createRazorpayOrder(amount, currency, receiptId);
    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (err: any) {
    console.error("Razorpay create-order failed:", err?.message ?? err);
    // Razorpay auth failure surfaces as a 401 from their API.
    const status = err?.statusCode === 401 ? 401 : 500;
    return NextResponse.json({ error: "Failed to create order" }, { status });
  }
}
