import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { verifyRazorpayPaymentSignature } from "@/lib/payment";

// Razorpay Standard Checkout — Step 3: verify the payment signature.
// HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET) === razorpay_signature.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const valid = verifyRazorpayPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    // Signature mismatch — never mark as paid.
    return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
  }

  return NextResponse.json({ success: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
}
