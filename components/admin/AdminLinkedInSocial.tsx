"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Linkedin, Send, Eye, Link2, AlertTriangle, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type ConnectionMeta =
  | { connected: false }
  | {
      connected: true;
      organizationId: string;
      scopes?: string;
      hasOrgScope: boolean;
      expired: boolean;
      expiresAt: string | null;
      source: string;
    };

type Status = {
  configured: boolean;
  connection?: ConnectionMeta;
  poolSize: number;
  schedule: string;
  nextPreview: { body?: string; imageUrl?: string; templateKey?: string };
  recent: Array<{
    id: string;
    templateKey: string;
    status: string;
    postedAt: string;
    error?: string | null;
    body: string;
  }>;
};

export function AdminLinkedInSocial() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/social/linkedin")
      .then((r) => r.json())
      .then(setStatus)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "1") {
      toast({ title: "LinkedIn connected", description: "Company page posting is ready. Try Post now." });
      window.history.replaceState({}, "", "/dashboard/admin/social");
    } else if (error) {
      toast({ title: "LinkedIn connect failed", description: decodeURIComponent(error), variant: "destructive" });
      window.history.replaceState({}, "", "/dashboard/admin/social");
    }
  }, [searchParams, toast]);

  const postNow = async () => {
    setPosting(true);
    try {
      const res = await fetch("/api/admin/social/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast({ title: data.posted ? "Posted to LinkedIn" : "Skipped", description: data.templateKey ?? data.reason });
      load();
    } catch (e) {
      toast({ title: "Error", variant: "destructive", description: e instanceof Error ? e.message : "Failed" });
    } finally {
      setPosting(false);
    }
  };

  if (loading || !status) {
    return <p className="text-sm text-muted-foreground">Loading LinkedIn status…</p>;
  }

  const conn = status.connection;
  const needsConnect = !status.configured;

  return (
    <div className="space-y-6">
      {needsConnect ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 text-sm space-y-4">
          <div className="flex gap-2">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <strong className="text-amber-800">Connect LinkedIn in one click</strong>
              <p className="text-muted-foreground mt-1">
                You must be <strong>super admin</strong> on the DealerVoice company page. We&apos;ll request org posting
                permissions — not personal profile (<code className="text-xs">w_member_social</code>).
              </p>
            </div>
          </div>
          <ol className="list-decimal list-inside text-muted-foreground space-y-1 text-xs ml-6">
            <li>LinkedIn Developers → DealerVoice → Products → request <strong>Community Management API</strong></li>
            <li>Auth tab → add redirect: <code className="text-xs">https://dealervoice.io/api/admin/social/linkedin/callback</code></li>
            <li>Click Connect below → approve as company page admin</li>
          </ol>
          <Button asChild className="gap-2">
            <a href="/api/admin/social/linkedin/connect">
              <Link2 size={16} /> Connect LinkedIn company page
            </a>
          </Button>
        </div>
      ) : conn?.connected ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm flex gap-2">
          <CheckCircle2 className="text-primary shrink-0" size={18} />
          <div>
            <strong className="text-foreground">Connected</strong> · Org ID {conn.organizationId}
            {conn.hasOrgScope ? " · org posting enabled" : " · ⚠ missing w_organization_social — reconnect"}
            {conn.expiresAt ? (
              <span className="text-muted-foreground"> · expires {new Date(conn.expiresAt).toLocaleDateString()}</span>
            ) : null}
            {conn.expired ? <span className="text-destructive"> · token expired — reconnect</span> : null}
          </div>
        </div>
      ) : null}

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Post pool" value={status.poolSize} />
        <Stat label="Schedule" value="Daily 14:00 UTC" />
        <Stat label="API" value={status.configured ? "Connected" : "Not connected"} />
      </div>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <Eye size={16} /> Next scheduled post preview
        </h2>
        {status.nextPreview?.imageUrl ? (
          <Image
            src={status.nextPreview.imageUrl}
            alt="LinkedIn post preview"
            width={600}
            height={314}
            unoptimized
            className="rounded-lg border mb-4 max-w-full h-auto"
          />
        ) : null}
        <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-lg text-foreground max-h-64 overflow-auto">
          {status.nextPreview?.body ?? "—"}
        </pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" className="gap-1.5" onClick={postNow} disabled={posting || needsConnect}>
            {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Post now
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="/api/admin/social/linkedin/connect">
              <Link2 size={14} className="mr-1.5" />
              {needsConnect ? "Connect" : "Reconnect"}
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={load}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <Linkedin size={16} /> Recent posts
        </h2>
        <ul className="space-y-2 text-sm">
          {status.recent.length === 0 ? (
            <li className="text-muted-foreground">No posts yet.</li>
          ) : (
            status.recent.map((p) => (
              <li key={p.id} className="border-b border-border pb-2 last:border-0">
                <span className="font-medium">{p.templateKey}</span> ·{" "}
                <span className={p.status === "posted" ? "text-primary" : "text-destructive"}>{p.status}</span> ·{" "}
                {new Date(p.postedAt).toLocaleString()}
                {p.error ? <span className="block text-xs text-destructive">{p.error}</span> : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border rounded-xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
