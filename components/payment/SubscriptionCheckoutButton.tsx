"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.src = CHECKOUT_SRC;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

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
      const ok = await loadCheckoutScript();
      if (!ok || !window.Razorpay) throw new Error("Could not load payment window.");

      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealershipId, plan, interval }),
      });
      const checkout = await res.json();
      if (!res.ok) throw new Error(checkout.error ?? "Could not start checkout.");

      const keyId = checkout.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) throw new Error("Payments are not configured.");

      const verify = async (payload: Record<string, string>) => {
        const v = await fetch("/api/subscriptions/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dealershipId,
            plan,
            interval,
            ...payload,
          }),
        });
        const vj = await v.json();
        if (v.ok && vj.success) {
          onSuccess?.();
        } else {
          const m = vj.error ?? "Payment could not be verified.";
          setError(m);
          onError?.(m);
        }
      };

      const base = {
        key: keyId,
        name: "DealerVoice",
        description: `${plan} plan — ${interval}`,
        prefill: checkout.prefill,
        theme: { color: "#fb6514" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onError?.("Payment cancelled.");
          },
        },
      };

      if (checkout.mode === "subscription") {
        const rzp = new window.Razorpay({
          ...base,
          subscription_id: checkout.subscriptionId,
          handler: async (resp: any) => {
            try {
              await verify({
                mode: "subscription",
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_subscription_id: resp.razorpay_subscription_id,
                razorpay_signature: resp.razorpay_signature,
              });
            } finally {
              setLoading(false);
            }
          },
        });
        rzp.on("payment.failed", (resp: any) => {
          setLoading(false);
          const m = resp?.error?.description ?? "Payment failed.";
          setError(m);
          onError?.(m);
        });
        rzp.open();
      } else {
        const rzp = new window.Razorpay({
          ...base,
          order_id: checkout.orderId,
          amount: checkout.amount,
          currency: checkout.currency,
          handler: async (resp: any) => {
            try {
              await verify({
                mode: "order",
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              });
            } finally {
              setLoading(false);
            }
          },
        });
        rzp.on("payment.failed", (resp: any) => {
          setLoading(false);
          const m = resp?.error?.description ?? "Payment failed.";
          setError(m);
          onError?.(m);
        });
        rzp.open();
      }
    } catch (e: any) {
      setLoading(false);
      const m = e?.message ?? "Something went wrong.";
      setError(m);
      onError?.(m);
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
