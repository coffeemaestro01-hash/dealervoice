"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Copy, Phone, MessageCircle, Mail, Check, SkipForward, ExternalLink, Zap, Loader2, Tag } from "lucide-react";
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
  type OutreachMarket,
} from "@/lib/outreach/templates";
import { EMAILS } from "@/lib/constants/emails";
import { WHATSAPP_BUSINESS } from "@/lib/constants/social";

type Dealer = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  cityName: string | null;
  stateName: string | null;
  districtName: string | null;
  outreachStatus: string | null;
  lastOutreachAt: string | null;
  outreachNotes: string | null;
  totalReviews: number;
  outreachDripStep: number;
  outreachDripActive: boolean;
  nextOutreachAt: string | null;
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
  const [mode, setMode] = useState<"phone" | "drip">("drip");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState<Record<string, string>>({});
  const [generatingPromo, setGeneratingPromo] = useState<string | null>(null);
  const [startingDrip, setStartingDrip] = useState<string | null>(null);

  const params = new URLSearchParams({
    page: String(page),
    limit: "50",
    status,
    country: "US",
    mode,
  });
  if (state) params.set("state", state);
  if (hasWebsite) params.set("hasWebsite", "1");

  const { data, isLoading } = useQuery({
    queryKey: ["outreach-queue", page, state, status, hasWebsite, mode],
    queryFn: () => fetchQueue(params),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      outreachStatus?: string;
      outreachNotes?: string;
      email?: string;
      startDrip?: boolean;
    }) => {
      const res = await fetch(`/api/admin/outreach/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["outreach-queue"] });
      toast({ title: vars.startDrip ? "Email saved — drip started" : "Updated" });
    },
  });

  async function generatePromo(id: string) {
    setGeneratingPromo(id);
    try {
      const res = await fetch(`/api/admin/dealerships/${id}/promotion`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      copy(json.promotion.code, "promo code");
      toast({ title: "Dealer promo created", description: json.promotion.code });
    } catch (err) {
      toast({
        title: "Promo failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setGeneratingPromo(null);
    }
  }

  async function startDrip(id: string) {
    setStartingDrip(id);
    try {
      const res = await fetch(`/api/admin/outreach/${id}/start-drip`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      qc.invalidateQueries({ queryKey: ["outreach-queue"] });
      toast({ title: "3-email drip started", description: "Step 1 sent. Follow-ups run automatically." });
    } catch (err) {
      toast({
        title: "Could not start drip",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setStartingDrip(null);
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast({ title: `Copied ${label}` });
  }

  const market: OutreachMarket = "US";

  if (isLoading) return <p className="text-sm text-gray-500">Loading contact queue…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="border rounded-md px-3 h-10 text-sm"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as "phone" | "drip");
            setPage(1);
          }}
        >
          <option value="drip">Email drip queue</option>
          <option value="phone">Phone / WhatsApp queue</option>
        </select>
        <select
          className="border rounded-md px-3 h-10 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
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
          onChange={(e) => {
            setState(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All states</option>
          {(data?.stateCounts ?? []).map((s: { state: string; count: number }) => (
            <option key={s.state} value={s.state}>
              {s.state} ({s.count})
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={hasWebsite}
            onChange={(e) => {
              setHasWebsite(e.target.checked);
              setPage(1);
            }}
          />
          Has website only
        </label>
        <span className="text-sm text-gray-500 ml-auto">
          {data?.total?.toLocaleString() ?? 0} dealers · {mode === "drip" ? "has email" : "phone, no email"} · unclaimed
        </span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 space-y-1">
        <p>
          <strong>Outreach from:</strong> {EMAILS.dealers} · <strong>WhatsApp Business:</strong>{" "}
          <a href={WHATSAPP_BUSINESS.href} target="_blank" rel="noopener noreferrer" className="underline">
            {WHATSAPP_BUSINESS.display}
          </a>
        </p>
        {mode === "drip" ? (
          <p>
            <strong>Automated drip:</strong> 3 emails over ~7 days (claim → social proof → $1 Pro pilot with unique code).
            Cron runs daily at 10:00 UTC — auto-starts up to 20 new US drips/day. Or click <strong>Start drip</strong> manually.
          </p>
        ) : (
          <p>Copy templates, WhatsApp, or phone scripts. Mark contacted when done.</p>
        )}
      </div>

      <div className="space-y-3">
        {(data?.dealers ?? []).map((d: Dealer) => {
          const ctx = {
            name: d.name,
            slug: d.slug,
            cityName: d.cityName,
            stateName: d.stateName,
            phone: d.phone,
            website: d.website,
            market,
          };
          const claim = buildClaimEmail(ctx);
          const wa = buildWhatsAppClaim(ctx);
          const open = expandedId === d.id;
          const dripLabel =
            d.outreachDripStep >= 3
              ? "Drip complete"
              : d.outreachDripActive
                ? `Drip step ${d.outreachDripStep}/3`
                : d.outreachDripStep > 0
                  ? `Paused at step ${d.outreachDripStep}`
                  : null;

          return (
            <div key={d.id} className="bg-white rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={profileUrl(d.slug)}
                    className="font-semibold text-gray-900 hover:text-gold-700"
                    target="_blank"
                  >
                    {d.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {[d.cityName, d.districtName, d.stateName].filter(Boolean).join(", ")}
                    {d.totalReviews > 0 && ` · ${d.totalReviews} reviews`}
                    {d.email && mode === "drip" && (
                      <span className="block text-xs text-gray-400 mt-0.5">{d.email}</span>
                    )}
                  </p>
                  {dripLabel && (
                    <span className="inline-flex mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {dripLabel}
                      {d.nextOutreachAt && d.outreachDripActive && (
                        <span className="text-blue-500 ml-1">
                          · next {new Date(d.nextOutreachAt).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2 text-sm">
                    {d.phone && (
                      <a href={`tel:${d.phone}`} className="inline-flex items-center gap-1 text-gold-700 hover:underline">
                        <Phone size={14} /> {d.phone}
                      </a>
                    )}
                    {d.website && (
                      <a
                        href={d.website.startsWith("http") ? d.website : `https://${d.website}`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 text-gray-600 hover:underline"
                      >
                        <ExternalLink size={14} /> Website
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mode === "drip" && d.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      disabled={generatingPromo === d.id}
                      onClick={() => generatePromo(d.id)}
                    >
                      {generatingPromo === d.id ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                      Promo code
                    </Button>
                  )}
                  {mode === "drip" && d.email && d.outreachDripStep === 0 && (
                    <Button
                      size="sm"
                      className="gap-1 bg-gold-800 hover:bg-gold-900 text-white"
                      disabled={startingDrip === d.id}
                      onClick={() => startDrip(d.id)}
                    >
                      {startingDrip === d.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Zap size={14} />
                      )}
                      Start drip
                    </Button>
                  )}
                  {mode === "phone" && d.phone && (
                    <a href={whatsappHref(d.phone, wa, market)} target="_blank" rel="noopener">
                      <Button size="sm" variant="outline" className="gap-1">
                        <MessageCircle size={14} /> WhatsApp
                      </Button>
                    </a>
                  )}
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => setExpandedId(open ? null : d.id)}>
                    <Mail size={14} /> Templates
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateMutation.mutate({ id: d.id, outreachStatus: "contacted" })}
                  >
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 gap-1"
                      onClick={() => copy(`Subject: ${claim.subject}\n\n${claim.body}`, "claim email")}
                    >
                      <Copy size={14} /> Copy email
                    </Button>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Review invite email</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => copy(buildReviewInviteEmail(ctx).body, "review invite")}
                    >
                      <Copy size={14} /> Copy review invite
                    </Button>
                  </div>
                  {mode === "phone" && (
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">Phone script</p>
                      <pre className="bg-gray-50 p-3 rounded-lg text-xs whitespace-pre-wrap">{buildPhoneScript(ctx)}</pre>
                    </div>
                  )}
                  {mode === "phone" && (
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
                        onClick={() =>
                          updateMutation.mutate({
                            id: d.id,
                            email: manualEmail[d.id],
                            outreachStatus: "contacted",
                            startDrip: true,
                          })
                        }
                      >
                        Save & start drip
                      </Button>
                    </div>
                  )}
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
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-sm text-gray-500 self-center">
            Page {page} of {data.pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
