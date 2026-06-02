import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-20 bg-night-gradient text-white overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="container text-center relative">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build trust with your <span className="text-gold">customers</span>?</h2>
        <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
          Claim your dealership profile for free. Respond to reviews, track reputation, and grow your business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/claim">
            <Button size="lg" className="bg-gold-gradient text-night-900 hover:opacity-90 gap-2 font-semibold border-0 shadow-gold">
              <Store size={18} />
              Claim Your Dealership
            </Button>
          </Link>
          <Link href="/dealers">
            <Button size="lg" variant="outline" className="border-gold/50 text-gold-300 bg-transparent hover:bg-gold-500/15 gap-2">
              Browse Dealerships
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        <p className="text-gray-500 text-sm mt-6">Free forever · No credit card required</p>
      </div>
    </section>
  );
}
