"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export interface PlacementRow {
  id: string;
  slot: string;
  adType: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  badge: string;
  accent: string;
  countryCode: string | null;
  cpcEstimatePaise: number | null;
  affiliateRef: string | null;
  affiliateParam: string | null;
  isActive: boolean;
  priority: number;
  resolvedHref?: string;
}

export function AdminAdPlacementEditor({ placements }: { placements: PlacementRow[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, Partial<PlacementRow>>>({});

  const saveMutation = useMutation({
    mutationFn: async (id: string) => {
      const body = edits[id];
      if (!body) return;
      const res = await fetch(`/api/admin/ads/placements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: (_, id) => {
      setEdits((e) => { const n = { ...e }; delete n[id]; return n; });
      qc.invalidateQueries({ queryKey: ["ad-placements"] });
      toast({ title: "Placement saved — live on site immediately" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  function field(id: string, key: keyof PlacementRow, value: string | number | boolean | null) {
    setEdits((e) => ({ ...e, [id]: { ...e[id], [key]: value } }));
  }

  function val(p: PlacementRow, key: keyof PlacementRow) {
    const e = edits[p.id];
    if (e && key in e) return e[key] as string | number | boolean | null;
    return p[key];
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <strong>Affiliate IDs:</strong> Paste your partner ref in <em>Affiliate ref</em> (e.g. PolicyBazaar sub-id) or edit the full <em>Destination URL</em>.
        Use <em>Param name</em> for the query key (default <code>utm_content</code>). Changes go live immediately — no deploy needed.
      </div>

      {placements.map((p) => {
        const resolved = (edits[p.id]?.ctaHref ?? p.ctaHref) as string;
        const ref = (val(p, "affiliateRef") as string) ?? "";
        const param = (val(p, "affiliateParam") as string) ?? "utm_content";
        let preview = resolved;
        if (ref && !resolved.startsWith("/")) {
          try {
            const u = new URL(resolved);
            u.searchParams.set(param || "utm_content", ref);
            preview = u.toString();
          } catch { /* keep */ }
        }

        return (
          <div key={p.id} className="bg-white rounded-xl border p-5 space-y-3">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-gray-500">{p.slot} · {p.adType}</p>
                <p className="font-semibold text-gray-900">{val(p, "headline") as string}</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={val(p, "isActive") as boolean}
                  onChange={(e) => field(p.id, "isActive", e.target.checked)}
                />
                Live
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Destination URL (base)</label>
                <Input
                  value={val(p, "ctaHref") as string}
                  onChange={(e) => field(p.id, "ctaHref", e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Affiliate ref (partner ID)</label>
                <Input
                  value={ref}
                  placeholder="e.g. dealervoice_001"
                  onChange={(e) => field(p.id, "affiliateRef", e.target.value || null)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Param name</label>
                <Input
                  value={param}
                  placeholder="utm_content"
                  onChange={(e) => field(p.id, "affiliateParam", e.target.value || null)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Est. CPC (₹)</label>
                <Input
                  type="number"
                  value={((val(p, "cpcEstimatePaise") as number) ?? 0) / 100}
                  onChange={(e) => field(p.id, "cpcEstimatePaise", Math.round(Number(e.target.value) * 100))}
                />
              </div>
            </div>

            {preview.startsWith("http") && (
              <a href={preview} target="_blank" rel="noopener" className="text-xs text-gold-700 hover:underline inline-flex items-center gap-1">
                Preview live URL <ExternalLink size={12} />
              </a>
            )}

            {edits[p.id] && (
              <Button size="sm" className="gap-1 bg-gold-600 hover:bg-gold-700 text-white" onClick={() => saveMutation.mutate(p.id)} disabled={saveMutation.isPending}>
                <Save size={14} /> Save placement
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
