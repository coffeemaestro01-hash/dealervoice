import type { Metadata } from "next";
import Link from "next/link";
import { Search, PenLine, ShieldCheck, TrendingUp, Users, Globe, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works & About Us",
  description: "Learn how DealerVoice helps car buyers find trustworthy dealerships through verified reviews and transparent reputation scoring.",
};

const STEPS = [
  { icon: Search, title: "Find your dealer", body: "Search thousands of dealerships by name, brand, or location and compare verified ratings side by side." },
  { icon: PenLine, title: "Share your experience", body: "Write a review backed by your purchase invoice or service receipt to earn a Verified badge." },
  { icon: ShieldCheck, title: "We verify it", body: "Every review is screened for authenticity using document checks and fraud detection." },
  { icon: TrendingUp, title: "Everyone decides better", body: "Reputation scores and real experiences help buyers choose dealers they can trust." },
];

const VALUES = [
  { icon: ShieldCheck, title: "Verification first", body: "Reviews backed by proof of purchase carry more weight - so ratings reflect real customers." },
  { icon: Globe, title: "Global coverage", body: "Dealerships across Asia, Europe, North America and beyond, in multiple languages." },
  { icon: Award, title: "Fair & transparent", body: "Our 0-100 reputation score is based on clear, published factors - no pay-to-win." },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(212,175,55,0.10),transparent_60%)]" />
        <div className="container relative py-16 md:py-20 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-700 font-medium mb-6">
            <Star size={14} className="fill-gold-500 text-gold-500" /> Our mission
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5">
            Making car buying <span className="text-gold">trustworthy</span>
          </h1>
          <p className="text-lg text-gray-600">
            DealerVoice exists to bring honesty and transparency to one of life&apos;s biggest purchases.
            We connect car buyers with verified reviews so no one has to gamble on where they buy or service their vehicle.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How DealerVoice works</h2>
            <p className="text-gray-600 mt-2">Four simple steps to better dealership decisions.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-gray-100 p-6 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-gold-50 text-gold-600"><s.icon size={20} /></span>
                  <span className="text-sm font-bold text-gold-600">0{i + 1}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What we stand for</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-gold-gradient text-night-900 mb-4"><v.icon size={22} /></span>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats + CTA */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-14 text-center">
            {[["5,800+", "Dealerships listed"], ["26", "Countries"], ["100%", "Verified-first"], ["Free", "To read & review"]].map(([v, l]) => (
              <div key={l}>
                <div className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-1">
                  {v}
                </div>
                <div className="text-sm text-gray-500 mt-1">{l}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to get started?</h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dealers"><Button size="lg" className="bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90"><Search size={16} className="mr-1" /> Find a dealer</Button></Link>
              <Link href="/claim"><Button size="lg" variant="outline" className="border-gold/50 text-gold-700 hover:bg-gold-50"><Users size={16} className="mr-1" /> Claim your dealership</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
