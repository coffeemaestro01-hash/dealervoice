import Link from "next/link";
import { ArrowRight, Inbox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Teaser on /for-dealers linking to the full Inbox marketing page. */
export function DealerInboxTeaserSection() {
  return (
    <section
      className="py-16 md:py-20 border-y border-primary/20 bg-gradient-to-b from-primary/6 via-background to-background"
      aria-labelledby="dealer-inbox-teaser-heading"
    >
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/25 rounded-full px-3 py-1 mb-4">
              <Sparkles size={12} />
              New capability
            </span>
            <h2
              id="dealer-inbox-teaser-heading"
              className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight"
            >
              DealerVoice Inbox — never lose a customer email again
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Paid plans include a full customer support desk: AI email setup, team seats, smart templates,
              kanban, and automations. Service, sales, and parts — one inbox, one history.
            </p>
            <Link href="/dealer-inbox" className="inline-block mt-6">
              <Button size="lg" className="gap-2">
                <Inbox size={18} />
                See DealerVoice Inbox <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "AI walks you through Gmail, Outlook, IMAP, or forwarding setup",
              "5 / 10 / 50 team seats by plan — Enterprise shares across linked rooftops",
              "Starter templates for service, recalls, warranty, and sales",
              "Included with Pro, Pro+, and Enterprise — no separate SKU",
            ].map((line) => (
              <li key={line} className="flex gap-2 items-start">
                <span className="text-primary font-bold mt-0.5">✓</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
