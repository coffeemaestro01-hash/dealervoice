import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_PRICES_USD } from "@/lib/payment";
import { INBOX_SEAT_LIMITS } from "@/lib/inbox/constants";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    summary: "Claim, respond, get discovered",
    highlights: [
      "Verified dealership profile",
      "Public review responses",
      "City & country search visibility",
    ],
    cta: "Claim free profile",
    href: "/claim",
    highlighted: false,
  },
  {
    name: "Pro",
    price: PLAN_PRICES_USD.PRO.monthlyDisplay,
    period: "/mo",
    summary: "AI assistant + Inbox included",
    highlights: [
      "AI Sales Assistant — 24/7 chat & leads",
      `DealerVoice Inbox — ${INBOX_SEAT_LIMITS.PRO} team seats`,
      "No competitor ads on your profile",
    ],
    cta: "Upgrade to Pro",
    href: "/pricing",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Pro+",
    price: PLAN_PRICES_USD.PRO_PLUS.monthlyDisplay,
    period: "/mo",
    summary: "Featured badge & booking",
    highlights: [
      "Everything in Pro",
      `Inbox — ${INBOX_SEAT_LIMITS.PRO_PLUS} seats · appointment booking`,
      "Featured badge & priority local placement",
    ],
    cta: "Upgrade to Pro+",
    href: "/pricing",
    highlighted: false,
    badge: "Best for growth",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    summary: "Multi-rooftop dealer groups",
    highlights: [
      `${INBOX_SEAT_LIMITS.ENTERPRISE} shared Inbox seats across rooftops`,
      "Linked locations · group admin",
      "Dedicated onboarding & support",
    ],
    cta: "Contact sales",
    href: "/contact",
    highlighted: false,
  },
];

export function DealerValueLadder() {
  return (
    <section
      className="py-16 md:py-20 border-y border-border bg-muted/30"
      aria-labelledby="dealer-value-ladder-heading"
    >
      <div className="container max-w-6xl">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            Simple pricing ladder
          </p>
          <h2
            id="dealer-value-ladder-heading"
            className="font-display text-2xl md:text-3xl font-bold text-foreground"
          >
            Start free. Scale when you&apos;re ready.
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Pro and above include AI Sales Assistant and DealerVoice Inbox — no separate SKUs,
            no surprise add-ons.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-xl border p-5 ${
                tier.highlighted
                  ? "border-primary/50 bg-card shadow-md ring-1 ring-primary/20"
                  : "border-border bg-card"
              }`}
            >
              {tier.badge ? (
                <span className="absolute -top-2.5 left-4 text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {tier.badge}
                </span>
              ) : null}
              <h3 className="font-bold text-foreground">{tier.name}</h3>
              <p className="font-display text-2xl font-bold text-primary mt-1">
                {tier.price}
                {tier.period ? (
                  <span className="text-sm font-normal text-muted-foreground">{tier.period}</span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{tier.summary}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {tier.highlights.map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-foreground leading-snug">
                    <Check size={12} className="text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={tier.href} className="mt-5 block">
                <Button
                  variant={tier.highlighted ? "default" : "outline"}
                  size="sm"
                  className={`w-full ${tier.highlighted ? "" : "border-primary/25"}`}
                >
                  {tier.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/pricing">
            <Button variant="link" className="gap-1.5 text-primary">
              Compare full plan details <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
