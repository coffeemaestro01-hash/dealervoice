import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { createCashfreeOrder, CASHFREE_ENABLED, cashfreeMode } from "@/lib/payment";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  amount: z.number().int().min(100), // paise; minimum is 100 (₹1.00)
  currency: z.string().length(3).optional(),
  receipt: z.string().max(40).optional(),
  notes: z.record(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!CASHFREE_ENABLED) {
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
  const orderId = receipt ?? `rcpt_${crypto.randomBytes(8).toString("hex")}`;

  try {
    const order = await createCashfreeOrder({
      orderId,
      amountPaise: amount,
      currency,
      customerId: session.user.id,
      customerEmail: session.user.email!,
      customerName: session.user.name ?? undefined,
      customerPhone: "9999999999",
      orderNote: "DealerVoice test payment",
    });

    return NextResponse.json({
      order_id: order.order_id,
      payment_session_id: order.payment_session_id,
      amount,
      currency: order.order_currency,
      mode: cashfreeMode(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    const statusCode = (err as { statusCode?: number })?.statusCode;
    console.error("Cashfree create-order failed:", message);
    return NextResponse.json({ error: "Failed to create order" }, { status: statusCode === 401 ? 401 : 500 });
  }
}
