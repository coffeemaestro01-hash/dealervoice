"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdminCampaignForm({ countries }: { countries: { id: string; name: string }[] }) {
  const [subject, setSubject] = useState("Claim your dealership on DealerVoice");
  const [body, setBody] = useState(
    "<p>Hi,</p><p>Your dealership is listed on DealerVoice. Claim your profile to respond to reviews and remove competitor ads.</p><p><a href='https://dealervoice.io/claim'>Claim now →</a></p>"
  );
  const [filter, setFilter] = useState<"unclaimed" | "claimed" | "all">("unclaimed");
  const [countryId, setCountryId] = useState("");
  const [result, setResult] = useState("");

  async function send() {
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, filter, countryId: countryId || undefined, limit: 50 }),
    });
    const json = await res.json();
    setResult(res.ok ? `Sent ${json.sent} of ${json.total} emails` : json.error || "Failed");
  }

  return (
    <div className="bg-white rounded-xl border p-6 max-w-2xl space-y-4">
      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
      <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="flex gap-2 flex-wrap">
        <select className="border rounded-md px-3 h-10 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="unclaimed">Unclaimed only</option>
          <option value="claimed">Claimed only</option>
          <option value="all">All with email</option>
        </select>
        <select className="border rounded-md px-3 h-10 text-sm" value={countryId} onChange={(e) => setCountryId(e.target.value)}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <Button onClick={send} className="bg-gold-gradient text-night-900 font-semibold border-0">Send campaign (max 50)</Button>
      {result && <p className="text-sm text-gray-600">{result}</p>}
    </div>
  );
}
