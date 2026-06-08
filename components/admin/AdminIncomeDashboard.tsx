"use client";

import { useState } from "react";
import type { IncomeSource } from "@prisma/client";
import { formatIncomeMinor, type IncomeDashboardStats } from "@/lib/income/ledger";

const SOURCE_LABELS: Record<IncomeSource, string> = {
  SUBSCRIPTION: "Subscription",
  SPONSORSHIP: "Sponsorship",
  AFFILIATE_CLICK: "Affiliate (est.)",
  AFFILIATE_PAYOUT: "Affiliate payout",
  ADSENSE: "Google AdSense",
  LEAD_FEE: "Lead fee",
  INVENTORY_FEE: "Inventory fee",
  OTHER: "Other",
};

export function AdminIncomeDashboard({ initial }: { initial: IncomeDashboardStats }) {
  const [stats, setStats] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    source: "ADSENSE" as IncomeSource,
    amountMajor: "",
    description: "",
    externalRef: "",
    countryCode: "",
  });
  const [msg, setMsg] = useState("");

  async function refresh() {
    const res = await fetch("/api/admin/income?days=30");
    const json = await res.json();
    if (json.data) setStats(json.data);
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const amountMinor = Math.round(parseFloat(form.amountMajor) * 100);
    if (!amountMinor || amountMinor <= 0) {
      setMsg("Enter a valid amount");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/admin/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: form.source,
        amountMinor,
        currency: "INR",
        status: "CONFIRMED",
        description: form.description,
        externalRef: form.externalRef || undefined,
        countryCode: form.countryCode || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setMsg("Failed to record");
      return;
    }
    setMsg("Recorded");
    setForm((f) => ({ ...f, amountMajor: "", description: "", externalRef: "" }));
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total (30d)" value={formatIncomeMinor(stats.grandTotalMinor)} />
        <Stat label="Confirmed / paid" value={formatIncomeMinor(stats.confirmedTotalMinor)} />
        <Stat label="Estimated" value={formatIncomeMinor(stats.estimatedTotalMinor)} />
        <Stat label="Line items" value={stats.recent.length} />
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">By source (30d)</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.totalsBySource.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-full">No income recorded yet — subscriptions and ad clicks will appear here.</p>
          ) : (
            stats.totalsBySource.map((r) => (
              <div key={r.source} className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">{SOURCE_LABELS[r.source]}</p>
                <p className="text-lg font-bold text-gray-900">{formatIncomeMinor(r.amountMinor)}</p>
                <p className="text-[10px] text-gray-400">{r.count} events</p>
              </div>
            ))
          )}
        </div>
      </div>

      {stats.totalsByCountry.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">By country (30d)</h2>
          <div className="flex flex-wrap gap-2">
            {stats.totalsByCountry.map((r) => (
              <span key={r.countryCode} className="text-sm rounded-full bg-gold-50 text-gold-900 px-3 py-1">
                {r.countryCode}: {formatIncomeMinor(r.amountMinor)} ({r.count})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Record income manually</h2>
        <p className="text-xs text-gray-500 mb-4">AdSense monthly payout, affiliate settlements, sponsorship cheques.</p>
        <form onSubmit={submitManual} className="grid sm:grid-cols-2 gap-3 max-w-2xl">
          <label className="text-sm">
            <span className="text-gray-600">Source</span>
            <select
              className="mt-1 w-full border rounded-lg h-10 px-2"
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as IncomeSource }))}
            >
              {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-gray-600">Amount (INR)</span>
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full border rounded-lg h-10 px-3"
              value={form.amountMajor}
              onChange={(e) => setForm((f) => ({ ...f, amountMajor: e.target.value }))}
              placeholder="e.g. 4500"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-gray-600">Description</span>
            <input
              className="mt-1 w-full border rounded-lg h-10 px-3"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="AdSense June 2026 payout"
              required
            />
          </label>
          <label className="text-sm">
            <span className="text-gray-600">External ref (optional)</span>
            <input
              className="mt-1 w-full border rounded-lg h-10 px-3"
              value={form.externalRef}
              onChange={(e) => setForm((f) => ({ ...f, externalRef: e.target.value }))}
              placeholder="adsense-2026-06"
            />
          </label>
          <label className="text-sm">
            <span className="text-gray-600">Country (optional)</span>
            <input
              className="mt-1 w-full border rounded-lg h-10 px-3"
              value={form.countryCode}
              onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value.toUpperCase() }))}
              placeholder="IN"
              maxLength={2}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 h-10 rounded-lg bg-gold-700 text-white font-medium hover:bg-gold-800 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Record income"}
          </button>
          {msg && <p className="text-sm text-gold-700 sm:col-span-2">{msg}</p>}
        </form>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <h2 className="font-semibold text-gray-900 p-6 border-b">Recent ledger (30d)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Source</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((r) => (
                <tr key={r.id} className="border-t border-gray-50">
                  <td className="p-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{SOURCE_LABELS[r.source]}</td>
                  <td className="p-3 font-medium">{formatIncomeMinor(r.amountMinor, r.currency)}</td>
                  <td className="p-3 text-xs">{r.status}</td>
                  <td className="p-3 text-gray-600 max-w-xs truncate">{r.description ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
