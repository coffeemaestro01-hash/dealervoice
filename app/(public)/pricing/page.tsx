import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLAN_PRICES_INR, PLAN_PRICES_USD } from "@/lib/payment";

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
      { label: "Full analytics dashboard", included: false },
      { label: "Competitor monitoring", included: false },
      { label: "AI response suggestions", included: false },
      { label: "Verified badge on website", included: false },
      { label: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    ctaHref: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For growing dealerships",
    price: { inr: PLAN_PRICES_INR.PRO.monthlyDisplay, usd: `$${PLAN_PRICES_USD.PRO.monthly}`, period: "/month" },
    annualPrice: { inr: PLAN_PRICES_INR.PRO.annualDisplay, usd: `$${PLAN_PRICES_USD.PRO.annual}` },
    plan: "PRO",
    features: [
      { label: "Everything in Free", included: true },
      { label: "Up to 5 locations", included: true },
      { label: "Full analytics & trends", included: true },
      { label: "Competitor monitoring", included: true },
      { label: "AI response suggestions", included: true },
      { label: "Verified badge on website", included: true },
      { label: "Custom branding", included: true },
      { label: "Priority support", included: true },
    ],
    cta: "Start 14-Day Free Trial",
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
      { label: "SSO / SAML", included: true },
      { label: "SLA guarantee", included: true },
    ],
    cta: "Contact Sales",
    ctaHref: "/contact",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready. Prices shown in INR and USD.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border p-8 shadow-sm relative ${
                plan.highlighted ? "border-gold-600 ring-2 ring-gold-600 ring-offset-2" : "border-gray-200"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gold-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price.inr}</span>
                    {plan.price.period !== "forever" && (
                      <span className="text-gray-500 text-sm">{plan.price.period}</span>
                    )}
                  </div>
                  {plan.price.period !== "forever" && (
                    <p className="text-gray-400 text-xs mt-0.5">≈ {plan.price.usd}/month</p>
                  )}
                  {(plan as any).annualPrice && (
                    <p className="text-green-600 text-xs mt-1">
                      {(plan as any).annualPrice.inr}/year billed annually (save 20%)
                    </p>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm">
                    {f.included ? (
                      <Check size={16} className="text-green-500 shrink-0" />
                    ) : (
                      <X size={16} className="text-gray-300 shrink-0" />
                    )}
                    <span className={f.included ? "text-gray-700" : "text-gray-400"}>{f.label}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.ctaHref}>
                <Button
                  className={`w-full ${plan.highlighted ? "bg-gold-800 hover:bg-gold-800" : "bg-gray-900 hover:bg-gray-800"}`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 space-y-2">
          <p className="text-sm text-gray-500">
            Payments via Razorpay - accepts all Indian cards, UPI, Net Banking &amp; international cards
          </p>
          <p className="text-sm text-gray-500">
            14-day free trial on all paid plans · No credit card required to start
          </p>
          <p className="text-sm text-gray-500">
            Questions? <Link href="/contact" className="text-gold-700 hover:underline">Talk to us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
