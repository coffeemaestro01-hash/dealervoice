"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  defaultMessage?: string;
  source?: string;
}

export function DemoBookingForm({ defaultMessage = "", source = "demo-page" }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      dealership: fd.get("dealership"),
      role: fd.get("role"),
      monthlyCalls: fd.get("monthlyCalls"),
      message: fd.get("message"),
      source,
    };
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      <div className="text-center py-10">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Demo request received</h3>
        <p className="text-gray-600 text-sm">We&apos;ll reach out within one business day to schedule your live walkthrough.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full name *</Label>
          <Input id="name" name="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Work email *</Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" name="phone" type="tel" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="dealership">Dealership name *</Label>
          <Input id="dealership" name="dealership" required className="mt-1" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Your role</Label>
          <Input id="role" name="role" placeholder="GM, Service Manager, BDC Director…" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="monthlyCalls">Monthly inbound calls (est.)</Label>
          <Input id="monthlyCalls" name="monthlyCalls" type="number" placeholder="500" className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="message">Anything else?</Label>
        <textarea
          id="message"
          name="message"
          rows={3}
          defaultValue={defaultMessage}
          placeholder="Current phone system, DMS, pain points…"
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full h-12 bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90">
        {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Submitting…</> : "Request My Demo"}
      </Button>
    </form>
  );
}
