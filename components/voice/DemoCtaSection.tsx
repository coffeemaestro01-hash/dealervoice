import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { LuxuryMesh } from "@/components/luxury/LuxuryMesh";

export function DemoCtaSection() {
  return (
    <section className="relative py-28 md:py-36 bg-night-gradient overflow-hidden">
      <LuxuryMesh />
      <div className="absolute inset-x-0 top-0 luxury-divider" />
      <div className="container text-center relative">
        <p className="text-[10px] uppercase tracking-luxury text-gold-400 font-semibold mb-6">Invite only · Limited onboarding slots</p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight max-w-3xl mx-auto">
          Ready to recover <span className="text-gold italic">missed revenue</span>?
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto font-light leading-relaxed">
          A private 20-minute demo. Live call handling, ROI for your store, and your integration roadmap.
        </p>
        <Link
          href="/demo"
          className="inline-flex items-center gap-3 h-14 px-10 rounded-full btn-luxury-primary text-night-900 font-semibold text-sm tracking-wide"
        >
          <Calendar size={18} />
          Book Your Private Demo
          <ArrowRight size={16} />
        </Link>
        <p className="text-gray-600 text-xs mt-8 tracking-wide uppercase">No credit card · No long-term contract</p>
      </div>
    </section>
  );
}
