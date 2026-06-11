// Cashfree Payment Gateway — sole payment provider (INR settlement, global dealer signups).
// International cards accepted where Cashfree merchant config allows; display USD equivalents on pricing only.

import crypto from "crypto";

const API_VERSION = "2023-08-01";

export const CASHFREE_ENABLED = !!(
  process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY
);

function cashfreeBaseUrl(): string {
  return process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

export function cashfreeMode(): "sandbox" | "production" {
  return process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
}

function cashfreeHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-version": API_VERSION,
    "x-client-id": process.env.CASHFREE_APP_ID!,
    "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
  };
}

// Prices in INR paise (1 INR = 100 paise)
export const PLAN_PRICES_INR = {
  PRO: { monthly: 1699900, annual: 16999900, monthlyDisplay: "₹16,999", annualDisplay: "₹1,69,999" },
  ENTERPRISE: { monthly: 4199900, annual: 41999900, monthlyDisplay: "₹41,999", annualDisplay: "₹4,19,999" },
};

export const PLAN_PRICES_USD = {
  PRO: { monthly: 199, annual: 1990 },
  ENTERPRISE: { monthly: 499, annual: 4990 },
};

export interface CashfreeOrder {
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  payment_session_id?: string;
  order_tags?: Record<string, string>;
  order_note?: string;
  cf_order_id?: string;
}

export interface CreateCashfreeOrderParams {
  orderId: string;
  amountPaise: number;
  currency?: string;
  customerId: string;
  customerEmail: string;
  customerName?: string;
  customerPhone: string;
  dealershipId?: string;
  plan?: string;
  interval?: string;
  orderNote?: string;
  returnUrl?: string;
}

export function planAmountPaise(plan: "PRO" | "ENTERPRISE", interval: "monthly" | "annual") {
  const prices = PLAN_PRICES_INR[plan];
  return interval === "annual" ? prices.annual : prices.monthly;
}

function paiseToRupees(amountPaise: number): number {
  return Math.round(amountPaise) / 100;
}

export async function createCashfreeOrder(params: CreateCashfreeOrderParams): Promise<CashfreeOrder> {
  if (!CASHFREE_ENABLED) throw new Error("Payment gateway not configured");

  const orderTags: Record<string, string> = {};
  if (params.dealershipId) orderTags.dealershipId = params.dealershipId;
  if (params.plan) orderTags.plan = params.plan;
  if (params.interval) orderTags.interval = params.interval;

  const body: Record<string, unknown> = {
    order_id: params.orderId,
    order_amount: paiseToRupees(params.amountPaise),
    order_currency: params.currency ?? "INR",
    customer_details: {
      customer_id: params.customerId,
      customer_email: params.customerEmail,
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
    },
  };

  if (params.orderNote) body.order_note = params.orderNote;
  if (Object.keys(orderTags).length > 0) body.order_tags = orderTags;
  if (params.returnUrl) {
    body.order_meta = { return_url: params.returnUrl };
  }

  const res = await fetch(`${cashfreeBaseUrl()}/orders`, {
    method: "POST",
    headers: cashfreeHeaders(),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message ?? data?.error?.message ?? "Failed to create Cashfree order";
    const err = new Error(msg) as Error & { statusCode?: number };
    err.statusCode = res.status;
    throw err;
  }

  return data as CashfreeOrder;
}

export async function fetchCashfreeOrder(orderId: string): Promise<CashfreeOrder> {
  if (!CASHFREE_ENABLED) throw new Error("Payment gateway not configured");

  const res = await fetch(`${cashfreeBaseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: cashfreeHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message ?? data?.error?.message ?? "Failed to fetch Cashfree order";
    const err = new Error(msg) as Error & { statusCode?: number };
    err.statusCode = res.status;
    throw err;
  }

  return data as CashfreeOrder;
}

export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET ?? process.env.CASHFREE_SECRET_KEY;
  if (!secret || !signature || !timestamp) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");

  return expected === signature;
}

export function isCashfreeOrderPaid(order: CashfreeOrder): boolean {
  return order.order_status === "PAID";
}
