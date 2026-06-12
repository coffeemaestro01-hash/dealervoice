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
    <div className="bg-white">
      {/* Hero — GoodFirms "Choose your visibility level" */}
      <section className="bg-gradient-to-b from-night-900 via-night-800 to-night-900 text-white py-16 md:py-20">
        <div className="container max-w-4xl text-center">
          <p className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Dealer plans</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Choose your visibility level</h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Boost your free profile on DealerVoice with flexible plans that increase exposure, remove competitor
            distractions, and help buyers find you sooner.
          </p>
        </div>
      </section>

      {dealerBanner && (
        <div className="container -mt-8 relative z-10 max-w-3xl">
          <div className="rounded-2xl border border-gold-500/40 bg-gold-50 shadow-lg p-6 text-center">
            <p className="text-xs font-bold text-gold-800 uppercase tracking-wide mb-1">Your dealership</p>
            <h2 className="text-xl font-bold text-gray-900">
              Upgrade <span className="text-gold-700">{dealerBanner.name}</span> for ad-free visibility
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Link href={`/claim?dealer=${dealerBanner.dealerId}`}>
                <Button variant="outline" className="border-gold-400 text-gold-800 w-full sm:w-auto">
                  Start free claim
                </Button>
              </Link>
              <Link href={`/dashboard/dealer/billing?dealer=${dealerBanner.dealerId}`}>
                <Button className="bg-gold-600 hover:bg-gold-700 text-white w-full sm:w-auto">Go to checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="container">
          <p className="text-center text-gray-500 text-sm max-w-xl mx-auto mb-10">
            Start free. Upgrade when you are ready to own the buyer journey on your profile.
          </p>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`flex flex-col rounded-2xl bg-white p-8 md:p-9 shadow-sm border transition-shadow hover:shadow-md ${
                  plan.highlighted
                    ? "border-gold-500 ring-2 ring-gold-500/30 lg:scale-[1.02] shadow-lg relative z-10"
                    : "border-gray-200"
                }`}
              >
                {plan.badge && (
                  <span className="inline-flex self-start items-center gap-1 bg-gold-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                    <Sparkles size={12} /> {plan.badge}
                  </span>
                )}

                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-gold-700 font-medium text-sm mt-1">{plan.tagline}</p>

                <div className="mt-6 mb-2">
                  {plan.customPrice ? (
                    <p className="text-2xl font-bold text-gray-900">Pricing on request</p>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-gray-900 tracking-tight">
                        {plan.priceUsd}
                        {plan.period && <span className="text-lg font-medium text-gray-500">{plan.period}</span>}
                      </p>
                    </>
                  )}
                  {plan.annualNote && (
                    <p className="text-xs text-green-700 font-medium mt-2">{plan.annualNote}</p>
                  )}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-6">{plan.intro}</p>

                {plan.includesLabel && (
                  <p className="text-xs font-semibold text-gold-800 uppercase tracking-wide mb-3">{plan.includesLabel}</p>
                )}

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm text-gray-700 leading-snug">
                      <CheckCircle2 size={16} className="text-gold-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="mt-auto">
                  <Button
                    className={`w-full h-12 text-base font-semibold ${
                      plan.highlighted
                        ? "bg-gold-600 hover:bg-gold-700 text-white"
                        : plan.customPrice
                          ? "bg-night-800 hover:bg-night-700 text-white"
                          : "bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50"
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
      <section className="py-16 border-t border-gray-100">
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
            Why dealerships upgrade on DealerVoice
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12 max-w-lg mx-auto">
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
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-night-900 text-white">
        <div className="container">
          <h2 className="text-center text-lg font-semibold text-white/80 mb-10">Dealerships already on DealerVoice</h2>
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gold-400">
                {stats.dealerships >= 1000 ? `${Math.floor(stats.dealerships / 100) / 10}K+` : stats.dealerships.toLocaleString()}
              </p>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-wide">Dealerships listed</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gold-400">{stats.countries}+</p>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-wide">Countries</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-gold-400">Free</p>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-wide">To claim &amp; start</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">What dealers say</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.name}
                className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
              >
                <p className="text-gray-700 text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 pt-4 border-t border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">Frequently asked questions</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Everything you need to know before upgrading.</p>
          <PricingFaq />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 bg-gold-50 border-t border-gold-100">
        <div className="container max-w-2xl text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Need a custom package?</h2>
          <p className="text-sm text-gray-600 mb-6">
            Enterprise groups and sponsorship slots can be tailored to your cities, brands, and inventory goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact">
              <Button className="bg-gold-600 hover:bg-gold-700 text-white w-full sm:w-auto">Get a quote</Button>
            </Link>
            <a href={`mailto:${EMAILS.dealers}`}>
              <Button variant="outline" className="border-gold-400 text-gold-800 w-full sm:w-auto">
                {EMAILS.dealers}
              </Button>
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-6">Payments via Stripe</p>
        </div>
      </section>
    </div>
  );
}
