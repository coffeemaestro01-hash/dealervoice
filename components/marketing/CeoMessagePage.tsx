import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Globe, Heart, Inbox, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandAmbient } from "@/components/common/BrandAmbient";
import { CEO, COMPANY } from "@/lib/constants/company";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Verification before vanity metrics",
    body: "Buyers deserve proof-backed reviews. Dealers deserve tools that protect their reputation without gaming the system.",
  },
  {
    icon: Building2,
    title: "Built for rooftops, not Silicon Valley",
    body: "Every feature — from AI sales assistants to DealerVoice Inbox — is designed for how dealerships actually work: busy, multi-department, customer-facing.",
  },
  {
    icon: Globe,
    title: "Global ambition, local trust",
    body: "We started in Chicago with a simple idea: make car buying transparent. That same standard now drives how we build software for dealers everywhere.",
  },
];

export function CeoMessagePage() {
  return (
    <div className="bg-card">
      <section className="relative overflow-hidden border-b border-border">
        <BrandAmbient />
        <div className="container relative py-16 md:py-20">
          <div className="grid lg:grid-cols-[280px_1fr] gap-10 lg:gap-14 items-start max-w-5xl mx-auto">
            <div className="mx-auto lg:mx-0 text-center lg:text-left">
              <div className="relative w-56 h-56 mx-auto lg:mx-0 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg ring-4 ring-primary/5">
                <Image
                  src={CEO.headshotPath}
                  alt={`${CEO.name}, ${CEO.title} of ${CEO.organization}`}
                  fill
                  className="object-cover object-top"
                  sizes="224px"
                  priority
                />
              </div>
              <div className="mt-6">
                <h1 className="text-2xl font-bold text-foreground">{CEO.name}</h1>
                <p className="text-primary font-semibold mt-1">
                  {CEO.title}, {CEO.organization}
                </p>
                <p className="text-sm text-muted-foreground italic mt-3 leading-relaxed max-w-xs mx-auto lg:mx-0">
                  &ldquo;{CEO.tagline}&rdquo;
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Message from our CEO</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">
                A platform where trust and operations meet
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When we built {COMPANY.name}, we did not set out to create another directory. We set out to fix a
                  broken moment in car buying — the gap between what a dealership promises and what a buyer can
                  verify before they walk in.
                </p>
                <p>
                  Today, thousands of dealerships use DealerVoice to earn and defend their reputation with verified
                  reviews, transparent scores, and tools that turn profile views into real conversations. That is
                  only half the story.
                </p>
                <p>
                  With <strong className="text-foreground">DealerVoice Inbox</strong>, we are closing the loop. Your
                  customers email you about service, parts, financing, and trade-ins every day. Inbox gives every
                  paid rooftop a modern support desk — AI-guided email setup, team collaboration, smart reply
                  templates, and full ticket history — without enterprise complexity or enterprise pricing games.
                </p>
                <p>
                  My vision is simple: a dealer group in Illinois and a single-rooftop store in Texas should both
                  have access to world-class reputation and customer-operations software. Claim free. Upgrade when
                  you are ready. Grow with us as we expand worldwide.
                </p>
                <p className="text-foreground font-medium pt-2">
                  Thank you for trusting us with your name on the internet. We take that seriously.
                </p>
                <p className="text-foreground font-semibold pt-4">{CEO.name}</p>
                <p className="text-sm">{CEO.title}, {CEO.organization}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-border bg-muted/50">
        <div className="container">
          <h3 className="text-2xl font-bold text-foreground text-center mb-10">What we are building toward</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4">
                  <p.icon size={20} />
                </span>
                <h4 className="font-semibold text-foreground mb-2">{p.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-10 flex flex-col md:flex-row gap-6 items-center">
            <span className="grid place-items-center w-14 h-14 rounded-xl bg-primary text-primary-foreground shrink-0">
              <Inbox size={26} />
            </span>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
                DealerVoice Inbox
                <Sparkles size={18} className="text-primary" />
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Our newest capability for paid dealers — customer support with AI setup, included on Pro and above.
                See how it works before you upgrade.
              </p>
            </div>
            <Link href="/dealer-inbox" className="shrink-0">
              <Button className="gap-2">
                Explore Inbox <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 border-t border-border">
        <div className="container text-center">
          <Heart className="mx-auto text-primary mb-3" size={28} />
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            {COMPANY.tagline} — join dealers who treat reputation and customer response as one strategy.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/claim">
              <Button size="lg">Claim your dealership</Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-primary/30">
                About DealerVoice
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
