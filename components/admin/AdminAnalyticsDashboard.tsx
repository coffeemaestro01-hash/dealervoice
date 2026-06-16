"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  Eye,
  Users,
  MousePointerClick,
  Globe,
  Smartphone,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PIE_COLORS = ["#C9961E", "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

type Period = "24h" | "7d" | "30d" | "90d" | "all";

async function fetchOverview(period: Period) {
  const res = await fetch(`/api/admin/analytics?period=${period}`);
  if (!res.ok) throw new Error("Failed to load analytics");
  return res.json().then((j) => j.data);
}

async function fetchFunnel(period: Period) {
  const res = await fetch(`/api/admin/analytics?mode=funnel&period=${period}`);
  if (!res.ok) throw new Error("Failed to load funnel");
  return res.json().then((j) => j.data);
}

async function fetchEvents(period: Period, page: number) {
  const res = await fetch(`/api/admin/analytics?mode=events&period=${period}&page=${page}&limit=200`);
  if (!res.ok) throw new Error("Failed to load events");
  return res.json().then((j) => j.data);
}

export function AdminAnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>("30d");
  const [eventPage, setEventPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: () => fetchOverview(period),
  });

  const { data: funnel } = useQuery({
    queryKey: ["admin-funnel", period],
    queryFn: () => fetchFunnel(period),
  });

  const { data: eventLog } = useQuery({
    queryKey: ["admin-events", period, eventPage],
    queryFn: () => fetchEvents(period, eventPage),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">No analytics data yet. Traffic will appear as users visit the site.</p>;

  const kpis = [
    { label: "Page views", value: data.pageViews.toLocaleString(), icon: Eye, color: "text-primary bg-primary/10" },
    { label: "Unique sessions", value: data.uniqueSessions.toLocaleString(), icon: Users, color: "text-primary bg-muted" },
    { label: "Unique visitors", value: data.uniqueVisitors.toLocaleString(), icon: Globe, color: "text-primary bg-primary/10" },
    { label: "Logged-in users", value: data.loggedInUsers.toLocaleString(), icon: Users, color: "text-muted-foreground bg-muted" },
    { label: "Pages / session", value: String(data.avgPagesPerSession), icon: TrendingUp, color: "text-primary bg-primary/10" },
    { label: "Active sessions (24h)", value: data.activeSessions24h.toLocaleString(), icon: Activity, color: "text-primary bg-muted" },
    { label: "Ad clicks", value: data.adClicks.toLocaleString(), icon: MousePointerClick, color: "text-primary bg-primary/10" },
    { label: "Ad CTR", value: `${data.adCtr}%`, icon: MousePointerClick, color: "text-primary bg-primary/10" },
  ];

  const productKpis = [
    { label: "Signups", value: data.signups },
    { label: "Reviews", value: data.reviews },
    { label: "Claims", value: data.claims },
    { label: "Admin actions", value: data.auditActions },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Full-site tracking — every page view, session, referrer, and device.</p>
        <Select value={period} onValueChange={(v) => { setPeriod(v as Period); setEventPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card rounded-xl border p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-xl font-bold text-foreground mt-1">{k.value}</p>
              </div>
              <div className={cn("p-2 rounded-lg", k.color)}>
                <k.icon size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {productKpis.map((k) => (
          <div key={k.label} className="bg-muted text-foreground rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-foreground mb-4">Traffic over time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.dailyPageViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5, 10)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#C9961E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-foreground mb-4">Conversion funnel</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnel ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="step" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#C9961E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border p-5 lg:col-span-2">
          <h2 className="font-semibold text-foreground mb-4">Top pages (up to 100)</h2>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b sticky top-0 bg-card">
                <tr>
                  <th className="pb-2">Path</th>
                  <th className="pb-2 text-right">Views</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((p: { path: string; views: number }) => (
                  <tr key={p.path} className="border-b border-border">
                    <td className="py-2 font-mono text-xs text-foreground max-w-md truncate">{p.path}</td>
                    <td className="py-2 text-right font-medium">{p.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe size={16} /> Countries
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.countries.slice(0, 8)} dataKey="views" nameKey="country" cx="50%" cy="50%" outerRadius={80} label={({ country }) => country}>
                {data.countries.slice(0, 8).map((_: unknown, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-foreground mb-4">Top referrers</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.topReferrers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrer data yet</p>
            ) : (
              data.topReferrers.map((r: { referrer: string; views: number }) => (
                <div key={r.referrer} className="flex justify-between text-sm py-1 border-b border-border">
                  <span className="truncate text-foreground max-w-[80%]">{r.referrer}</span>
                  <span className="font-medium">{r.views}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Smartphone size={16} /> Devices & browsers
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Devices</p>
              {data.devices.map((d: { device: string; views: number }) => (
                <div key={d.device} className="flex justify-between text-sm py-1">
                  <span>{d.device}</span>
                  <span className="font-medium">{d.views}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Browsers</p>
              {data.browsers.slice(0, 8).map((b: { browser: string; views: number }) => (
                <div key={b.browser} className="flex justify-between text-sm py-1">
                  <span className="truncate max-w-[120px]">{b.browser}</span>
                  <span className="font-medium">{b.views}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <FileText size={16} /> Event log
            {eventLog && (
              <span className="text-xs font-normal text-muted-foreground">
                {eventLog.total.toLocaleString()} events · page {eventLog.page} of {eventLog.pages}
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={eventPage <= 1}
              onClick={() => setEventPage((p) => Math.max(1, p - 1))}
              className="text-xs px-3 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={!eventLog || eventPage >= eventLog.pages}
              onClick={() => setEventPage((p) => p + 1)}
              className="text-xs px-3 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-muted-foreground border-b sticky top-0 bg-card">
              <tr>
                <th className="pb-2 pr-3">Time</th>
                <th className="pb-2 pr-3">Type</th>
                <th className="pb-2 pr-3">Path</th>
                <th className="pb-2 pr-3">Country</th>
                <th className="pb-2 pr-3">Device</th>
                <th className="pb-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {(eventLog?.events ?? data.recentEvents).map((e: {
                id: string;
                createdAt: string;
                eventType: string;
                path: string;
                country?: string;
                device?: string;
                userRole?: string;
              }) => (
                <tr key={e.id} className="border-b border-border hover:bg-muted">
                  <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3">
                    <span className="px-1.5 py-0.5 rounded bg-muted font-mono">{e.eventType}</span>
                  </td>
                  <td className="py-2 pr-3 font-mono max-w-xs truncate">{e.path}</td>
                  <td className="py-2 pr-3">{e.country ?? "—"}</td>
                  <td className="py-2 pr-3">{e.device ?? "—"}</td>
                  <td className="py-2">{e.userRole ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
