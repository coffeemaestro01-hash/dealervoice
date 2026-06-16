import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "API Access",
  description: "Enterprise inventory sync and ratings API for DealerVoice partners.",
};

export default function ApiDocsPage() {
  return (
    <div className="bg-card">
      <section className="border-b border-border bg-muted">
        <div className="container py-14 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
            <Code2 size={14} /> Enterprise API
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            DealerVoice <span className="text-primary">API</span>
          </h1>
          <p className="text-lg text-muted-foreground">Sync inventory from your DMS and keep listings live on DealerVoice.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="container max-w-2xl space-y-8">
          <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="bg-pearl text-muted-foreground text-sm font-mono p-5 overflow-x-auto space-y-3">
              <div>
                <div className="text-muted-foreground"># Bulk upsert inventory (Enterprise)</div>
                <div>
                  <span className="text-primary">POST</span> https://dealervoice.io/api/v1/inventory
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

          <div className="rounded-2xl border border-border p-7 shadow-sm">
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
              <Lock size={22} />
            </span>
            <h2 className="text-xl font-bold text-foreground mb-2">Get your API key</h2>
            <p className="text-muted-foreground mb-4">
              Available on active <strong>Enterprise</strong> plans. In your dealer dashboard → Settings, click
              &quot;Generate API key&quot; (one-time display).
            </p>
            <Link href="/pricing" className="text-primary font-semibold hover:underline">
              View Enterprise plan →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
