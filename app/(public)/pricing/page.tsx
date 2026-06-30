import type { Metadata } from "next";
import prisma from "@/lib/db";
import { PLAN_PRICES_USD } from "@/lib/payment";
import { PLAN_SERVICE_AREA_LIMITS } from "@/lib/subscription/plan-limits";
import { PricingPageView, type PricingPlan } from "@/components/pricing/PricingPageView";
import { DealerPromotionsShowcase } from "@/components/promotions/DealerPromotionsShowcase";
import { getChicagoJackpotAdminSummary } from "@/lib/promotions/chicago-jackpot";

export const metadata: Metadata = {
  title: "Pricing & Plans — DealerVoice",
  description:
    "Choose your visibility level on DealerVoice. Free claim, Pro for ad-free profiles and inventory, Enterprise for dealer groups.",
};

export const dynamic = "force-dynamic";

function buildPlans(dealerId?: string): PricingPlan[] {
  const freeHref = dealerId ? `/claim?dealer=${dealerId}` : "/claim";
  const proHref = dealerId ? `/dashboard/dealer/billing?dealer=${dealerId}` : "/dashboard/dealer/billing";
  const enterpriseHref = proHref;

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
        `${PLAN_SERVICE_AREA_LIMITS.FREE} service areas you serve`,
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
      priceUsd: `$${PLAN_PRICES_USD.PRO.monthly}`,
      period: "/month",
      annualNote: `$${PLAN_PRICES_USD.PRO.annual}/year billed annually (save ~17%)`,
      benefits: [
        "Remove competitor ads on your profile",
        "Live inventory link on profile & city browse",
        `${PLAN_SERVICE_AREA_LIMITS.PRO} service areas you serve`,
        "Full analytics and review trends",
        "AI-powered response suggestions",
        "AI sales assistant — 24/7 chat & lead capture",
        "Competitor monitoring",
        "DealerVoice Inbox — customer support (5 team seats)",
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
      priceUsd: `$${PLAN_PRICES_USD.PRO_PLUS.monthly}`,
      period: "/month",
      annualNote: `$${PLAN_PRICES_USD.PRO_PLUS.annual}/year billed annually (save ~17%)`,
      benefits: [
        "Featured Pro+ badge on profile & directory",
        `${PLAN_SERVICE_AREA_LIMITS.PRO_PLUS} service areas you serve`,
        "Embeddable review backlink for your website",
        "Priority placement in city browse",
        "Everything in Pro (ads removed, inventory, analytics)",
        "DealerVoice Inbox — customer support (10 team seats)",
        "AI assistant: appointment booking + auto follow-up",
      ],
      cta: "Upgrade to Pro+",
      href: proHref,
      badge: "New",
    },
    {
      name: "DealerVoice Enterprise",
      tagline: "For dealer groups & chains",
      intro: "Maximum exposure, multi-location control, and exclusive growth programs built for operator-scale dealerships.",
      priceUsd: `$${PLAN_PRICES_USD.ENTERPRISE.monthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      period: "/month",
      annualNote: `$${PLAN_PRICES_USD.ENTERPRISE.annual.toLocaleString()}/year billed annually`,
      includesLabel: "Includes all Pro+ benefits",
      benefits: [
        `${PLAN_SERVICE_AREA_LIMITS.ENTERPRISE} service areas — top of applicable location directories`,
        "Link 5 same-owner dealership locations under one account",
        "DealerVoice Inbox on all linked locations (50 shared team seats)",
        "CEO interviews on research articles — trending automotive topics",
        "Highest lead prospect priority in areas you serve",
        "Full API access for inventory & reviews",
        "White-label reputation reporting",
        "Dedicated account manager",
        "AI assistant website embed widget",
      ],
      cta: "Upgrade to Enterprise",
      href: enterpriseHref,
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
  let promoStats = { jackpotSlotsRemaining: 100, jackpotWinners: 0 };

  try {
    const [dealer, dealershipCount, countryCount, jackpot] = await Promise.all([
      dealerId
        ? prisma.dealership.findUnique({
            where: { id: dealerId, deletedAt: null },
            select: { name: true },
          })
        : null,
      prisma.dealership.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.country.count(),
      getChicagoJackpotAdminSummary().catch(() => null),
    ]);

    if (dealer) dealerBanner = { name: dealer.name, dealerId: dealerId! };
    stats = { dealerships: dealershipCount, countries: Math.max(countryCount, 1) };
    if (jackpot) {
      promoStats = {
        jackpotSlotsRemaining: jackpot.slotsRemaining,
        jackpotWinners: jackpot.winnerTotal,
      };
    }
  } catch {
    /* use defaults */
  }

  return (
    <>
      <PricingPageView plans={buildPlans(dealerId)} dealerBanner={dealerBanner} stats={stats} />
      <DealerPromotionsShowcase stats={promoStats} compact />
    </>
  );
}
