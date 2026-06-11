"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  dealershipId: string;
  plan: "PRO" | "ENTERPRISE";
  interval?: "monthly" | "annual";
  label?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function SubscriptionCheckoutButton({
  dealershipId,
  plan,
  interval = "monthly",
  label = "Upgrade now",
  className,
  onSuccess,
  onError,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealershipId, plan, interval }),
      });
      const checkout = await res.json();
      if (!res.ok) throw new Error(checkout.error ?? "Could not start checkout.");

      if (!checkout.url) throw new Error("Payments are not configured.");

      window.location.href = checkout.url;
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : "Something went wrong.";
      setError(m);
      onError?.(m);
      setLoading(false);
    }
  }, [dealershipId, plan, interval, onSuccess, onError]);

  return (
    <div>
      <Button
        onClick={handleClick}
        disabled={loading}
        className={className ?? "bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90 w-full"}
      >
        {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Processing…</> : label}
      </Button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
