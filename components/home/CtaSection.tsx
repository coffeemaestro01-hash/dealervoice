import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-950 text-white">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build trust with your customers?</h2>
        <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
          Claim your dealership profile for free. Respond to reviews, track reputation, and grow your business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/claim">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 gap-2 font-semibold">
              <Store size={18} />
              Claim Your Dealership
            </Button>
          </Link>
          <Link href="/dealers">
            <Button size="lg" variant="outline" className="border-blue-600 text-white hover:bg-blue-800 gap-2">
              Browse Dealerships
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        <p className="text-blue-400 text-sm mt-6">Free forever · No credit card required</p>
      </div>
    </section>
  );
}
