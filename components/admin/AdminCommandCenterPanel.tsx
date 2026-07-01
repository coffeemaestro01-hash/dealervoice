"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Zap,
  Gift,
  Mail,
  DollarSign,
  Activity,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

type GiftCardRow = {
  id: string;
  status: string;
  recipientEmail: string;
  recipientName: string | null;
  amountCents: number;
  notes: string | null;
  sentAt: Date | string | null;
  review: { id: string; title: string; overallRating: number; publishedAt: Date | string | null };
  dealership: { name: string; slug: string; cityName: string | null };
  markedBy: { name: string } | null;
};

type JobRow = {
  id: string;
  jobType: string;
  status: string;
  summary: string;
  startedAt: Date | string;
  finishedAt: Date | string | null;
  actor: { name: string } | null;
};

type Props = {
  data: {
    revenue: {
      mrrEstimate: number;
      confirmedRevenue: number;
      proCount: number;
      proPlusCount: number;
      enterpriseCount: number;
      claimedDealers: number;
      premiumDealers: number;
      claimsPending: number;
    };
    outreach: {
      ilUnclaimedWithEmail: number;
      ilContactedInDrip: number;
      ilClaimedFree: number;
    };
    giftCards: {
      maxSlots: number;
      amountDollars: number;
      used: number;
      slotsRemaining: number;
      eligible: number;
      approved: number;
      sent: number;
      declined: number;
      queue: GiftCardRow[];
    };
    recentJobs: JobRow[];
  };
};

const STATUS_COLORS: Record<string, string> = {
  ELIGIBLE: "bg-amber-500/15 text-amber-700",
  APPROVED: "bg-blue-500/15 text-blue-700",
  SENT: "bg-green-500/15 text-green-700",
  DECLINED: "bg-muted text-muted-foreground",
  SUCCESS: "bg-green-500/15 text-green-700",
  PARTIAL: "bg-amber-500/15 text-amber-700",
  FAILED: "bg-destructive/15 text-destructive",
  RUNNING: "bg-primary/15 text-primary",
};

export function AdminCommandCenterPanel({ data }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const runOutreach = async () => {
    setLoading("outreach");
    try {
      const res = await fetch("/api/admin/command-center/outreach-push", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast({
        title: "Outreach push complete",
        description: json.result
          ? `${json.result.followUps?.sent ?? 0} drips · ${json.result.autoStartIl?.started ?? 0} new · ${json.result.upgradeNudges?.sent ?? 0} upgrades`
          : "Done",
      });
      window.location.reload();
    } catch (e) {
      toast({
        title: "Push failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const backfillGiftCards = async () => {
    setLoading("backfill");
    try {
      const res = await fetch("/api/admin/command-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "backfill_gift_cards" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast({ title: "Backfill done", description: `${json.result?.created ?? 0} gift cards created` });
      window.location.reload();
    } catch (e) {
      toast({
        title: "Backfill failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const updateGiftCard = async (id: string, status: string) => {
    setLoading(`gift-${id}-${status}`);
    try {
      const res = await fetch("/api/admin/gift-cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast({ title: `Marked ${status.toLowerCase()}` });
      window.location.reload();
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const { revenue, outreach, giftCards, recentJobs } = data;

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="MRR estimate"
          value={`$${revenue.mrrEstimate.toLocaleString()}`}
          sub={`$${revenue.confirmedRevenue.toLocaleString()} confirmed`}
          href="/dashboard/admin/revenue"
        />
        <StatCard
          icon={Activity}
          label="Paid subs"
          value={revenue.proCount + revenue.proPlusCount + revenue.enterpriseCount}
          sub={`${revenue.premiumDealers} premium · ${revenue.claimsPending} claims pending`}
          href="/dashboard/admin/subscriptions"
        />
        <StatCard
          icon={Mail}
          label="IL outreach"
          value={outreach.ilContactedInDrip}
          sub={`${outreach.ilUnclaimedWithEmail} unclaimed w/ email · ${outreach.ilClaimedFree} FREE claimed`}
          href="/dashboard/admin/outreach"
        />
        <StatCard
          icon={Gift}
          label="Gift cards"
          value={`${giftCards.used}/${giftCards.maxSlots}`}
          sub={`$${giftCards.amountDollars} each · ${giftCards.slotsRemaining} slots left`}
          href="/dashboard/admin/command-center#gift-cards"
        />
      </div>

      <div className="bg-card rounded-xl border border-primary/20 p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Zap size={18} className="text-primary" /> Run automations
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            disabled={!!loading}
            onClick={runOutreach}
          >
            {loading === "outreach" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Mail size={14} />
            )}
            Chicagoland revenue push
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={!!loading}
            onClick={backfillGiftCards}
          >
            {loading === "backfill" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Sync gift card queue
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/admin/revenue">Revenue ops →</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/admin/outreach">Outreach queue →</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Every run is logged below. CLI: <code className="text-foreground">npm run outreach:chicagoland-push</code>
        </p>
      </div>

      <div id="gift-cards" className="bg-card rounded-xl border p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Gift size={18} className="text-primary" /> Chicagoland review gift cards
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              First {giftCards.maxSlots} verified Chicagoland reviews → ${giftCards.amountDollars} gift card.
              Banner live on{" "}
              <Link href="/chicago/review" className="text-primary hover:underline" target="_blank">
                /chicago/review
              </Link>
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline">{giftCards.eligible} eligible</Badge>
            <Badge variant="outline">{giftCards.approved} approved</Badge>
            <Badge variant="outline">{giftCards.sent} sent</Badge>
          </div>
        </div>

        {giftCards.queue.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No gift cards in queue yet. Publish + verify Chicagoland reviews, or click Sync gift card queue.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="pb-2 pr-3">Reviewer</th>
                  <th className="pb-2 pr-3">Dealer</th>
                  <th className="pb-2 pr-3">Review</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {giftCards.queue.map((row) => (
                  <tr key={row.id} className="border-b border-border/50">
                    <td className="py-3 pr-3">
                      <p className="font-medium">{row.recipientName ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{row.recipientEmail}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <Link
                        href={`/dealers/${row.dealership.slug}`}
                        className="text-primary hover:underline"
                        target="_blank"
                      >
                        {row.dealership.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{row.dealership.cityName}</p>
                    </td>
                    <td className="py-3 pr-3 max-w-[200px] truncate" title={row.review.title}>
                      {row.review.title}
                      <span className="text-xs text-muted-foreground ml-1">★{row.review.overallRating}</span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[row.status] ?? ""}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.status === "ELIGIBLE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!loading}
                            onClick={() => updateGiftCard(row.id, "APPROVED")}
                          >
                            Approve
                          </Button>
                        )}
                        {(row.status === "ELIGIBLE" || row.status === "APPROVED") && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!loading}
                            onClick={() => updateGiftCard(row.id, "SENT")}
                          >
                            Mark sent
                          </Button>
                        )}
                        {row.status !== "SENT" && row.status !== "DECLINED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={!!loading}
                            className="text-destructive"
                            onClick={() => updateGiftCard(row.id, "DECLINED")}
                          >
                            Decline
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border p-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity size={18} /> Automation run log
        </h2>
        {recentJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No runs logged yet.</p>
        ) : (
          <div className="space-y-2">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-wrap items-center gap-2 py-2 border-b border-border/50 text-sm"
              >
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[job.status] ?? ""}`}>
                  {job.status}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{job.jobType}</span>
                <span className="flex-1 min-w-[200px]">{job.summary}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(job.startedAt).toLocaleString()}
                  {job.actor ? ` · ${job.actor.name}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
        <Link
          href="/dashboard/admin/audit"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-4"
        >
          Full audit log <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string | number;
  sub: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-card rounded-xl border p-5 hover:border-primary/30 transition-colors block"
    >
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon size={14} className="text-primary" />
        {label}
      </div>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </Link>
  );
}
