// Stripe Payment Gateway — sole provider for dealer subscriptions and platform billing (USD).

import Stripe from "stripe";

export const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY;

export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
  PRO_ANNUAL: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "",
  PRO_PLUS_MONTHLY: process.env.STRIPE_PRO_PLUS_MONTHLY_PRICE_ID || "",
  PRO_PLUS_ANNUAL: process.env.STRIPE_PRO_PLUS_ANNUAL_PRICE_ID || "",
  ENTERPRISE_MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
  ENTERPRISE_ANNUAL: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || "",
};

export const PLAN_PRICES_USD = {
  PRO: { monthly: 199, annual: 1990, monthlyDisplay: "$199", annualDisplay: "$1,990" },
  PRO_PLUS: { monthly: 349, annual: 3490, monthlyDisplay: "$349", annualDisplay: "$3,490" },
  ENTERPRISE: { monthly: 499, annual: 4990, monthlyDisplay: "$499", annualDisplay: "$4,990" },
};

export type PlanKey = "PRO" | "PRO_PLUS" | "ENTERPRISE";
export type BillingInterval = "monthly" | "semiannual" | "annual";

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
  if (interval === "annual") return prices.annual * 100;
  if (interval === "semiannual") return Math.round((prices.annual / 2) * 100);
  return prices.monthly * 100;
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
            ...(params.interval === "semiannual" ? { interval_count: 6 } : {}),
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
  const raw = metadata?.plan;
  const plan: PlanKey =
    raw === "ENTERPRISE" ? "ENTERPRISE" : raw === "PRO_PLUS" ? "PRO_PLUS" : "PRO";
  const interval: BillingInterval =
    metadata?.interval === "annual"
      ? "annual"
      : metadata?.interval === "semiannual"
        ? "semiannual"
        : "monthly";
  return { plan, interval, dealershipId: metadata?.dealershipId };
}
