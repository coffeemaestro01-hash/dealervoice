"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  defaultMessage?: string;
  source?: string;
  dark?: boolean;
}

export function DemoBookingForm({ defaultMessage = "", source = "demo-page", dark }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const inputClass = dark
    ? "mt-1.5 w-full h-12 rounded-xl bg-black/30 border border-white/10 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
    : "mt-1.5 w-full h-12 rounded-xl border border-gray-200 px-4 text-gray-900 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold/30";
  const labelClass = dark ? "text-xs uppercase tracking-luxury text-gray-500 font-semibold" : "text-sm font-medium text-gray-700";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          dealership: fd.get("dealership"),
          role: fd.get("role"),
          monthlyCalls: fd.get("monthlyCalls"),
          message: fd.get("message"),
          source,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not submit");
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={52} className="text-green-500 mx-auto mb-5" />
        <h3 className={`font-display text-2xl font-semibold mb-2 ${dark ? "text-white" : "text-gray-900"}`}>You&apos;re on the list</h3>
        <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>We&apos;ll reach out within one business day to schedule your private demo.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelClass}>Full name *</label>
          <input id="name" name="name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Work email *</label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className={labelClass}>Phone *</label>
          <input id="phone" name="phone" type="tel" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="dealership" className={labelClass}>Dealership *</label>
          <input id="dealership" name="dealership" required className={inputClass} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="role" className={labelClass}>Your role</label>
          <input id="role" name="role" placeholder="GM, Service Manager…" className={inputClass} />
        </div>
        <div>
          <label htmlFor="monthlyCalls" className={labelClass}>Monthly calls (est.)</label>
          <input id="monthlyCalls" name="monthlyCalls" type="number" placeholder="500" className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>Notes</label>
        <textarea
          id="message"
          name="message"
          rows={3}
          defaultValue={defaultMessage}
          placeholder="DMS, CRM, current pain points…"
          className={`${inputClass} h-auto py-3`}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-full btn-luxury-primary text-night-900 font-semibold text-sm tracking-wide flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : "Request Private Demo"}
      </button>
    </form>
  );
}
