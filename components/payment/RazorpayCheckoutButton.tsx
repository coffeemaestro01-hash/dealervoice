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
  /** amount in paise (>= 100) */
  amount: number;
  currency?: string;
  label?: string;
  name?: string;
  description?: string;
  receipt?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  className?: string;
  onSuccess?: (data: { paymentId: string; orderId: string }) => void;
  onError?: (message: string) => void;
}

export function RazorpayCheckoutButton({
  amount,
  currency = "INR",
  label = "Pay now",
  name = "DealerVoice",
  description = "Subscription payment",
  receipt,
  prefill,
  className,
  onSuccess,
  onError,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const handleClick = useCallback(async () => {
    setError("");
    if (!keyId) {
      const m = "Payments are not configured.";
      setError(m); onError?.(m);
      return;
    }
    setLoading(true);
    try {
      // 1) Load Razorpay checkout.js
      const ok = await loadCheckoutScript();
      if (!ok || !window.Razorpay) {
        throw new Error("Could not load the payment window. Check your connection and try again.");
      }

      // 2) Create the order on the backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, receipt }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error ?? "Could not start checkout.");

      // 3) Open the Razorpay modal
      const rzp = new window.Razorpay({
        key: keyId,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name,
        description,
        prefill,
        theme: { color: "#fb6514" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onError?.("Payment cancelled.");
          },
        },
        handler: async (resp: any) => {
          // 4) Verify the signature on the backend
          try {
            const v = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              }),
            });
            const vj = await v.json();
            if (v.ok && vj.success) {
              onSuccess?.({ paymentId: resp.razorpay_payment_id, orderId: resp.razorpay_order_id });
            } else {
              const m = vj.error ?? "Payment could not be verified.";
              setError(m); onError?.(m);
            }
          } catch {
            const m = "Payment verification failed. If you were charged, contact support.";
            setError(m); onError?.(m);
          } finally {
            setLoading(false);
          }
        },
      });

      rzp.on("payment.failed", (resp: any) => {
        setLoading(false);
        const m = resp?.error?.description ?? "Payment failed. Please try again.";
        setError(m); onError?.(m);
      });

      rzp.open();
    } catch (e: any) {
      setLoading(false);
      const m = e?.message ?? "Something went wrong.";
      setError(m); onError?.(m);
    }
  }, [amount, currency, receipt, keyId, name, description, prefill, onSuccess, onError]);

  return (
    <div>
      <Button
        onClick={handleClick}
        disabled={loading}
        className={className ?? "bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90"}
      >
        {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Processing…</> : label}
      </Button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
