import type { Metadata } from "next";
import { Calendar, Clock, Video, Sparkles } from "lucide-react";
import { DemoBookingForm } from "@/components/voice/DemoBookingForm";
import { LuxuryMesh } from "@/components/luxury/LuxuryMesh";

export const metadata: Metadata = {
  title: "Book a Private Demo",
  description: "See DealerVoice answer calls, book appointments, and recover missed revenue — in a live 20-minute demo.",
};

const PERKS = [
  { icon: Video, title: "Live AI call demo", desc: "Watch a real service booking conversation unfold" },
  { icon: Clock, title: "20 minutes", desc: "Tailored ROI and integration roadmap for your store" },
  { icon: Calendar, title: "Same-week access", desc: "Most demos scheduled within 48 hours" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-night">
      <section className="relative py-20 md:py-28 overflow-hidden border-b border-white/[0.06]">
        <LuxuryMesh />
        <div className="container relative text-center max-w-2xl">
          <div className="luxury-pill mx-auto mb-8">
            <Sparkles size={13} />
            Private demo
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-5 leading-tight">
            See DealerVoice <span className="text-gold italic">live</span>
          </h1>
          <p className="text-gray-400 text-lg font-light leading-relaxed">
            A curated walkthrough for dealership leaders. Call handling, ROI, and your path to go-live.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container grid lg:grid-cols-2 gap-12 items-start max-w-5xl">
          <div className="space-y-5">
            {PERKS.map((p) => (
              <div key={p.title} className="luxury-card p-6 flex gap-5">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold/25 text-gold-400 shrink-0">
                  <p.icon size={22} />
                </span>
                <div>
                  <h3 className="font-display text-lg text-white font-semibold">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
                </div>
              </div>
            ))}
            <p className="text-sm text-gray-600 pt-2">
              Prefer email?{" "}
              <a href="mailto:dealers@dealervoice.io" className="text-gold-400 hover:underline">dealers@dealervoice.io</a>
            </p>
          </div>

          <div className="luxury-card p-8 md:p-10">
            <h2 className="font-display text-2xl text-white font-semibold mb-6">Request access</h2>
            <DemoBookingForm dark source="demo-page" />
          </div>
        </div>
      </section>
    </div>
  );
}
