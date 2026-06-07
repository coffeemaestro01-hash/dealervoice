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
  PRO: { monthly: 1699900, annual: 16999900, monthlyDisplay: "₹16,999", annualDisplay: "₹1,69,999" },
  ENTERPRISE: { monthly: 4199900, annual: 41999900, monthlyDisplay: "₹41,999", annualDisplay: "₹4,19,999" },
};

// For international billing display (USD)
export const PLAN_PRICES_USD = {
  PRO: { monthly: 199, annual: 1990 },
  ENTERPRISE: { monthly: 499, annual: 4990 },
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

export function verifyRazorpaySubscriptionSignature(params: {
  paymentId: string;
  subscriptionId: string;
  signature: string;
}): boolean {
  const body = `${params.paymentId}|${params.subscriptionId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expectedSignature === params.signature;
}

export function planAmountPaise(plan: "PRO" | "ENTERPRISE", interval: "monthly" | "annual") {
  const prices = PLAN_PRICES_INR[plan];
  return interval === "annual" ? prices.annual : prices.monthly;
}

export { RAZORPAY_ENABLED };
