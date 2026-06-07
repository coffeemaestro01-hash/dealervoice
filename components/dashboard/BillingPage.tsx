"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard } from "lucide-react";
import { SubscriptionCheckoutButton } from "@/components/payment/SubscriptionCheckoutButton";
import { PLAN_PRICES_INR } from "@/lib/payment";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Dealership {
  id: string;
  name: string;
  subscription?: { plan: string; status: string; currentPeriodEnd?: string | null } | null;
}

const PLANS = [
  {
    key: "PRO" as const,
    name: "Pro",
    monthly: PLAN_PRICES_INR.PRO.monthlyDisplay,
    annual: PLAN_PRICES_INR.PRO.annualDisplay,
    features: ["5 locations", "Full analytics", "Competitor monitoring", "AI response suggestions", "Verified badge"],
  },
  {
    key: "ENTERPRISE" as const,
    name: "Enterprise",
    monthly: PLAN_PRICES_INR.ENTERPRISE.monthlyDisplay,
    annual: PLAN_PRICES_INR.ENTERPRISE.annualDisplay,
    features: ["Unlimited locations", "API access", "White-label reports", "Dedicated support", "SSO / SAML"],
  },
];

export function BillingPage() {
  const router = useRouter();
  const [dealership, setDealership] = useState<Dealership | null>(null);
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me/dealership")
      .then((r) => r.json())
      .then((d) => setDealership(d.data))
      .finally(() => setLoading(false));
  }, []);

  const currentPlan = dealership?.subscription?.plan ?? "FREE";

  if (loading) {
    return <div className="p-8 text-gray-500">Loading billing…</div>;
  }

  if (!dealership) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No dealership linked to your account.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gold-50 text-gold-700">
          <CreditCard size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
          <p className="text-gray-500 text-sm">{dealership.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Current plan</p>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-gray-900">{currentPlan}</span>
          <Badge variant="outline">{dealership.subscription?.status ?? "ACTIVE"}</Badge>
        </div>
        {dealership.subscription?.currentPeriodEnd && (
          <p className="text-xs text-gray-400 mt-2">
            Renews {new Date(dealership.subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {(["monthly", "annual"] as const).map((i) => (
          <button
            key={i}
            onClick={() => setInterval(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              interval === i ? "bg-gold-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gold-300"
            }`}
          >
            {i === "monthly" ? "Monthly" : "Annual (save ~17%)"}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          const price = interval === "monthly" ? plan.monthly : plan.annual;
          return (
            <div
              key={plan.key}
              className={`bg-white rounded-xl border p-6 shadow-sm ${plan.key === "PRO" ? "border-gold-300 ring-1 ring-gold-100" : "border-gray-100"}`}
            >
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {price}
                <span className="text-sm font-normal text-gray-500">/{interval === "monthly" ? "mo" : "yr"}</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {isCurrent ? (
                  <p className="text-center text-sm text-gold-700 font-medium py-2">Current plan</p>
                ) : (
                  <SubscriptionCheckoutButton
                    dealershipId={dealership.id}
                    plan={plan.key}
                    interval={interval}
                    label={`Upgrade to ${plan.name}`}
                    onSuccess={() => router.refresh()}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
