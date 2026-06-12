import { getStripe } from "@/lib/payment";

export const SPONSORSHIP_TIERS = {
  city_30: { label: "City spotlight — 30 days", amountCents: 29900, days: 30 },
  homepage_30: { label: "Homepage pin — 30 days", amountCents: 49900, days: 30 },
} as const;

export type SponsorshipTier = keyof typeof SPONSORSHIP_TIERS;

export async function createSponsorshipCheckout(params: {
  dealershipId: string;
  tier: SponsorshipTier;
  customerEmail: string;
  stripeCustomerId?: string | null;
  successUrl: string;
  cancelUrl: string;
  sponsorLabel?: string;
}) {
  const tier = SPONSORSHIP_TIERS[params.tier];
  const stripe = getStripe();

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer: params.stripeCustomerId ?? undefined,
    customer_email: params.stripeCustomerId ? undefined : params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: tier.amountCents,
          product_data: {
            name: `DealerVoice ${tier.label}`,
            description: `Featured placement for ${params.sponsorLabel ?? "your dealership"}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "sponsorship",
      dealershipId: params.dealershipId,
      tier: params.tier,
      days: String(tier.days),
      sponsorLabel: params.sponsorLabel ?? "",
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
}

export function sponsorshipUntil(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
