import Link from "next/link";
import { ArrowRight, Building2, Search, PenLine, Shield, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomepageAudienceSplit() {
  return (
    <section className="py-14 md:py-16 bg-background" aria-labelledby="audience-split-heading">
      <div className="container">
        <p id="audience-split-heading" className="sr-only">
          Choose your path
        </p>
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <Link
            href="/buyers"
            className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
              <Search size={22} />
            </span>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              For car buyers
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Find dealerships, read verified reviews, and compare trust scores before you buy or service your vehicle.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Search size={14} className="text-primary shrink-0" /> Search dealers worldwide
              </li>
              <li className="flex items-center gap-2">
                <PenLine size={14} className="text-primary shrink-0" /> Write a verified review
              </li>
              <li className="flex items-center gap-2">
                <Shield size={14} className="text-primary shrink-0" /> Understand trust scores
              </li>
            </ul>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-6">
              Explore for buyers <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <Link
            href="/for-dealers"
            className="group rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 to-card p-8 hover:border-primary/50 hover:shadow-lg transition-all"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary mb-5">
              <Building2 size={22} />
            </span>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              For dealerships
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Claim your profile, respond to reviews, and upgrade with tools that turn reputation into showroom traffic.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Building2 size={14} className="text-primary shrink-0" /> Free profile claim
              </li>
              <li className="flex items-center gap-2">
                <Shield size={14} className="text-primary shrink-0" /> Reputation dashboard
              </li>
              <li className="flex items-center gap-2">
                <Bot size={14} className="text-primary shrink-0" /> AI sales assistant (Pro)
              </li>
            </ul>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-6">
              Dealer solutions <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
