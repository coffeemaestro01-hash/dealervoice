import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-20 bg-pearl text-foreground overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="container text-center relative">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build trust with your <span className="text-primary">customers</span>?</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Claim your dealership profile for free. Respond to reviews, track reputation, and grow your business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/claim">
            <Button size="lg" className="bg-ember text-night-900 hover:opacity-90 gap-2 font-semibold border-0 shadow-ember">
              <Store size={18} />
              Claim Your Dealership
            </Button>
          </Link>
          <Link href="/dealers">
            <Button size="lg" variant="outline" className="border-primary/30 text-primary bg-transparent hover:bg-primary/10 gap-2">
              Browse Dealerships
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground text-sm mt-6">Free forever · No credit card required</p>
      </div>
    </section>
  );
}
