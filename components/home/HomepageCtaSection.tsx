import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Search } from "lucide-react";

export function HomepageCtaSection() {
  return (
    <section className="py-16 md:py-20 bg-pearl border-t border-border">
      <div className="container max-w-3xl text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Start with the path that fits you
        </h2>
        <p className="text-muted-foreground mt-3 text-base">
          Buyers explore with confidence. Dealers build reputation that converts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/dealers">
            <Button size="lg" variant="outline" className="gap-2 border-primary/30 w-full sm:w-auto">
              <Search size={18} />
              Find a dealership
            </Button>
          </Link>
          <Link href="/for-dealers">
            <Button size="lg" className="gap-2 font-semibold w-full sm:w-auto">
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
