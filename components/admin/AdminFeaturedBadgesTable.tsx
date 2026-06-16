"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedPlanBadge } from "@/components/dealer/FeaturedPlanBadge";
import type { PaidPlan } from "@/lib/dealer/featured-badge";
import { buildFeaturedBadgeEmbedHtml } from "@/lib/reviews/backlink";

export type AdminFeaturedBadgeRow = {
  id: string;
  name: string;
  slug: string;
  cityName: string | null;
  status: string;
  featuredBadgeEnabled: boolean;
  plan: PaidPlan;
  subscriptionStatus: string;
};

export function AdminFeaturedBadgesTable({ dealers }: { dealers: AdminFeaturedBadgeRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleBadge(id: string, enabled: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/featured-badges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredBadgeEnabled: enabled }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Update failed");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (dealers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground rounded-xl border border-border bg-card p-6">
        No claimed paying dealers yet. Badges appear automatically when a dealer claims their profile and
        subscribes to Pro, Pro+, or Enterprise.
      </p>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-muted text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Dealership</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Badge preview</th>
            <th className="px-4 py-3">Embed</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {dealers.map((d) => (
            <tr key={d.id} className="hover:bg-muted/50">
              <td className="px-4 py-3">
                <Link href={`/dealership/${d.slug}`} className="font-medium text-primary hover:underline">
                  {d.name}
                </Link>
                <p className="text-xs text-muted-foreground">{d.cityName ?? "—"}</p>
              </td>
              <td className="px-4 py-3">
                <FeaturedPlanBadge plan={d.plan} />
              </td>
              <td className="px-4 py-3">
                <FeaturedPlanBadge plan={d.plan} size="md" />
              </td>
              <td className="px-4 py-3 max-w-xs">
                <code className="text-[10px] block truncate text-muted-foreground">
                  {buildFeaturedBadgeEmbedHtml(d.slug, d.name, d.plan).slice(0, 80)}…
                </code>
              </td>
              <td className="px-4 py-3">
                {d.featuredBadgeEnabled ? (
                  <span className="text-xs font-medium text-primary">Visible</span>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">Hidden</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {busyId === d.id ? (
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleBadge(d.id, !d.featuredBadgeEnabled)}
                    >
                      {d.featuredBadgeEnabled ? "Disable" : "Enable"}
                    </Button>
                  )}
                  <Link
                    href={`/dealership/${d.slug}`}
                    target="_blank"
                    className="text-muted-foreground hover:text-primary"
                    title="View profile"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
