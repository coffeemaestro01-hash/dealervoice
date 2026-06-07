import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";

export function DemoCtaSection() {
  return (
    <section className="relative py-20 bg-night-gradient text-white overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="container text-center relative">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to recover <span className="text-gold">missed revenue</span>?
        </h2>
        <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
          Book a 20-minute demo. We&apos;ll show you live call handling, ROI for your store, and your integration path.
        </p>
        <Link href="/demo">
          <Button size="lg" className="bg-gold-gradient text-night-900 hover:opacity-90 gap-2 font-semibold border-0 shadow-gold h-12 px-10">
            <Calendar size={18} />
            Book Your Demo
            <ArrowRight size={16} />
          </Button>
        </Link>
        <p className="text-gray-500 text-sm mt-6">No credit card · No long-term contract · See ROI in your first call</p>
      </div>
    </section>
  );
}
