// Stripe Payment Gateway — primary provider for dealer subscriptions (USD).
// Optional Cashfree helpers retained for legacy test routes only.

import Stripe from "stripe";
import crypto from "crypto";

export const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY;

export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
  PRO_ANNUAL: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "",
  ENTERPRISE_MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
  ENTERPRISE_ANNUAL: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || "",
};

// Prices in INR (display / legacy)
export const PLAN_PRICES_INR = {
  PRO: { monthly: 1699900, annual: 16999900, monthlyDisplay: "₹16,999", annualDisplay: "₹1,69,999" },
  ENTERPRISE: { monthly: 4199900, annual: 41999900, monthlyDisplay: "₹41,999", annualDisplay: "₹4,19,999" },
};

export const PLAN_PRICES_USD = {
  PRO: { monthly: 199, annual: 1990, monthlyDisplay: "$199", annualDisplay: "$1,990" },
  ENTERPRISE: { monthly: 499, annual: 4990, monthlyDisplay: "$499", annualDisplay: "$4,990" },
};

export type PlanKey = "PRO" | "ENTERPRISE";
export type BillingInterval = "monthly" | "annual";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export function stripePriceId(plan: PlanKey, interval: BillingInterval): string {
  const key = `${plan}_${interval.toUpperCase()}` as keyof typeof STRIPE_PRICES;
  return STRIPE_PRICES[key];
}

export function planAmountCents(plan: PlanKey, interval: BillingInterval): number {
  const prices = PLAN_PRICES_USD[plan];
  const dollars = interval === "annual" ? prices.annual : prices.monthly;
  return dollars * 100;
}

/** @deprecated Use planAmountCents — kept for legacy Cashfree routes */
export function planAmountPaise(plan: PlanKey, interval: BillingInterval) {
  const prices = PLAN_PRICES_INR[plan];
  return interval === "annual" ? prices.annual : prices.monthly;
}

export function planDisplayPrice(plan: PlanKey, interval: BillingInterval): string {
  const prices = PLAN_PRICES_USD[plan];
  return interval === "annual" ? prices.annualDisplay : prices.monthlyDisplay;
}

export interface CreateStripeCheckoutParams {
  dealershipId: string;
  plan: PlanKey;
  interval: BillingInterval;
  customerEmail: string;
  customerName?: string;
  stripeCustomerId?: string | null;
  successUrl: string;
  cancelUrl: string;
  stripePromotionCodeId?: string;
  promotionCode?: string;
}

export async function createStripeCheckoutSession(
  params: CreateStripeCheckoutParams
): Promise<Stripe.Checkout.Session> {
  if (!STRIPE_ENABLED) throw new Error("Payment gateway not configured");

  const stripe = getStripe();
  const priceId = stripePriceId(params.plan, params.interval);

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        price_data: {
          currency: "usd",
          product_data: {
            name: `DealerVoice ${params.plan}`,
            description: `DealerVoice ${params.plan} plan — ${params.interval} billing`,
          },
          unit_amount: planAmountCents(params.plan, params.interval),
          recurring: {
            interval: params.interval === "annual" ? "year" : "month",
          },
        },
        quantity: 1,
      };

  const metadata = {
    dealershipId: params.dealershipId,
    plan: params.plan,
    interval: params.interval,
    ...(params.promotionCode ? { promotionCode: params.promotionCode } : {}),
  };

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: params.stripeCustomerId ?? undefined,
    customer_email: params.stripeCustomerId ? undefined : params.customerEmail,
    line_items: [lineItem],
    metadata,
    subscription_data: { metadata },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    discounts: params.stripePromotionCodeId
      ? [{ promotion_code: params.stripePromotionCodeId }]
      : undefined,
    allow_promotion_codes: !params.stripePromotionCodeId,
  });
}

export async function retrieveStripeCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  if (!STRIPE_ENABLED) throw new Error("Payment gateway not configured");
  return getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });
}

export async function retrieveStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  if (!STRIPE_ENABLED) throw new Error("Payment gateway not configured");
  return getStripe().subscriptions.retrieve(subscriptionId);
}

export function verifyStripeWebhookSignature(
  rawBody: string,
  signature: string
): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) return null;
  try {
    return getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return null;
  }
}

export function stripeSubscriptionPeriod(
  subscription: Stripe.Subscription
): { start: Date; end: Date } {
  const item = subscription.items.data[0];
  const start = new Date((item?.current_period_start ?? subscription.start_date) * 1000);
  const end = new Date((item?.current_period_end ?? subscription.start_date) * 1000);
  return { start, end };
}

export function parseStripePlanMetadata(
  metadata: Stripe.Metadata | null | undefined
): { plan: PlanKey; interval: BillingInterval; dealershipId?: string } {
  const plan: PlanKey = metadata?.plan === "ENTERPRISE" ? "ENTERPRISE" : "PRO";
  const interval: BillingInterval = metadata?.interval === "annual" ? "annual" : "monthly";
  return { plan, interval, dealershipId: metadata?.dealershipId };
}

// ─── Legacy Cashfree (test routes only — not used in subscription checkout) ───

const CASHFREE_API_VERSION = "2023-08-01";

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
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": process.env.CASHFREE_APP_ID!,
    "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
  };
}

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

export async function createCashfreeOrder(params: CreateCashfreeOrderParams): Promise<CashfreeOrder> {
  if (!CASHFREE_ENABLED) throw new Error("Payment gateway not configured");

  const orderTags: Record<string, string> = {};
  if (params.dealershipId) orderTags.dealershipId = params.dealershipId;
  if (params.plan) orderTags.plan = params.plan;
  if (params.interval) orderTags.interval = params.interval;

  const body: Record<string, unknown> = {
    order_id: params.orderId,
    order_amount: Math.round(params.amountPaise) / 100,
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
