import Link from "next/link";
import { Bot, Calendar, Clock, Mail, MessageCircle, Sparkles, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_PRICES_USD } from "@/lib/payment";
import { SALES_ASSISTANT_PLAN_COPY } from "@/lib/sales-assistant/features";

const TIERS = [
  {
    key: "PRO",
    name: "Pro",
    price: PLAN_PRICES_USD.PRO.monthlyDisplay,
    period: "/mo",
    badge: null as string | null,
    copyKey: "basic" as const,
    href: "/pricing",
  },
  {
    key: "PRO_PLUS",
    name: "Pro+",
    price: PLAN_PRICES_USD.PRO_PLUS.monthlyDisplay,
    period: "/mo",
    badge: "Most complete",
    copyKey: "full" as const,
    href: "/pricing",
    highlighted: true,
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    period: "",
    badge: "Dealer groups",
    copyKey: "enterprise" as const,
    href: "/contact",
  },
];

const HIGHLIGHTS = [
  { icon: Clock, label: "24/7 instant responses" },
  { icon: MessageCircle, label: "AI buyer conversations" },
  { icon: Mail, label: "Leads straight to your inbox" },
  { icon: Calendar, label: "Appointment booking (Pro+)" },
];

export function DealerAISalesAssistantSection() {
  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden border-y border-primary/20 bg-gradient-to-b from-primary/8 via-background to-background"
      aria-labelledby="dealer-ai-assistant-heading"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[80px]" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-14">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/25 rounded-full px-3 py-1 mb-4">
              <Sparkles size={12} />
              Exclusive · Pro & above
            </span>
            <h2
              id="dealer-ai-assistant-heading"
              className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight"
            >
              AI Sales Assistant — never miss a lead again
            </h2>
            <p className="text-muted-foreground mt-4 text-base md:text-lg leading-relaxed max-w-xl">
              Your dealership profile gets a branded AI assistant that answers buyers around the clock,
              qualifies interest, and captures leads into your dashboard — while your team focuses on the showroom.
            </p>

            <ul className="grid sm:grid-cols-2 gap-3 mt-8">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-foreground">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={16} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/pricing">
                <Button className="gap-2 font-semibold">
                  <Bot size={16} />
                  See plans with AI Assistant
                </Button>
              </Link>
              <Link href="/claim">
                <Button variant="outline" className="border-primary/30">
                  Claim free first
                </Button>
              </Link>
            </div>
          </div>

          {/* Chat preview mock */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold">
                <Bot size={18} />
                Your Dealership · AI Assistant
                <span className="ml-auto text-[10px] font-normal opacity-80">Live 24/7</span>
              </div>
              <div className="p-4 space-y-3 bg-muted/30 min-h-[220px]">
                <div className="rounded-xl bg-muted px-3 py-2 text-sm text-foreground max-w-[85%]">
                  Hi! Ask about our inventory, schedule a visit, or get a quote — I&apos;m here 24/7. What can I help you with?
                </div>
                <div className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-foreground max-w-[85%] ml-auto">
                  Do you have any 2024 SUVs in stock? Can I book a test drive Saturday?
                </div>
                <div className="rounded-xl bg-muted px-3 py-2 text-sm text-foreground max-w-[85%]">
                  Great question — I&apos;ll note your interest and connect you with our sales team. What&apos;s the best email to reach you?
                </div>
              </div>
              <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Mail size={12} className="text-primary" />
                Lead captured → dealer dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className={`rounded-xl border p-5 flex flex-col ${
                tier.highlighted
                  ? "border-primary/50 bg-primary/5 shadow-md ring-1 ring-primary/20"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-foreground">{tier.name}</h3>
                  <p className="text-2xl font-display font-bold text-primary mt-1">
                    {tier.price}
                    {tier.period ? (
                      <span className="text-sm font-normal text-muted-foreground">{tier.period}</span>
                    ) : null}
                  </p>
                </div>
                {tier.badge ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide bg-primary/15 text-primary px-2 py-0.5 rounded-full shrink-0">
                    {tier.badge}
                  </span>
                ) : null}
              </div>
              <ul className="space-y-2 flex-1 text-sm text-muted-foreground">
                {SALES_ASSISTANT_PLAN_COPY[tier.copyKey].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check size={14} className="text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href={tier.href} className="mt-4 block">
                <Button
                  variant={tier.highlighted ? "default" : "outline"}
                  size="sm"
                  className={`w-full ${tier.highlighted ? "" : "border-primary/25"}`}
                >
                  {tier.key === "ENTERPRISE" ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Globe size={14} /> Contact sales
                    </span>
                  ) : (
                    `Upgrade to ${tier.name}`
                  )}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
