"use client";

import { useState, useCallback } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  /** amount in paise (>= 100) */
  amount: number;
  currency?: string;
  label?: string;
  receipt?: string;
  className?: string;
  onSuccess?: (data: { paymentId: string; orderId: string }) => void;
  onError?: (message: string) => void;
}

export function CashfreeCheckoutButton({
  amount,
  currency = "INR",
  label = "Pay now",
  receipt,
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
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, receipt }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error ?? "Could not start checkout.");

      if (!order.payment_session_id) throw new Error("Payments are not configured.");

      const cashfree = await load({ mode: order.mode ?? "sandbox" });
      if (!cashfree) throw new Error("Could not load the payment window.");

      const result = await cashfree.checkout({
        paymentSessionId: order.payment_session_id,
        redirectTarget: "_modal",
      });

      if (result?.error) {
        throw new Error(result.error.message ?? "Payment failed.");
      }

      const v = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.order_id }),
      });
      const vj = await v.json();
      if (v.ok && vj.success) {
        onSuccess?.({ paymentId: vj.paymentId, orderId: vj.orderId });
      } else {
        const m = vj.error ?? "Payment could not be verified.";
        setError(m);
        onError?.(m);
      }
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : "Something went wrong.";
      setError(m);
      onError?.(m);
    } finally {
      setLoading(false);
    }
  }, [amount, currency, receipt, onSuccess, onError]);

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
