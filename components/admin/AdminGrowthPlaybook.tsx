"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Zap, Mail, Users, DollarSign, RefreshCw, MapPin, Database } from "lucide-react";

type Props = {
  metrics: {
    coverage: {
      il: number;
      chicagoland: number;
      ilWithEmail: number;
      ilNoEmail: number;
      customerUsers: number;
    };
    publishedReviews: number;
    paidSubs: number;
    mrrDollars: number;
    confirmedRevenue: number;
    ilEmail: number;
    outreach: { dripActive: number; notStarted: number; illinoisWithEmail: number };
    progress: { reviews: number; subs: number; mrr: number; ilEmail: number };
    targets: { publishedReviews: number; activeProSubs: number; mrrDollars: number; ilDealersWithEmail: number };
    playbook: readonly { week: number; theme: string; actions: readonly string[]; target: string }[];
  };
};

const ACTIONS = [
  { id: "import_chicagoland", label: "Import Chicagoland OSM", icon: Database },
  { id: "discover_chicagoland", label: "Discover Chicagoland emails", icon: MapPin },
  { id: "discover_il", label: "Discover IL emails", icon: Mail },
  { id: "discover_us", label: "Discover US emails", icon: Mail },
  { id: "drip", label: "Run outreach drip", icon: Zap },
  { id: "nudge_reviews", label: "Nudge dealers for reviews", icon: Users },
  { id: "outreach_buyers", label: "Email buyers for reviews", icon: Users },
  { id: "backfill_income", label: "Sync Stripe → income", icon: DollarSign },
] as const;

export function AdminGrowthPlaybook({ metrics }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const run = async (action: string) => {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/growth/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast({ title: "Done", description: JSON.stringify(data.result).slice(0, 120) });
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {metrics.coverage.il < 200 ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <strong className="text-destructive">Inventory gap:</strong> only{" "}
          <strong>{metrics.coverage.il}</strong> Illinois dealers listed ({metrics.coverage.chicagoland} Chicagoland).
          Real metro has 500+. Click <strong>Import Chicagoland OSM</strong> below — this is the #1 blocker to revenue.
        </div>
      ) : null}

      <div className="bg-card rounded-xl border border-primary/20 p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Zap size={18} className="text-primary" /> 30-day revenue sprint — live progress
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <ProgressBar label="Reviews" current={metrics.publishedReviews} target={metrics.targets.publishedReviews} pct={metrics.progress.reviews} />
          <ProgressBar label="Paying subs" current={metrics.paidSubs} target={metrics.targets.activeProSubs} pct={metrics.progress.subs} />
          <ProgressBar label="MRR" current={`$${metrics.mrrDollars}`} target={`$${metrics.targets.mrrDollars}`} pct={metrics.progress.mrr} />
          <ProgressBar label="IL w/ email" current={metrics.ilEmail} target={metrics.targets.ilDealersWithEmail} pct={metrics.progress.ilEmail} />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Confirmed revenue (ledger): <strong className="text-foreground">${metrics.confirmedRevenue.toLocaleString()}</strong> · Active drips:{" "}
          {metrics.outreach.dripActive} · Ready to start: {metrics.outreach.notStarted}
        </p>
      </div>

      <div className="bg-card rounded-xl border p-6">
        <h2 className="font-semibold text-foreground mb-3">Run growth actions now</h2>
        <p className="text-sm text-muted-foreground mb-4">One-click ops — same automations as the daily growth cron.</p>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              size="sm"
              variant="outline"
              className="gap-1.5 border-primary/30"
              disabled={!!loading}
              onClick={() => run(id)}
            >
              {loading === id ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
              {label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => window.location.reload()}>
            <RefreshCw size={14} /> Refresh stats
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6">
        <h2 className="font-semibold text-foreground mb-4">Marketing playbook</h2>
        <div className="space-y-4">
          {metrics.playbook.map((week) => (
            <div key={week.week} className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Week {week.week}</span>
                <span className="font-medium text-foreground">{week.theme}</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {week.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="text-xs text-primary mt-2 font-medium">Target: {week.target}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  current,
  target,
  pct,
}: {
  label: string;
  current: string | number;
  target: string | number;
  pct: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {current} / {target}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
