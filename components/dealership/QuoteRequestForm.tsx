"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  dealershipId: string;
  dealerName: string;
}

export function QuoteRequestForm({ dealershipId, dealerName }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", vehicle: "", message: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealershipId,
          ...form,
          type: "QUOTE",
          source: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gold/30 shadow-sm overflow-hidden">
      <div className="bg-night-gradient px-5 py-4">
        <h3 className="font-semibold text-white">Request a quote</h3>
        <p className="text-gray-300 text-xs mt-0.5">Get pricing &amp; availability from {dealerName}</p>
      </div>

      {done ? (
        <div className="p-6 text-center">
          <CheckCircle2 className="mx-auto text-green-500 mb-3" size={40} />
          <p className="font-medium text-gray-900">Request sent!</p>
          <p className="text-sm text-gray-500 mt-1">{dealerName} will be in touch soon.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="p-5 space-y-3">
          <Input required placeholder="Your name" value={form.name} onChange={set("name")} />
          <Input required type="email" placeholder="Email address" value={form.email} onChange={set("email")} />
          <Input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={set("phone")} />
          <Input placeholder="Vehicle of interest (optional)" value={form.vehicle} onChange={set("vehicle")} />
          <textarea
            placeholder="Anything specific? (optional)"
            value={form.message}
            onChange={set("message")}
            rows={3}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90">
            {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Sending…</> : <><Send size={15} className="mr-2" />Send request</>}
          </Button>
          <p className="text-[11px] text-gray-400 text-center">Free &amp; no obligation. Your details are shared only with this dealership.</p>
        </form>
      )}
    </div>
  );
}
