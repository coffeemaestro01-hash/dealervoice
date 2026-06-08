import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLAN_PRICES_INR, PLAN_PRICES_USD } from "@/lib/payment";
import prisma from "@/lib/db";
import { EMAILS } from "@/lib/constants/emails";

export const metadata: Metadata = {
  title: "Pricing - DealerVoice",
  description: "Simple, transparent pricing for dealership reputation management.",
};

const PLANS = [
  {
    name: "Free",
    description: "For dealerships getting started",
    price: { inr: "₹0", usd: "$0", period: "forever" },
    plan: "FREE",
    features: [
      { label: "Claim & manage your profile", included: true },
      { label: "Respond to reviews", included: true },
      { label: "1 location", included: true },
      { label: "Remove competitor ads", included: false },
      { label: "Live inventory link", included: false },
      { label: "Full analytics dashboard", included: false },
      { label: "Competitor monitoring", included: false },
      { label: "AI response suggestions", included: false },
    ],
    cta: "Claim Free Profile",
    ctaHref: "/claim",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "Remove ads & grow your reputation",
    price: { inr: PLAN_PRICES_INR.PRO.monthlyDisplay, usd: `$${PLAN_PRICES_USD.PRO.monthly}`, period: "/month" },
    annualPrice: { inr: PLAN_PRICES_INR.PRO.annualDisplay, usd: `$${PLAN_PRICES_USD.PRO.annual}` },
    plan: "PRO",
    features: [
      { label: "Remove competitor ads", included: true },
      { label: "Live inventory link on profile", included: true },
      { label: "Everything in Free", included: true },
      { label: "Up to 5 locations", included: true },
      { label: "Full analytics & trends", included: true },
      { label: "Competitor monitoring", included: true },
      { label: "AI response suggestions", included: true },
      { label: "Priority support", included: true },
    ],
    cta: "Upgrade to Pro",
    ctaHref: "/dashboard/dealer/billing",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    description: "For dealer groups & chains",
    price: { inr: PLAN_PRICES_INR.ENTERPRISE.monthlyDisplay, usd: `$${PLAN_PRICES_USD.ENTERPRISE.monthly}`, period: "/month" },
    annualPrice: { inr: PLAN_PRICES_INR.ENTERPRISE.annualDisplay, usd: `$${PLAN_PRICES_USD.ENTERPRISE.annual}` },
    plan: "ENTERPRISE",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Unlimited locations", included: true },
      { label: "Full API access", included: true },
      { label: "White-label reporting", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Custom integrations", included: true },
    ],
    cta: "Contact Sales",
    ctaHref: `/contact`,
    highlighted: false,
  },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ dealer?: string }>;
}) {
  const { dealer: dealerId } = await searchParams;
  let dealerBanner: { name: string; slug: string } | null = null;

  if (dealerId) {
    try {
      const d = await prisma.dealership.findUnique({
        where: { id: dealerId, deletedAt: null },
        select: { name: true, slug: true },
      });
      if (d) dealerBanner = d;
    } catch {
      /* non-fatal */
    }
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="container">
        {dealerBanner && (
          <div className="max-w-3xl mx-auto mb-8 rounded-2xl border-2 border-gold/30 bg-gold-50 p-5 text-center">
            <p className="text-sm font-semibold text-gold-800 uppercase tracking-wide mb-1">Claim &amp; monetize</p>
            <h2 className="text-xl font-bold text-gray-900">
              Upgrade <span className="text-gold-700">{dealerBanner.name}</span> to remove competitor ads
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Pro removes sponsored alternatives and adds your live inventory link.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Link href={`/claim?dealer=${dealerId}`}>
                <Button variant="outline" className="border-gold-400 text-gold-800">Start free claim</Button>
              </Link>
              <Link href={`/dashboard/dealer/billing?dealer=${dealerId}`}>
                <Button className="bg-gold-800 hover:bg-gold-900">Go to checkout</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Start free. Upgrade to remove ads and list inventory. All plans billed in INR via Razorpay (international cards where enabled).
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => {
            const href =
              plan.plan === "PRO" && dealerId
                ? `/dashboard/dealer/billing?dealer=${dealerId}`
                : plan.plan === "FREE" && dealerId
                ? `/claim?dealer=${dealerId}`
                : plan.ctaHref;

            return (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border p-8 shadow-sm relative ${
                  plan.highlighted ? "border-gold-600 ring-2 ring-gold-600 ring-offset-2" : "border-gray-200"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gold-700 text-white text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">{plan.price.inr}</span>
                      {plan.price.period !== "forever" && <span className="text-gray-500 text-sm">{plan.price.period}</span>}
                    </div>
                    {plan.price.period !== "forever" && <p className="text-gray-400 text-xs mt-0.5">≈ {plan.price.usd}/month</p>}
                    {plan.annualPrice && (
                      <p className="text-green-600 text-xs mt-1">{plan.annualPrice.inr}/year billed annually (save 20%)</p>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-2.5 text-sm">
                      {f.included ? <Check size={16} className="text-green-500 shrink-0" /> : <X size={16} className="text-gray-300 shrink-0" />}
                      <span className={f.included ? "text-gray-700" : "text-gray-400"}>{f.label}</span>
                    </li>
                  ))}
                </ul>

                <Link href={href}>
                  <Button className={`w-full ${plan.highlighted ? "bg-gold-800 hover:bg-gold-800" : "bg-gray-900 hover:bg-gray-800"}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10 space-y-2">
          <p className="text-sm text-gray-500">Payments via Razorpay — cards, UPI, Net Banking &amp; international cards</p>
          <p className="text-sm text-gray-500">
            Questions? <a href={`mailto:${EMAILS.dealers}`} className="text-gold-700 hover:underline">{EMAILS.dealers}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
