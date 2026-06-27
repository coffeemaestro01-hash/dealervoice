import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Search } from "lucide-react";

export function HomepageCtaSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-showroom" aria-hidden />
      <div className="absolute inset-0 bg-circuit opacity-[0.05]" aria-hidden />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container relative max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/90 mb-4">Ready when you are</p>
        <h2 className="font-display text-3xl md:text-4xl font-light text-white leading-tight">
          Your reputation is your
          <span className="text-gradient-gold"> showroom floor.</span>
        </h2>
        <p className="text-white/50 mt-4 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
          Buyers explore with confidence. Dealers build trust that converts. Start in under two minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link href="/dealers">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto rounded-xl h-12"
            >
              <Search size={18} />
              Find a dealership
            </Button>
          </Link>
          <Link href="/for-dealers">
            <Button size="lg" className="gap-2 font-semibold w-full sm:w-auto rounded-xl h-12 shadow-ember">
              <Building2 size={18} />
              Dealer solutions
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
