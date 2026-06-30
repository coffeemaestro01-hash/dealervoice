import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ForDealersFinalCta() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-primary/8 via-background to-background border-t border-border">
      <div className="container max-w-3xl text-center">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight">
          The complete rooftop platform — at a price that makes separate tools hard to justify
        </h2>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Claim free today. Upgrade when you want AI, Inbox, and premium visibility. Stack billing
          bonuses and regional promotions on top.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href="/claim">
            <Button size="lg" className="gap-2 font-semibold shadow-ember">
              <BadgeCheck size={18} />
              Claim free profile
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="gap-2 border-primary/30">
              View pricing <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          Questions from the top?{" "}
          <Link href="/message-from-ceo" className="text-primary font-medium hover:underline">
            Read a message from our CEO →
          </Link>
        </p>
      </div>
    </section>
  );
}
