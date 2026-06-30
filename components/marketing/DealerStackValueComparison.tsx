import Link from "next/link";
import { ArrowRight, Layers, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_PRICES_USD } from "@/lib/payment";

const TYPICAL_STACK = [
  { label: "Reputation & review platform", range: "$150–$350/mo" },
  { label: "Website AI chat & lead capture", range: "$99–$399/mo" },
  { label: "Team inbox / helpdesk (5 seats)", range: "$250–$750/mo" },
];

export function DealerStackValueComparison() {
  return (
    <section className="py-16 md:py-20 bg-background" aria-labelledby="dealer-stack-value-heading">
      <div className="container max-w-4xl">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            <Layers size={12} />
            Replacement math
          </p>
          <h2
            id="dealer-stack-value-heading"
            className="font-display text-2xl md:text-3xl font-bold text-foreground"
          >
            What dealers often pay separately — vs. one DealerVoice Pro plan
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Typical monthly spend if you buy reputation, chat, and support tools from different vendors.
            DealerVoice bundles all three from day one on Pro.
          </p>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-6 md:p-8 bg-muted/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Typical separate stack
              </p>
              <ul className="space-y-4">
                {TYPICAL_STACK.map((item) => (
                  <li key={item.label} className="flex justify-between gap-4 text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-muted-foreground tabular-nums shrink-0">{item.range}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <span className="font-semibold text-foreground">Typical combined</span>
                <span className="font-display text-lg font-bold text-muted-foreground">$500–$1,500+/mo</span>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-primary/5 border-t md:border-t-0 border-primary/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">
                DealerVoice Pro
              </p>
              <ul className="space-y-4">
                {[
                  "Reputation management & verified profile",
                  "AI Sales Assistant — 24/7 chat & leads",
                  "DealerVoice Inbox — 5 team seats",
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-foreground">
                    <Minus size={14} className="text-primary shrink-0 mt-0.5 rotate-90" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-primary/20">
                <span className="font-semibold text-foreground">One subscription</span>
                <span className="font-display text-2xl font-bold text-primary">
                  {PLAN_PRICES_USD.PRO.monthlyDisplay}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Ranges are illustrative based on common dealer software categories — your current stack may vary.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href="/pricing">
            <Button className="gap-2 font-semibold">
              View plans & pricing <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/claim">
            <Button variant="outline" className="gap-2 border-primary/30">
              Start with free claim
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
