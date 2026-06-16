"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TEMPLATES = [
  {
    name: "Claim your profile",
    subject: "Claim your dealership on DealerVoice",
    body: "<p>Hi,</p><p>Your dealership is listed on DealerVoice. Claim your profile to respond to reviews, add inventory, and remove competitor ads from your page.</p><p><a href='https://dealervoice.io/claim'>Claim now →</a></p>",
  },
  {
    name: "Write first review invite",
    subject: "Help buyers trust your dealership",
    body: "<p>Hi,</p><p>Buyers in your city are searching for trusted dealerships on DealerVoice. Encourage happy customers to share their experience — it takes two minutes.</p><p><a href='https://dealervoice.io/write-review'>Share review link →</a></p>",
  },
];

export function AdminCreateCampaignForm({ countries }: { countries: { id: string; name: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [filter, setFilter] = useState<"unclaimed" | "claimed" | "all">("unclaimed");
  const [countryId, setCountryId] = useState("");
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(send: boolean) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || subject,
        subject,
        body,
        filter,
        countryId: countryId || undefined,
        limit,
        send,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Failed to create campaign");
      return;
    }
    router.push("/dashboard/admin/campaigns");
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/admin/campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft size={14} /> Back to campaigns
      </Link>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 text-primary">
          <Mail size={18} />
          <h2 className="font-semibold text-foreground">New email campaign</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => {
                setName(t.name);
                setSubject(t.subject);
                setBody(t.body);
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/30 hover:text-primary transition-colors"
            >
              {t.name}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Campaign name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicago unclaimed dealers — March 2026" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject line</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Email body (HTML)</label>
          <Textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-sm" />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Audience</label>
            <select className="w-full border rounded-md px-3 h-10 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="unclaimed">Unclaimed dealers</option>
              <option value="claimed">Claimed dealers</option>
              <option value="all">All with email</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
            <select className="w-full border rounded-md px-3 h-10 text-sm" value={countryId} onChange={(e) => setCountryId(e.target.value)}>
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Max recipients</label>
            <Input type="number" min={1} max={100} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={() => submit(true)} disabled={loading} className="bg-foreground hover:bg-foreground text-foreground gap-2">
            <Send size={14} /> {loading ? "Sending…" : "Create & send"}
          </Button>
          <Button variant="outline" onClick={() => submit(false)} disabled={loading}>
            Save draft
          </Button>
        </div>

        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <Sparkles size={12} className="mt-0.5 shrink-0" />
          Opens and clicks update when Resend webhooks point to <code className="text-muted-foreground">/api/webhooks/resend</code>
        </p>
      </div>
    </div>
  );
}
