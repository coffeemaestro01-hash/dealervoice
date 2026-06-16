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
        currency: "USD",
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

      <div className="bg-card rounded-xl border p-6">
        <h2 className="font-semibold text-foreground mb-4">By source (30d)</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.totalsBySource.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-full">No income recorded yet — subscriptions and ad clicks will appear here.</p>
          ) : (
            stats.totalsBySource.map((r) => (
              <div key={r.source} className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">{SOURCE_LABELS[r.source]}</p>
                <p className="text-lg font-bold text-foreground">{formatIncomeMinor(r.amountMinor)}</p>
                <p className="text-[10px] text-muted-foreground">{r.count} events</p>
              </div>
            ))
          )}
        </div>
      </div>

      {stats.totalsByCountry.length > 0 && (
        <div className="bg-card rounded-xl border p-6">
          <h2 className="font-semibold text-foreground mb-4">By country (30d)</h2>
          <div className="flex flex-wrap gap-2">
            {stats.totalsByCountry.map((r) => (
              <span key={r.countryCode} className="text-sm rounded-full bg-primary/10 text-foreground px-3 py-1">
                {r.countryCode}: {formatIncomeMinor(r.amountMinor)} ({r.count})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border p-6">
        <h2 className="font-semibold text-foreground mb-2">Record income manually</h2>
        <p className="text-xs text-muted-foreground mb-4">AdSense monthly payout, affiliate settlements, sponsorship cheques.</p>
        <form onSubmit={submitManual} className="grid sm:grid-cols-2 gap-3 max-w-2xl">
          <label className="text-sm">
            <span className="text-muted-foreground">Source</span>
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
            <span className="text-muted-foreground">Amount (USD)</span>
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full border rounded-lg h-10 px-3"
              value={form.amountMajor}
              onChange={(e) => setForm((f) => ({ ...f, amountMajor: e.target.value }))}
              placeholder="e.g. 199"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-muted-foreground">Description</span>
            <input
              className="mt-1 w-full border rounded-lg h-10 px-3"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="AdSense June 2026 payout"
              required
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">External ref (optional)</span>
            <input
              className="mt-1 w-full border rounded-lg h-10 px-3"
              value={form.externalRef}
              onChange={(e) => setForm((f) => ({ ...f, externalRef: e.target.value }))}
              placeholder="adsense-2026-06"
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Country (optional)</span>
            <input
              className="mt-1 w-full border rounded-lg h-10 px-3"
              value={form.countryCode}
              onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value.toUpperCase() }))}
              placeholder="US"
              maxLength={2}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 h-10 rounded-lg bg-primary/90 text-foreground font-medium hover:bg-primary disabled:opacity-50"
          >
            {loading ? "Saving…" : "Record income"}
          </button>
          {msg && <p className="text-sm text-primary sm:col-span-2">{msg}</p>}
        </form>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <h2 className="font-semibold text-foreground p-6 border-b">Recent ledger (30d)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground">
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
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{SOURCE_LABELS[r.source]}</td>
                  <td className="p-3 font-medium">{formatIncomeMinor(r.amountMinor, r.currency)}</td>
                  <td className="p-3 text-xs">{r.status}</td>
                  <td className="p-3 text-muted-foreground max-w-xs truncate">{r.description ?? "—"}</td>
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
    <div className="bg-card rounded-xl border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}
