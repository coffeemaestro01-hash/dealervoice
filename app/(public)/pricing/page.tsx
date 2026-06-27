import type { Metadata } from "next";
import prisma from "@/lib/db";
import { PLAN_PRICES_USD } from "@/lib/payment";
import { PricingPageView, type PricingPlan } from "@/components/pricing/PricingPageView";

export const metadata: Metadata = {
  title: "Pricing & Plans — DealerVoice",
  description:
    "Choose your visibility level on DealerVoice. Free claim, Pro for ad-free profiles and inventory, Enterprise for dealer groups.",
};

export const dynamic = "force-dynamic";

function buildPlans(dealerId?: string): PricingPlan[] {
  const freeHref = dealerId ? `/claim?dealer=${dealerId}` : "/claim";
  const proHref = dealerId ? `/dashboard/dealer/billing?dealer=${dealerId}` : "/dashboard/dealer/billing";

  return [
    {
      name: "DealerVoice Free",
      tagline: "Claim & get discovered",
      intro: "Build visibility and establish a credible dealership presence. Perfect for getting started with reviews and profile management.",
      priceUsd: "Free",
      period: "",
      benefits: [
        "Claim and manage your dealership profile",
        "Respond to customer reviews publicly",
        "One location included",
        "Appear in city and country dealer search",
        "Request-a-quote leads from buyers",
      ],
      cta: "Claim free profile",
      href: freeHref,
    },
    {
      name: "DealerVoice Pro",
      tagline: "Remove ads & grow reputation",
      intro: "Access advanced features to enhance your profile, list inventory, and give buyers a competitor-free view of your dealership.",
      priceUsd: `$${PLAN_PRICES_USD.PRO.monthly}/month`,
      period: "/month",
      annualNote: `$${PLAN_PRICES_USD.PRO.annual}/year billed annually (save ~17%)`,
      benefits: [
        "Remove competitor ads on your profile",
        "Live inventory link on profile & city browse",
        "Full analytics and review trends",
        "AI-powered response suggestions",
        "AI sales assistant — 24/7 chat & lead capture",
        "Competitor monitoring (up to 5 locations)",
        "Priority email support",
      ],
      cta: "Upgrade to Pro",
      href: proHref,
      highlighted: true,
      badge: "Most popular",
    },
    {
      name: "DealerVoice Pro+",
      tagline: "Featured badge & growth tools",
      intro: "Everything in Pro plus a featured badge on your profile, review backlink embeds, and priority placement in local browse.",
      priceUsd: `$${PLAN_PRICES_USD.PRO_PLUS.monthly}/month`,
      period: "/month",
      annualNote: `$${PLAN_PRICES_USD.PRO_PLUS.annual}/year billed annually (save ~17%)`,
      benefits: [
        "Featured Pro+ badge on profile & directory",
        "Embeddable review backlink for your website",
        "15 locations under one account",
        "Priority placement in city browse",
        "Everything in Pro (ads removed, inventory, analytics)",
        "AI assistant: appointment booking + auto follow-up",
      ],
      cta: "Upgrade to Pro+",
      href: proHref,
      badge: "New",
    },
    {
      name: "DealerVoice Enterprise",
      tagline: "For dealer groups & chains",
      intro: "Maximize exposure across locations and integrate DealerVoice into your group operations with dedicated support.",
      priceUsd: "Custom",
      period: "",
      customPrice: true,
      includesLabel: "Includes all Pro benefits",
      benefits: [
        "Unlimited locations under one group",
        "Full API access for inventory & reviews",
        "White-label reputation reporting",
        "Dedicated account manager",
        "Custom integrations and onboarding",
        "AI assistant website embed widget",
        "City sponsorship slots (where available)",
      ],
      cta: "Get a quote",
      href: "/contact",
    },
  ];
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ dealer?: string }>;
}) {
  const { dealer: dealerId } = await searchParams;

  let dealerBanner: { name: string; dealerId: string } | null = null;
  let stats = { dealerships: 1500, countries: 10 };

  try {
    const [dealer, dealershipCount, countryCount] = await Promise.all([
      dealerId
        ? prisma.dealership.findUnique({
            where: { id: dealerId, deletedAt: null },
            select: { name: true },
          })
        : null,
      prisma.dealership.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.country.count(),
    ]);

    if (dealer) dealerBanner = { name: dealer.name, dealerId: dealerId! };
    stats = { dealerships: dealershipCount, countries: Math.max(countryCount, 1) };
  } catch {
    /* use defaults */
  }

  return <PricingPageView plans={buildPlans(dealerId)} dealerBanner={dealerBanner} stats={stats} />;
}
