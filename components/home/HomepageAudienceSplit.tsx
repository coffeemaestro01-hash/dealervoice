import Link from "next/link";
import { ArrowRight, Building2, Search, PenLine, Shield, Bot } from "lucide-react";

export function HomepageAudienceSplit() {
  return (
    <section className="py-16 md:py-24 bg-background relative" aria-labelledby="audience-split-heading">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="container">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Two paths. One platform.</p>
          <h2 id="audience-split-heading" className="font-display text-2xl md:text-3xl font-light text-foreground">
            Built for buyers who research.
            <span className="text-primary"> Built for dealers who lead.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            href="/buyers"
            className="group relative rounded-2xl border border-border bg-card p-8 md:p-10 hover:border-primary/40 hover:shadow-ember transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
              <Search size={22} strokeWidth={1.5} />
            </span>
            <h3 className="font-display text-xl md:text-2xl font-medium text-foreground group-hover:text-primary transition-colors">
              For car buyers
            </h3>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Find dealerships, read verified reviews, and compare trust scores before you buy or service your vehicle.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <Search size={14} className="text-primary shrink-0" /> Search dealers worldwide
              </li>
              <li className="flex items-center gap-2.5">
                <PenLine size={14} className="text-primary shrink-0" /> Write a verified review
              </li>
              <li className="flex items-center gap-2.5">
                <Shield size={14} className="text-primary shrink-0" /> Understand trust scores
              </li>
            </ul>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-8">
              Explore for buyers <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/for-dealers"
            className="group relative rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] via-card to-card p-8 md:p-10 hover:border-primary/50 hover:shadow-ember transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-6">
              <Building2 size={22} strokeWidth={1.5} />
            </span>
            <h3 className="font-display text-xl md:text-2xl font-medium text-foreground group-hover:text-primary transition-colors">
              For dealerships
            </h3>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Claim your profile, respond to reviews, and upgrade with AI tools that turn reputation into showroom traffic.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <Building2 size={14} className="text-primary shrink-0" /> Free profile claim
              </li>
              <li className="flex items-center gap-2.5">
                <Shield size={14} className="text-primary shrink-0" /> Reputation dashboard
              </li>
              <li className="flex items-center gap-2.5">
                <Bot size={14} className="text-primary shrink-0" /> AI sales assistant (Pro)
              </li>
              <li className="flex items-center gap-2.5">
                <Building2 size={14} className="text-primary shrink-0" /> Live dealer promotions
              </li>
            </ul>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-8">
              Dealer solutions <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
