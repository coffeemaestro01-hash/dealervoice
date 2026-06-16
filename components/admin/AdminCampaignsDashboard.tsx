"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Plus, Search, Sparkles, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pct } from "@/lib/campaigns/metrics";
import { cn } from "@/lib/utils";

type Campaign = {
  id: string;
  name: string;
  subject: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  unsubscribeCount: number;
  conversionCount: number;
  sentAt: string | null;
  createdAt: string;
  country: { name: string; code: string } | null;
  createdBy: { name: string | null } | null;
};

const STATUS_STYLE: Record<string, string> = {
  SENT: "bg-muted text-primary border-primary/20",
  DRAFT: "bg-muted text-muted-foreground border-border",
  SENDING: "bg-primary/10 text-primary border-primary/20",
  FAILED: "bg-destructive/10 text-destructive border-primary/20",
};

function MetricCell({ label, value, rate }: { label: string; value: number; rate?: string }) {
  return (
    <div className="text-center min-w-[72px]">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value.toLocaleString()}</p>
      {rate && <p className="text-[10px] text-muted-foreground">{rate}</p>}
    </div>
  );
}

export function AdminCampaignsDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/admin/campaigns?${params}`);
    const json = await res.json();
    if (res.ok) {
      setCampaigns(json.campaigns);
      setTotal(json.total);
      setPages(json.pages);
    }
    setLoading(false);
  }, [page, q, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="text-primary" size={24} />
            Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Email outreach to dealers — claim invites, review prompts, and growth campaigns.
          </p>
        </div>
        <Link href="/dashboard/admin/campaigns/new">
          <Button className="bg-foreground hover:bg-foreground text-foreground gap-2">
            <Plus size={16} /> Create campaign
          </Button>
        </Link>
      </div>

      <div className="border-b border-border">
        <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-foreground border-b-2 border-primary/30">
          <Mail size={14} /> Email
        </span>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for a campaign"
            className="pl-9"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
        </div>
        <select
          className="h-10 border rounded-md px-3 text-sm text-foreground"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="all">All statuses</option>
          <option value="sent">Sent</option>
          <option value="draft">Draft</option>
          <option value="sending">Sending</option>
          <option value="failed">Failed</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto">
          {total === 0 ? "0" : `${(page - 1) * 20 + 1}–${Math.min(page * 20, total)}`} of {total}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-border bg-card">
          <Mail className="mx-auto text-muted-foreground mb-3" size={40} />
          <p className="text-muted-foreground font-medium">No campaigns yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first dealer outreach email.</p>
          <Link href="/dashboard/admin/campaigns/new">
            <Button className="bg-foreground hover:bg-foreground text-foreground">Create campaign</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const recipients = c.sentCount || c.recipientCount;
            return (
              <article
                key={c.id}
                className="bg-card rounded-xl border border-border hover:border-border hover:shadow-sm transition-all p-4 md:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1.5 rounded border-border" aria-label="Select campaign" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", STATUS_STYLE[c.status] ?? STATUS_STYLE.DRAFT)}>
                            {c.status.charAt(0) + c.status.slice(1).toLowerCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{c.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {c.sentAt
                            ? new Date(c.sentAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
                            : `Created ${new Date(c.createdAt).toLocaleDateString("en-US")}`}
                          {c.country ? ` · ${c.country.name}` : ""}
                          <span className="text-muted-foreground"> · #{c.id.slice(-6)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 lg:gap-6 pl-7 lg:pl-0">
                    <MetricCell label="Recipients" value={recipients} rate={recipients > 0 ? "100%" : undefined} />
                    <MetricCell label="Opens" value={c.openCount} rate={pct(c.openCount, recipients)} />
                    <MetricCell label="Clicks" value={c.clickCount} rate={pct(c.clickCount, recipients)} />
                    <MetricCell label="Unsubscribed" value={c.unsubscribeCount} rate={pct(c.unsubscribeCount, recipients)} />
                    <MetricCell
                      label="Conversions"
                      value={c.conversionCount}
                      rate={c.conversionCount > 0 ? pct(c.conversionCount, recipients) : undefined}
                    />
                    <button type="button" className="p-2 text-muted-foreground hover:text-primary" title="AI insights (coming soon)">
                      <Sparkles size={16} />
                    </button>
                    <button type="button" className="p-2 text-muted-foreground hover:text-muted-foreground">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground self-center">Page {page} of {pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
