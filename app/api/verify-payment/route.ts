import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { fetchCashfreeOrder, isCashfreeOrderPaid } from "@/lib/payment";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { order_id } = (body ?? {}) as { order_id?: string };
  if (!order_id) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  try {
    const order = await fetchCashfreeOrder(order_id);
    if (!isCashfreeOrderPaid(order)) {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      paymentId: order.cf_order_id ?? order.order_id,
      orderId: order.order_id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    console.error("Cashfree verify-payment failed:", message);
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 });
  }
}
