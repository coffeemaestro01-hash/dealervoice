import prisma from "@/lib/db";
import { getStripe, planAmountCents, type BillingInterval, type PlanKey } from "@/lib/payment";
import type { PromotionCode, PromotionDiscountType, SubscriptionPlan } from "@prisma/client";

export const DEFAULT_PRO_ONE_DOLLAR_CODE = "PRO1USD";
export const PRESET_PERCENT_OFF = [5, 10, 15, 20] as const;

export type PresetPercentOff = (typeof PRESET_PERCENT_OFF)[number];

type PromotionDiscountFields =
  | { discountType: "FIXED"; fixedPriceUsdCents: number; percentOff?: never }
  | { discountType: "PERCENT"; percentOff: number; fixedPriceUsdCents?: never };

export type CreatePromotionInput = {
  code: string;
  label?: string;
  plan: PlanKey;
  interval: BillingInterval;
  maxRedemptions?: number;
  expiresAt?: Date;
  createdById?: string;
} & PromotionDiscountFields;

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function validatePercentOff(percentOff: number): void {
  if (!Number.isInteger(percentOff) || percentOff < 1 || percentOff > 100) {
    throw new Error("Percent off must be an integer between 1 and 100.");
  }
}

export function validateFixedPrice(plan: PlanKey, interval: BillingInterval, fixedPriceUsdCents: number): void {
  const listPriceCents = planAmountCents(plan, interval);
  if (fixedPriceUsdCents >= listPriceCents) {
    throw new Error("Fixed price must be lower than the list price.");
  }
}

export async function createStripePromotion(input: CreatePromotionInput) {
  const stripe = getStripe();
  const code = normalizePromoCode(input.code);

  let coupon: Awaited<ReturnType<typeof stripe.coupons.create>>;

  if (input.discountType === "PERCENT") {
    validatePercentOff(input.percentOff);
    coupon = await stripe.coupons.create({
      percent_off: input.percentOff,
      duration: "forever",
      name: `${input.plan} ${input.interval} → ${input.percentOff}% off (${code})`,
      metadata: {
        plan: input.plan,
        interval: input.interval,
        discountType: "PERCENT",
        percentOff: String(input.percentOff),
      },
    });
  } else {
    validateFixedPrice(input.plan, input.interval, input.fixedPriceUsdCents);
    const listPriceCents = planAmountCents(input.plan, input.interval);
    const amountOff = listPriceCents - input.fixedPriceUsdCents;

    coupon = await stripe.coupons.create({
      amount_off: amountOff,
      currency: "usd",
      duration: "forever",
      name: `${input.plan} ${input.interval} → $${(input.fixedPriceUsdCents / 100).toFixed(2)} (${code})`,
      metadata: {
        plan: input.plan,
        interval: input.interval,
        discountType: "FIXED",
        fixedPriceUsdCents: String(input.fixedPriceUsdCents),
      },
    });
  }

  const promotion = await stripe.promotionCodes.create({
    promotion: {
      type: "coupon",
      coupon: coupon.id,
    },
    code,
    max_redemptions: input.maxRedemptions,
    metadata: {
      plan: input.plan,
      interval: input.interval,
      discountType: input.discountType,
    },
  });

  return { coupon, promotion, code };
}

export async function createPromotionRecord(input: CreatePromotionInput) {
  const { coupon, promotion, code } = await createStripePromotion(input);

  return prisma.promotionCode.create({
    data: {
      code,
      label: input.label,
      plan: input.plan as SubscriptionPlan,
      interval: input.interval,
      discountType: input.discountType as PromotionDiscountType,
      fixedPriceUsdCents: input.discountType === "FIXED" ? input.fixedPriceUsdCents : null,
      percentOff: input.discountType === "PERCENT" ? input.percentOff : null,
      stripeCouponId: coupon.id,
      stripePromotionCodeId: promotion.id,
      maxRedemptions: input.maxRedemptions,
      expiresAt: input.expiresAt,
      createdById: input.createdById,
    },
  });
}

export async function findValidPromotion(code: string, plan: PlanKey, interval: BillingInterval) {
  const normalized = normalizePromoCode(code);
  const promo = await prisma.promotionCode.findUnique({ where: { code: normalized } });
  if (!promo || !promo.active) return null;
  if (promo.expiresAt && promo.expiresAt < new Date()) return null;
  if (promo.maxRedemptions != null && promo.timesRedeemed >= promo.maxRedemptions) return null;
  if (promo.plan && promo.plan !== plan) return null;
  if (promo.interval && promo.interval !== interval) return null;
  return promo;
}

export async function incrementPromotionRedemption(code: string) {
  const normalized = normalizePromoCode(code);
  await prisma.promotionCode.updateMany({
    where: { code: normalized },
    data: { timesRedeemed: { increment: 1 } },
  });
}

/** Default launch promo: Pro monthly for $1 USD */
export async function ensureDefaultProOneDollarPromo(createdById?: string) {
  const existing = await prisma.promotionCode.findUnique({
    where: { code: DEFAULT_PRO_ONE_DOLLAR_CODE },
  });
  if (existing) return existing;

  return createPromotionRecord({
    code: DEFAULT_PRO_ONE_DOLLAR_CODE,
    label: "Pro monthly launch — $1",
    plan: "PRO",
    interval: "monthly",
    discountType: "FIXED",
    fixedPriceUsdCents: 100,
    maxRedemptions: 100,
    createdById,
  });
}

export function formatPromoPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function formatPromotionDiscount(
  promo: Pick<PromotionCode, "discountType" | "fixedPriceUsdCents" | "percentOff" | "interval">
): string {
  if (promo.discountType === "PERCENT" && promo.percentOff != null) {
    return `${promo.percentOff}% off`;
  }
  if (promo.fixedPriceUsdCents != null) {
    const suffix = promo.interval === "annual" ? "/yr" : "/mo";
    return `${formatPromoPrice(promo.fixedPriceUsdCents)}${suffix}`;
  }
  return "—";
}
