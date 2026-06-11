"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { CashfreeCheckoutButton } from "@/components/payment/CashfreeCheckoutButton";

// Temporary sandbox page to test the Cashfree checkout flow end-to-end.
// Requires login (the /api/create-order endpoint is auth-gated).
export default function TestPaymentPage() {
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-night">
      <Navbar />
      <main className="flex-1 grid place-items-center py-20">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-gold/20 shadow-gold p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Cashfree test checkout</h1>
          <p className="text-gray-500 text-sm mb-6">Sandbox payment of ₹199. Use a Cashfree test card.</p>

          <div className="flex justify-center">
            <CashfreeCheckoutButton
              amount={19900}
              currency="INR"
              label="Pay ₹199 (test)"
              onSuccess={(d) => setResult({ ok: true, msg: `Verified! Payment ${d.paymentId}` })}
              onError={(m) => setResult({ ok: false, msg: m })}
            />
          </div>

          {result && (
            <div className={`mt-5 text-sm rounded-lg p-3 ${result.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {result.ok && <CheckCircle2 size={16} className="inline mr-1" />}
              {result.msg}
            </div>
          )}

          <div className="mt-6 text-left text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-1">
            <p className="font-semibold text-gray-700">Sandbox test card</p>
            <p>Card: <span className="font-mono">4111 1111 1111 1111</span></p>
            <p>Expiry: any future date · CVV: any 3 digits</p>
            <p>UPI: use Cashfree sandbox test UPI flow</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
