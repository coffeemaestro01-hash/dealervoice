"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Copy, Phone, MessageCircle, Mail, Check, SkipForward, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  buildClaimEmail,
  buildReviewInviteEmail,
  buildWhatsAppClaim,
  buildPhoneScript,
  whatsappHref,
  profileUrl,
} from "@/lib/outreach/templates";
import { EMAILS } from "@/lib/constants/emails";

type Dealer = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  website: string | null;
  cityName: string | null;
  stateName: string | null;
  districtName: string | null;
  outreachStatus: string | null;
  lastOutreachAt: string | null;
  outreachNotes: string | null;
  totalReviews: number;
};

async function fetchQueue(params: URLSearchParams) {
  const res = await fetch(`/api/admin/outreach?${params}`);
  if (!res.ok) throw new Error("Failed to load queue");
  return res.json().then((j) => j.data);
}

export function AdminOutreachQueue() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [state, setState] = useState("");
  const [status, setStatus] = useState("pending");
  const [hasWebsite, setHasWebsite] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState<Record<string, string>>({});

  const params = new URLSearchParams({ page: String(page), limit: "50", status });
  if (state) params.set("state", state);
  if (hasWebsite) params.set("hasWebsite", "1");

  const { data, isLoading } = useQuery({
    queryKey: ["outreach-queue", page, state, status, hasWebsite],
    queryFn: () => fetchQueue(params),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }: { id: string; outreachStatus?: string; outreachNotes?: string; email?: string }) => {
      const res = await fetch(`/api/admin/outreach/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outreach-queue"] });
      toast({ title: "Updated" });
    },
  });

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast({ title: `Copied ${label}` });
  }

  if (isLoading) return <p className="text-sm text-gray-500">Loading contact queue…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="border rounded-md px-3 h-10 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="pending">Pending outreach</option>
          <option value="contacted">Contacted</option>
          <option value="responded">Responded</option>
          <option value="skipped">Skipped</option>
          <option value="all">All</option>
        </select>
        <select
          className="border rounded-md px-3 h-10 text-sm"
          value={state}
          onChange={(e) => { setState(e.target.value); setPage(1); }}
        >
          <option value="">All states</option>
          {(data?.stateCounts ?? []).map((s: { state: string; count: number }) => (
            <option key={s.state} value={s.state}>{s.state} ({s.count})</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={hasWebsite} onChange={(e) => { setHasWebsite(e.target.checked); setPage(1); }} />
          Has website only
        </label>
        <span className="text-sm text-gray-500 ml-auto">
          {data?.total?.toLocaleString() ?? 0} dealers · phone, no email · unclaimed
        </span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
        <strong>Outreach from:</strong> {EMAILS.dealers} · Copy templates below, or use WhatsApp / phone. Mark contacted when done.
      </div>

      <div className="space-y-3">
        {(data?.dealers ?? []).map((d: Dealer) => {
          const ctx = { name: d.name, slug: d.slug, cityName: d.cityName, stateName: d.stateName, phone: d.phone, website: d.website };
          const claim = buildClaimEmail(ctx);
          const wa = buildWhatsAppClaim(ctx);
          const open = expandedId === d.id;

          return (
            <div key={d.id} className="bg-white rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={profileUrl(d.slug)} className="font-semibold text-gray-900 hover:text-gold-700" target="_blank">
                    {d.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {[d.cityName, d.districtName, d.stateName].filter(Boolean).join(", ")}
                    {d.totalReviews > 0 && ` · ${d.totalReviews} reviews`}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-sm">
                    {d.phone && (
                      <a href={`tel:${d.phone}`} className="inline-flex items-center gap-1 text-gold-700 hover:underline">
                        <Phone size={14} /> {d.phone}
                      </a>
                    )}
                    {d.website && (
                      <a href={d.website.startsWith("http") ? d.website : `https://${d.website}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-gray-600 hover:underline">
                        <ExternalLink size={14} /> Website
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.phone && (
                    <a href={whatsappHref(d.phone, wa)} target="_blank" rel="noopener">
                      <Button size="sm" variant="outline" className="gap-1"><MessageCircle size={14} /> WhatsApp</Button>
                    </a>
                  )}
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => setExpandedId(open ? null : d.id)}>
                    <Mail size={14} /> Templates
                  </Button>
                  <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => updateMutation.mutate({ id: d.id, outreachStatus: "contacted" })}>
                    <Check size={14} /> Contacted
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: d.id, outreachStatus: "skipped" })}>
                    <SkipForward size={14} />
                  </Button>
                </div>
              </div>

              {open && (
                <div className="mt-4 pt-4 border-t space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Claim email (copy → send from {EMAILS.dealers})</p>
                    <pre className="bg-gray-50 p-3 rounded-lg text-xs whitespace-pre-wrap overflow-x-auto">{claim.body}</pre>
                    <Button size="sm" variant="outline" className="mt-2 gap-1" onClick={() => copy(`Subject: ${claim.subject}\n\n${claim.body}`, "claim email")}>
                      <Copy size={14} /> Copy email
                    </Button>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Review invite email</p>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => copy(buildReviewInviteEmail(ctx).body, "review invite")}>
                      <Copy size={14} /> Copy review invite
                    </Button>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Phone script</p>
                    <pre className="bg-gray-50 p-3 rounded-lg text-xs whitespace-pre-wrap">{buildPhoneScript(ctx)}</pre>
                  </div>
                  <div className="flex flex-wrap gap-2 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs text-gray-500 mb-1">Found email on website?</p>
                      <Input
                        placeholder="sales@dealer.com"
                        value={manualEmail[d.id] ?? ""}
                        onChange={(e) => setManualEmail((m) => ({ ...m, [d.id]: e.target.value }))}
                      />
                    </div>
                    <Button
                      size="sm"
                      disabled={!manualEmail[d.id]?.includes("@")}
                      onClick={() => updateMutation.mutate({ id: d.id, email: manualEmail[d.id], outreachStatus: "contacted" })}
                    >
                      Save email
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Outreach notes…"
                    defaultValue={d.outreachNotes ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== (d.outreachNotes ?? "")) {
                        updateMutation.mutate({ id: d.id, outreachNotes: e.target.value });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data && data.pages > 1 && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-sm text-gray-500 self-center">Page {page} of {data.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
