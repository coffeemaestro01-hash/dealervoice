import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star, BadgeCheck } from "lucide-react";

export function DealerGrowthBanner() {
  return (
    <section className="border-y border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5">
      <div className="container py-10 flex flex-col lg:flex-row items-center gap-6 justify-between">
        <div className="flex items-start gap-4 max-w-2xl">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
            <TrendingUp size={22} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Chicago dealers · Pro from $199/mo</p>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Turn profile views into paying customers
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Claim free → collect reviews with QR & SMS tools → upgrade to Pro or Pro+ ($349) for featured badges and review backlinks on your website.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link href="/claim">
            <Button className="gap-2 font-semibold">
              <BadgeCheck size={16} /> Claim free
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="gap-2 border-primary/30">
              <Star size={16} /> See Pro plans
            </Button>
          </Link>
          <Link href="/chicago">
            <Button variant="ghost" className="text-primary">
              Chicago wedge →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
