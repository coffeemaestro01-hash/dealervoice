"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, ExternalLink, FileText } from "lucide-react";
import { SubscriptionCheckoutButton } from "@/components/payment/SubscriptionCheckoutButton";
import { PLAN_PRICES_USD } from "@/lib/payment";
import { PLAN_SERVICE_AREA_LIMITS } from "@/lib/subscription/plan-limits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { PremiumUpgradeBanner } from "@/components/dashboard/PremiumUpgradeBanner";

interface Dealership {
  id: string;
  name: string;
  isPremiumClaimed?: boolean;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd?: string | null;
    stripeCustomerId?: string | null;
  } | null;
}

interface InvoiceRow {
  id: string;
  invoiceNumber: string | null;
  type: string;
  description: string | null;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  invoiceDate: string;
  paidAt: string | null;
}

function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${currency} ${(cents / 100).toFixed(2)}`;
  }
}

const PLANS = [
  {
    key: "PRO" as const,
    name: "Pro",
    monthly: PLAN_PRICES_USD.PRO.monthlyDisplay,
    annual: PLAN_PRICES_USD.PRO.annualDisplay,
    features: [`${PLAN_SERVICE_AREA_LIMITS.PRO} service areas`, "Full analytics", "Competitor monitoring", "AI response suggestions", "AI sales assistant (24/7 chat + leads)", "Featured Pro badge"],
  },
  {
    key: "PRO_PLUS" as const,
    name: "Pro+",
    monthly: PLAN_PRICES_USD.PRO_PLUS.monthlyDisplay,
    annual: PLAN_PRICES_USD.PRO_PLUS.annualDisplay,
    badge: "Best value",
    features: [`${PLAN_SERVICE_AREA_LIMITS.PRO_PLUS} service areas`, "Everything in Pro", "Featured Pro+ badge", "Priority placement", "Review backlink embed", "AI assistant: booking + follow-ups"],
  },
  {
    key: "ENTERPRISE" as const,
    name: "Enterprise",
    monthly: PLAN_PRICES_USD.ENTERPRISE.monthlyDisplay,
    annual: PLAN_PRICES_USD.ENTERPRISE.annualDisplay,
    features: [
      `${PLAN_SERVICE_AREA_LIMITS.ENTERPRISE} service areas · top of directories`,
      "Link 5 same-owner locations",
      "CEO research interviews",
      "Highest lead prospect priority",
      "API access & white-label reports",
    ],
  },
];

export function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showUpgrade = searchParams?.get("upgrade") === "1";
  const [dealership, setDealership] = useState<Dealership | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [promotionCode, setPromotionCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/me/dealership").then((r) => r.json()),
      fetch("/api/dealer/invoices").then((r) => r.json()),
    ])
      .then(([dealerRes, invoiceRes]) => {
        setDealership(dealerRes.data);
        setInvoices(invoiceRes.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const sessionId = searchParams?.get("session_id");
    if (!sessionId || !dealership?.id) return;

    fetch("/api/subscriptions/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealershipId: dealership.id, session_id: sessionId }),
    })
      .then((r) => r.json())
      .then(() => router.replace("/dashboard/dealer/billing"))
      .then(() => router.refresh())
      .catch(() => {});
  }, [searchParams, dealership?.id, router]);

  const currentPlan = dealership?.subscription?.plan ?? "FREE";
  const hasStripeCustomer = !!dealership?.subscription?.stripeCustomerId;

  async function openBillingPortal() {
    if (!dealership?.id) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealershipId: dealership.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading billing…</div>;
  }

  if (!dealership) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No dealership linked to your account.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <CreditCard size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Plans</h1>
          <p className="text-muted-foreground text-sm">{dealership.name}</p>
        </div>
      </div>

      <PremiumUpgradeBanner
        dealershipId={dealership.id}
        dealerName={dealership.name}
        isPremiumClaimed={dealership.isPremiumClaimed}
        subscription={dealership.subscription}
        showUpgradeQuery={showUpgrade}
      />

      <div className="bg-card rounded-xl border border-border p-5 mb-8 shadow-sm">
        <p className="text-sm text-muted-foreground mb-1">Current plan</p>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-foreground">{currentPlan}</span>
          <Badge variant="outline">{dealership.subscription?.status ?? "ACTIVE"}</Badge>
        </div>
        {dealership.subscription?.currentPeriodEnd && (
          <p className="text-xs text-muted-foreground mt-2">
            Renews {new Date(dealership.subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
        {hasStripeCustomer && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={openBillingPortal}
            disabled={portalLoading}
          >
            {portalLoading ? "Opening…" : "Manage billing"}
          </Button>
        )}
      </div>

      {invoices.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-primary" />
            <h2 className="font-semibold text-foreground">Invoice history</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="pb-2 pr-4 font-medium">Invoice</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 font-medium">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{inv.invoiceNumber ?? inv.id.slice(0, 8)}</td>
                    <td className="py-3 pr-4 capitalize">{inv.type.toLowerCase().replace(/_/g, " ")}</td>
                    <td className="py-3 pr-4">{formatMoney(inv.amount, inv.currency)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(inv.paidAt ?? inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      {inv.pdfUrl ? (
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          PDF <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(["monthly", "annual"] as const).map((i) => (
          <button
            key={i}
            onClick={() => setInterval(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              interval === i ? "bg-primary text-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {i === "monthly" ? "Monthly" : "Annual (save ~17%)"}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <label htmlFor="promo-code" className="text-sm font-medium text-foreground">
          Promotion code
        </label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">Optional — applied at checkout if you have one.</p>
        <input
          id="promo-code"
          type="text"
          value={promotionCode}
          onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          autoComplete="off"
          className="w-full max-w-xs rounded-lg border border-border px-3 py-2 text-sm font-mono uppercase"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          const price = interval === "monthly" ? plan.monthly : plan.annual;
          const highlighted = plan.key === "PRO_PLUS";
          return (
            <div
              key={plan.key}
              className={`bg-card rounded-xl border p-6 shadow-sm relative ${
                highlighted ? "border-primary/30 ring-1 ring-primary" : "border-border"
              }`}
            >
              {"badge" in plan && plan.badge && (
                <span className="absolute -top-2.5 left-4 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary text-night-900">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <p className="text-2xl font-bold text-foreground mt-2">
                {price}
                <span className="text-sm font-normal text-muted-foreground">/{interval === "monthly" ? "mo" : "yr"}</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {isCurrent ? (
                  <p className="text-center text-sm text-primary font-medium py-2">Current plan</p>
                ) : (
                  <SubscriptionCheckoutButton
                    dealershipId={dealership.id}
                    plan={plan.key}
                    interval={interval}
                    promotionCode={promotionCode}
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
