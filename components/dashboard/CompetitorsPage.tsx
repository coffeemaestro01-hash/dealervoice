"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, Plus, Trash2, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/common/StarRating";
import Link from "next/link";
import { buildDealerUrl } from "@/lib/utils";

interface CompetitorEntry {
  id: string;
  competitor: {
    id: string;
    name: string;
    slug: string;
    cityName: string | null;
    overallRating: number;
    totalReviews: number;
    reputationScore: number;
    country: { code: string };
    city: { slug: string } | null;
  };
}

async function searchDealers(q: string) {
  const res = await fetch(`/api/search/dealers?q=${encodeURIComponent(q)}&limit=8`);
  const json = await res.json();
  return json.data ?? json.dealers ?? [];
}

export function CompetitorsPage() {
  const qc = useQueryClient();
  const [dealershipId, setDealershipId] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/users/me/dealership")
      .then((r) => r.json())
      .then((d) => d.data?.id && setDealershipId(d.data.id));
  }, []);

  const { data: competitors = [], isLoading, error } = useQuery({
    queryKey: ["competitors", dealershipId],
    queryFn: async () => {
      const res = await fetch(`/api/competitors?dealershipId=${dealershipId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      return (json.data ?? []) as CompetitorEntry[];
    },
    enabled: !!dealershipId,
  });

  const addMutation = useMutation({
    mutationFn: async (competitorId: string) => {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealershipId, competitorId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to add");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["competitors", dealershipId] });
      setSearch("");
      setSearchResults([]);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/competitors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitors", dealershipId] }),
  });

  const handleSearch = async () => {
    if (search.length < 2) return;
    const results = await searchDealers(search);
    setSearchResults(results.filter((d: any) => d.id !== dealershipId));
  };

  if (!dealershipId) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <TrendingUp size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Competitor Intel</h1>
          <p className="text-muted-foreground text-sm">Track how you stack up against nearby dealerships</p>
        </div>
      </div>

      {error && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 text-sm text-primary">
          {(error as Error).message}
          <Link href="/dashboard/dealer/billing" className="ml-2 underline font-medium">Upgrade plan →</Link>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-5 mb-6 shadow-sm">
        <h2 className="font-semibold text-foreground mb-3">Add a competitor</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search dealership name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button variant="outline" onClick={handleSearch}><Search size={16} /></Button>
        </div>
        {searchResults.length > 0 && (
          <ul className="mt-3 border border-border rounded-lg divide-y divide-border">
            {searchResults.map((d: any) => (
              <li key={d.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span>{d.name} {d.cityName ? `· ${d.cityName}` : ""}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={addMutation.isPending}
                  onClick={() => addMutation.mutate(d.id)}
                >
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </li>
            ))}
          </ul>
        )}
        {addMutation.error && (
          <p className="text-destructive text-sm mt-2">{(addMutation.error as Error).message}</p>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading competitors…</p>
      ) : competitors.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No competitors tracked yet. Search above to add one.</p>
      ) : (
        <div className="grid gap-4">
          {competitors.map(({ id, competitor: c }) => (
            <div key={id} className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.cityName}</p>
                <div className="flex items-center gap-3 mt-2">
                  <StarRating rating={c.overallRating} size="sm" />
                  <span className="text-xs text-muted-foreground">{c.totalReviews} reviews</span>
                  <span className="text-xs font-medium text-primary">Score {c.reputationScore}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={buildDealerUrl(c as any)} target="_blank">
                  <Button variant="outline" size="sm"><ExternalLink size={14} /></Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => removeMutation.mutate(id)}>
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
