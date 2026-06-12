import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "API Access",
  description: "Enterprise inventory sync and ratings API for DealerVoice partners.",
};

export default function ApiDocsPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container py-14 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-700 font-medium mb-5">
            <Code2 size={14} /> Enterprise API
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            DealerVoice <span className="text-gold">API</span>
          </h1>
          <p className="text-lg text-gray-600">Sync inventory from your DMS and keep listings live on DealerVoice.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="container max-w-2xl space-y-8">
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="bg-night-800 text-gray-200 text-sm font-mono p-5 overflow-x-auto space-y-3">
              <div>
                <div className="text-gray-500"># Bulk upsert inventory (Enterprise)</div>
                <div>
                  <span className="text-gold-400">POST</span> https://dealervoice.io/api/v1/inventory
                </div>
                <div>Authorization: Bearer dv_live_…</div>
              </div>
              <pre className="text-xs whitespace-pre-wrap">{`{
  "listings": [{
    "stockId": "A12345",
    "make": "Toyota",
    "model": "Camry",
    "year": 2024,
    "priceMinor": 2899000,
    "mileageKm": 12000,
    "vin": "…",
    "photoUrl": "https://…",
    "listingUrl": "https://…"
  }]
}`}</pre>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 p-7 shadow-sm">
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-gold-50 text-gold-600 mb-4">
              <Lock size={22} />
            </span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Get your API key</h2>
            <p className="text-gray-600 mb-4">
              Available on active <strong>Enterprise</strong> plans. In your dealer dashboard → Settings, click
              &quot;Generate API key&quot; (one-time display).
            </p>
            <Link href="/pricing" className="text-gold-700 font-semibold hover:underline">
              View Enterprise plan →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
