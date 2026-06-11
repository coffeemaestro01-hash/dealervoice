"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Loader2, Plus, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLAN_PRICES_USD } from "@/lib/payment";
import {
  DEFAULT_PRO_ONE_DOLLAR_CODE,
  formatPromoPrice,
  formatPromotionDiscount,
  PRESET_PERCENT_OFF,
} from "@/lib/promotions";

type Promotion = {
  id: string;
  code: string;
  label: string | null;
  plan: "PRO" | "ENTERPRISE" | null;
  interval: string | null;
  discountType: "FIXED" | "PERCENT";
  fixedPriceUsdCents: number | null;
  percentOff: number | null;
  active: boolean;
  maxRedemptions: number | null;
  timesRedeemed: number;
  expiresAt: string | null;
  createdAt: string;
};

type DiscountType = "FIXED" | "PERCENT";

const defaultForm = {
  code: "",
  label: "",
  plan: "PRO" as "PRO" | "ENTERPRISE",
  interval: "monthly" as "monthly" | "annual",
  discountType: "FIXED" as DiscountType,
  fixedPriceUsd: "1",
  percentOff: "10",
  maxRedemptions: "100",
};

export function AdminPromotionsManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/promotions");
    const json = await res.json();
    if (res.ok) setPromotions(json.promotions);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/admin/promotions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (res.ok) load();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    const body: Record<string, unknown> = {
      code: form.code,
      label: form.label || undefined,
      plan: form.plan,
      interval: form.interval,
      discountType: form.discountType,
      maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
    };

    if (form.discountType === "FIXED") {
      const fixedPriceUsdCents = Math.round(parseFloat(form.fixedPriceUsd) * 100);
      if (!Number.isFinite(fixedPriceUsdCents) || fixedPriceUsdCents < 1) {
        setError("Enter a valid fixed price in USD.");
        setCreating(false);
        return;
      }
      body.fixedPriceUsdCents = fixedPriceUsdCents;
    } else {
      const percentOff = Number(form.percentOff);
      if (!Number.isInteger(percentOff) || percentOff < 1 || percentOff > 100) {
        setError("Percent off must be a whole number between 1 and 100.");
        setCreating(false);
        return;
      }
      body.percentOff = percentOff;
    }

    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Failed to create promotion");
      setCreating(false);
      return;
    }
    setShowForm(false);
    setForm(defaultForm);
    setCreating(false);
    load();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  }

  const listPrice = (plan: string | null, interval: string | null) => {
    if (!plan || !interval) return "—";
    const prices = PLAN_PRICES_USD[plan as "PRO" | "ENTERPRISE"];
    return interval === "annual" ? prices.annualDisplay : prices.monthlyDisplay;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="text-gold-600" size={24} />
            Promotions & discounts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Stripe promotion codes for subscription discounts. Dealers enter codes at checkout on the billing page.
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-gray-900 hover:bg-gray-800 text-white gap-2"
        >
          <Plus size={16} /> New promotion
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Create promotion code</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Code</label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="PRO1USD"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Label (optional)</label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Launch promo"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value as "PRO" | "ENTERPRISE" })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Billing interval</label>
              <select
                value={form.interval}
                onChange={(e) => setForm({ ...form, interval: e.target.value as "monthly" | "annual" })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-500">Discount type</label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, discountType: "FIXED" })}
                  className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                    form.discountType === "FIXED"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Fixed price
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, discountType: "PERCENT" })}
                  className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                    form.discountType === "PERCENT"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Percentage off
                </button>
              </div>
            </div>
            {form.discountType === "FIXED" ? (
              <div>
                <label className="text-xs font-medium text-gray-500">Fixed price (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.fixedPriceUsd}
                  onChange={(e) => setForm({ ...form, fixedPriceUsd: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-500">Percent off</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {PRESET_PERCENT_OFF.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setForm({ ...form, percentOff: String(pct) })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        form.percentOff === String(pct)
                          ? "bg-gold-800 text-white border-gold-800"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gold-300"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={form.percentOff}
                  onChange={(e) => setForm({ ...form, percentOff: e.target.value })}
                  placeholder="Custom %"
                  className="mt-2 max-w-[120px]"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-500">Max redemptions</label>
              <Input
                type="number"
                min="1"
                value={form.maxRedemptions}
                onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={creating} className="bg-gold-800 hover:bg-gold-900 text-white">
              {creating ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Create in Stripe
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
        <p className="font-semibold">Default launch code: {DEFAULT_PRO_ONE_DOLLAR_CODE}</p>
        <p className="mt-1 text-amber-800">
          Pro monthly at {formatPromoPrice(100)}/mo (normally {PLAN_PRICES_USD.PRO.monthlyDisplay}/mo). Auto-created on first visit if missing.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 py-8">
          <Loader2 size={18} className="animate-spin" /> Loading promotions…
        </div>
      ) : promotions.length === 0 ? (
        <p className="text-gray-500 py-8">No promotion codes yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Discount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Redemptions</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-gray-900">{p.code}</span>
                      <button
                        type="button"
                        onClick={() => copyCode(p.code)}
                        className="text-gray-400 hover:text-gold-700"
                        title="Copy code"
                      >
                        <Copy size={14} />
                      </button>
                      {copied === p.code && <span className="text-xs text-green-600">Copied</span>}
                    </div>
                    {p.label && <p className="text-xs text-gray-400 mt-0.5">{p.label}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.plan ?? "Any"} · {p.interval ?? "any"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-green-700">{formatPromotionDiscount(p)}</span>
                    <span className="text-gray-400 text-xs ml-1">from {listPrice(p.plan, p.interval)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.timesRedeemed}
                    {p.maxRedemptions != null ? ` / ${p.maxRedemptions}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleActive(p.id, !p.active)}
                      className="text-gray-500 hover:text-gray-900"
                      title={p.active ? "Deactivate" : "Activate"}
                    >
                      {p.active ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
