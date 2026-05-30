"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const COLORS = { positive: "#22c55e", neutral: "#f59e0b", negative: "#ef4444" };

async function fetchAnalytics(dealershipId: string, period: string) {
  const res = await fetch(`/api/analytics/dealership?dealershipId=${dealershipId}&period=${period}`);
  if (!res.ok) throw new Error("Failed to load analytics");
  const json = await res.json();
  return json.data;
}

// Component uses dealershipId from URL or session
export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [dealershipId, setDealershipId] = useState(""); // populated from session

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", dealershipId, period],
    queryFn: () => fetchAnalytics(dealershipId, period),
    enabled: !!dealershipId,
  });

  // Fetch dealershipId from user's staff record on mount
  const { data: session } = useSession();

  useState(() => {
    if (!session?.user) return;
    fetch("/api/users/me/dealership")
      .then((r) => r.json())
      .then((d) => d.data?.id && setDealershipId(d.data.id))
      .catch(() => {});
  });

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : data ? (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "New Reviews", value: data.reviewCount, change: data.reviewCountChange },
              { label: "Avg Rating", value: `${(data.avgRating || 0).toFixed(1)}★`, change: data.avgRatingChange ? `${data.avgRatingChange > 0 ? "+" : ""}${data.avgRatingChange.toFixed(2)}` : null },
              { label: "Reputation Score", value: `${data.reputation?.total ?? 0}/100` },
              { label: "Verified Reviews", value: `${(data.verifiedPercent || 0).toFixed(0)}%` },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                {kpi.change !== undefined && kpi.change !== null && (
                  <div className={cn("flex items-center gap-1 text-xs mt-1 font-medium",
                    Number(kpi.change) > 0 ? "text-green-600" : Number(kpi.change) < 0 ? "text-red-600" : "text-gray-500")}>
                    {Number(kpi.change) > 0 ? <TrendingUp size={12} /> : Number(kpi.change) < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                    {kpi.change}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reviews over time */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Reviews Over Time</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.dailyReviews}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} name="Reviews" />
                <Line type="monotone" dataKey="avgRating" stroke="#f59e0b" strokeWidth={2} dot={false} name="Avg Rating" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Rating distribution */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Rating Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="rating" tickFormatter={(v) => `${v}★`} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sentiment */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Customer Sentiment</h2>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={[
                      { name: "Positive", value: data.sentiment.positive },
                      { name: "Neutral", value: data.sentiment.neutral },
                      { name: "Negative", value: data.sentiment.negative },
                    ]} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                      {["positive", "neutral", "negative"].map((key, i) => (
                        <Cell key={i} fill={COLORS[key as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Positive", value: data.sentiment.positive, color: "bg-green-500" },
                    { label: "Neutral", value: data.sentiment.neutral, color: "bg-amber-500" },
                    { label: "Negative", value: data.sentiment.negative, color: "bg-red-500" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${s.color}`} />
                      <span className="text-gray-600">{s.label}</span>
                      <span className="font-semibold ml-auto">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
