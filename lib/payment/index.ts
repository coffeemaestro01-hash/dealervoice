// Razorpay payment integration for Indian SaaS billing
// Handles INR-based subscriptions + international cards via Razorpay PA-CB

import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_ENABLED = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let _razorpay: Razorpay | null = null;
function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _razorpay;
}

// Plan IDs - create these in Razorpay dashboard or via API
export const RAZORPAY_PLANS = {
  PRO_MONTHLY: process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID || "",
  PRO_ANNUAL: process.env.RAZORPAY_PRO_ANNUAL_PLAN_ID || "",
  ENTERPRISE_MONTHLY: process.env.RAZORPAY_ENTERPRISE_MONTHLY_PLAN_ID || "",
  ENTERPRISE_ANNUAL: process.env.RAZORPAY_ENTERPRISE_ANNUAL_PLAN_ID || "",
};

// Prices in INR paise (1 INR = 100 paise)
// At ~83 INR/USD: $49 ≈ ₹4,099 | $149 ≈ ₹12,399
export const PLAN_PRICES_INR = {
  PRO: { monthly: 409900, annual: 3999900, monthlyDisplay: "₹4,099", annualDisplay: "₹39,999" },
  ENTERPRISE: { monthly: 1239900, annual: 11999900, monthlyDisplay: "₹12,399", annualDisplay: "₹1,19,999" },
};

// For international billing display (approximate USD)
export const PLAN_PRICES_USD = {
  PRO: { monthly: 49, annual: 479 },
  ENTERPRISE: { monthly: 149, annual: 1439 },
};

export interface CreateSubscriptionParams {
  planId: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  dealershipId: string;
  totalCount?: number; // billing cycles, 0 = infinite
}

export async function createRazorpaySubscription(params: CreateSubscriptionParams) {
  if (!RAZORPAY_ENABLED) throw new Error("Payment gateway not configured");
  const rp = getRazorpay();

  const subscription = await rp.subscriptions.create({
    plan_id: params.planId,
    customer_notify: 1,
    total_count: params.totalCount ?? 120, // 10 years max
    notes: {
      dealershipId: params.dealershipId,
      customerEmail: params.customerEmail,
    },
  });

  return subscription;
}

export async function createRazorpayOrder(amountPaise: number, currency = "INR", receiptId: string) {
  if (!RAZORPAY_ENABLED) throw new Error("Payment gateway not configured");
  const rp = getRazorpay();
  return rp.orders.create({
    amount: amountPaise,
    currency,
    receipt: receiptId,
  });
}

export async function cancelRazorpaySubscription(subscriptionId: string, cancelAtCycleEnd = true) {
  if (!RAZORPAY_ENABLED) throw new Error("Payment gateway not configured");
  const rp = getRazorpay();
  return rp.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
}

export function verifyRazorpayWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expectedSignature === params.signature;
}

export { RAZORPAY_ENABLED };
