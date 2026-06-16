"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { SPONSORSHIP_TIERS } from "@/lib/sponsorship/checkout";

export function SponsorshipCheckoutButtons({ dealershipId }: { dealershipId?: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function checkout(tier: "city_30" | "homepage_30") {
    if (!dealershipId) {
      window.location.href = "/login?callbackUrl=/advertise";
      return;
    }
    setLoading(tier);
    try {
      const res = await fetch("/api/sponsorship/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealershipId, tier }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
      {(Object.entries(SPONSORSHIP_TIERS) as [keyof typeof SPONSORSHIP_TIERS, typeof SPONSORSHIP_TIERS.city_30][]).map(
        ([key, tier]) => (
          <div key={key} className="rounded-2xl border border-border p-6 text-left shadow-sm">
            <h3 className="font-semibold text-foreground">{tier.label}</h3>
            <p className="text-2xl font-bold text-primary mt-1">${(tier.amountCents / 100).toLocaleString()}</p>
            <Button
              className="mt-4 w-full gap-2"
              disabled={!!loading}
              onClick={() => checkout(key)}
            >
              {loading === key ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              Buy with Stripe
            </Button>
          </div>
        )
      )}
    </div>
  );
}

export function AdvertiseCta() {
  return (
    <p className="text-sm text-muted-foreground mt-4">
      Need a custom package? <Link href="/contact" className="text-primary hover:underline">Contact sales</Link>
      {" · "}
      <Link href="/pricing" className="text-primary hover:underline">See subscription plans</Link>
    </p>
  );
}
