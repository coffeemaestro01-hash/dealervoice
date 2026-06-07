import type { Metadata } from "next";
import Link from "next/link";
import { Target, TrendingUp, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Advertise", description: "Reach in-market car buyers on DealerVoice." };

const REASONS = [
  { icon: Users, title: "High-intent audience", body: "Reach buyers actively researching where to purchase or service a vehicle." },
  { icon: Target, title: "Precise targeting", body: "Target by brand, location, and category to reach the right customers." },
  { icon: TrendingUp, title: "Measurable results", body: "Transparent reporting on impressions, clicks, and profile visits." },
];

export default function AdvertisePage() {
  return (
    <div className="bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container py-14 text-center max-w-2xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Advertise on <span className="text-gold">DealerVoice</span></h1>
          <p className="text-lg text-gray-600">Put your dealership in front of millions of buyers at the exact moment they&apos;re choosing where to buy.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {REASONS.map((r) => (
              <div key={r.title} className="rounded-2xl border border-gray-100 p-6 shadow-sm">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-gold-50 text-gold-600 mb-4"><r.icon size={22} /></span>
                <h3 className="font-semibold text-gray-900 mb-2">{r.title}</h3>
                <p className="text-sm text-gray-600">{r.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="mailto:advertise@dealervoice.io"><Button size="lg" className="bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90"><Mail size={16} className="mr-2" /> Talk to our team</Button></a>
            <p className="text-sm text-gray-500 mt-4">Or <Link href="/pricing" className="text-gold-700 hover:underline">see dealer plans</Link> for built-in promotion.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
