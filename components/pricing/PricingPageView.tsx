import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingFaq } from "@/components/pricing/PricingFaq";
import { EMAILS } from "@/lib/constants/emails";

export interface PricingPlan {
  name: string;
  tagline: string;
  intro: string;
  priceUsd: string;
  period: string;
  annualNote?: string;
  includesLabel?: string;
  benefits: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
  badge?: string;
  customPrice?: boolean;
}

interface Props {
  plans: PricingPlan[];
  dealerBanner?: { name: string; dealerId: string } | null;
  stats: { dealerships: number; countries: number };
}

const TESTIMONIALS = [
  {
    quote:
      "Buyers compare us against three other Ford outlets in Chicago. A claimed DealerVoice profile with no competitor ads keeps the conversation on our delivery and service — not someone else's banner.",
    name: "Mike Torres",
    role: "General Manager, Chicago-area dealership",
  },
  {
    quote:
      "We list inventory on Pro and share the review link after every delivery. It is the simplest way to build outlet-level trust without running another ad campaign.",
    name: "Sarah Chen",
    role: "Owner, multi-location dealer group",
  },
];

export function PricingPageView({ plans, dealerBanner, stats }: Props) {
  return (
    <div className="bg-card">
      {/* Hero — GoodFirms "Choose your visibility level" */}
      <section className="bg-gradient-to-b from-background via-muted to-background text-foreground py-16 md:py-20">
        <div className="container max-w-4xl text-center">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">Dealer plans</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Choose your visibility level</h1>
          <p className="text-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Boost your free profile on DealerVoice with flexible plans that increase exposure, remove competitor
            distractions, and help buyers find you sooner.
          </p>
        </div>
      </section>

      {dealerBanner && (
        <div className="container -mt-8 relative z-10 max-w-3xl">
          <div className="rounded-2xl border border-primary/40 bg-primary/10 shadow-lg p-6 text-center">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Your dealership</p>
            <h2 className="text-xl font-bold text-foreground">
              Upgrade <span className="text-primary">{dealerBanner.name}</span> for ad-free visibility
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Link href={`/claim?dealer=${dealerBanner.dealerId}`}>
                <Button variant="outline" className="border-primary/30 text-primary w-full sm:w-auto">
                  Start free claim
                </Button>
              </Link>
              <Link href={`/dashboard/dealer/billing?dealer=${dealerBanner.dealerId}`}>
                <Button className="bg-primary hover:bg-primary/90 text-foreground w-full sm:w-auto">Go to checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <section className="py-14 md:py-20 bg-muted">
        <div className="container">
          <p className="text-center text-muted-foreground text-sm max-w-xl mx-auto mb-10">
            Start free. Upgrade when you are ready to own the buyer journey on your profile.
          </p>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`flex flex-col rounded-2xl bg-card p-8 md:p-9 shadow-sm border transition-shadow hover:shadow-md ${
                  plan.highlighted
                    ? "border-primary/30 ring-2 ring-primary/30 lg:scale-[1.02] shadow-lg relative z-10"
                    : "border-border"
                }`}
              >
                {plan.badge && (
                  <span className="inline-flex self-start items-center gap-1 bg-primary text-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                    <Sparkles size={12} /> {plan.badge}
                  </span>
                )}

                <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
                <p className="text-primary font-medium text-sm mt-1">{plan.tagline}</p>

                <div className="mt-6 mb-2">
                  {plan.customPrice ? (
                    <p className="text-2xl font-bold text-foreground">Pricing on request</p>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-foreground tracking-tight">
                        {plan.priceUsd}
                        {plan.period && <span className="text-lg font-medium text-muted-foreground">{plan.period}</span>}
                      </p>
                    </>
                  )}
                  {plan.annualNote && (
                    <p className="text-xs text-primary font-medium mt-2">{plan.annualNote}</p>
                  )}
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{plan.intro}</p>

                {plan.includesLabel && (
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">{plan.includesLabel}</p>
                )}

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm text-foreground leading-snug">
                      <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="mt-auto">
                  <Button
                    className={`w-full h-12 text-base font-semibold ${
                      plan.highlighted
                        ? "bg-primary hover:bg-primary/90 text-foreground"
                        : plan.customPrice
                          ? "bg-pearl hover:bg-muted text-foreground"
                          : "bg-card border-2 border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why upgrade — GoodFirms-style value props */}
      <section className="py-16 border-t border-border">
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-3">
            Why dealerships upgrade on DealerVoice
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-12 max-w-lg mx-auto">
            Outlet-level trust beats brand advertising when buyers are choosing where to buy.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Own the profile",
                body: "Free listings are open to every buyer. Pro removes competitor placements so your story is not interrupted.",
              },
              {
                title: "Show inventory",
                body: "List vehicles directly on your profile and country browse pages — buyers see what you have in stock.",
              },
              {
                title: "Grow verified reviews",
                body: "Share your review invite after every delivery and respond publicly to build outlet-level reputation.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center md:text-left">
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-pearl text-foreground">
        <div className="container">
          <h2 className="text-center text-lg font-semibold text-foreground mb-10">Dealerships already on DealerVoice</h2>
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">
                {stats.dealerships >= 1000 ? `${Math.floor(stats.dealerships / 100) / 10}K+` : stats.dealerships.toLocaleString()}
              </p>
              <p className="text-xs text-foreground mt-1 uppercase tracking-wide">Dealerships listed</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">{stats.countries}+</p>
              <p className="text-xs text-foreground mt-1 uppercase tracking-wide">Countries</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">Free</p>
              <p className="text-xs text-foreground mt-1 uppercase tracking-wide">To claim &amp; start</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted">
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">What dealers say</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.name}
                className="bg-card rounded-2xl border border-border p-8 shadow-sm"
              >
                <p className="text-foreground text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 pt-4 border-t border-border">
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2">Frequently asked questions</h2>
          <p className="text-center text-muted-foreground text-sm mb-10">Everything you need to know before upgrading.</p>
          <PricingFaq />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 bg-primary/10 border-t border-primary/30">
        <div className="container max-w-2xl text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Need a custom package?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enterprise groups and sponsorship slots can be tailored to your cities, brands, and inventory goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact">
              <Button className="bg-primary hover:bg-primary/90 text-foreground w-full sm:w-auto">Get a quote</Button>
            </Link>
            <a href={`mailto:${EMAILS.dealers}`}>
              <Button variant="outline" className="border-primary/30 text-primary w-full sm:w-auto">
                {EMAILS.dealers}
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-6">Payments via Stripe</p>
        </div>
      </section>
    </div>
  );
}
