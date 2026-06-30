import Link from "next/link";
import {
  ArrowRight,
  Award,
  Bot,
  Inbox,
  MessageSquare,
  PenLine,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PILLARS = [
  {
    step: "01",
    icon: MessageSquare,
    title: "Reputation",
    tagline: "Get found and trusted",
    body: "Claim your verified profile free. Respond publicly, invite real buyer reviews, and show up in local search — the digital sales floor every prospect checks first.",
    bullets: [
      "Free profile claim & public review responses",
      "QR invites and verified review collection",
      "Trust scores and competitor context",
    ],
    cta: { label: "Claim free profile", href: "/claim" },
  },
  {
    step: "02",
    icon: Bot,
    title: "AI Sales Assistant",
    tagline: "Convert traffic 24/7",
    body: "A branded AI on your profile answers inventory questions, qualifies buyers, and captures leads into your dashboard — while your team is on the lot or after hours.",
    bullets: [
      "24/7 chat on your DealerVoice profile",
      "Lead capture straight to your dashboard",
      "Appointment booking on Pro+",
    ],
    cta: { label: "See AI on Pro plans", href: "/pricing" },
    featured: true,
  },
  {
    step: "03",
    icon: Inbox,
    title: "DealerVoice Inbox",
    tagline: "Never drop a customer",
    body: "Service, sales, parts, and warranty — one support desk with AI email setup, team seats, templates, and kanban. Included with every paid plan, not a separate bill.",
    bullets: [
      "AI onboarding for Gmail, Outlook, or IMAP",
      "5 / 10 / 50 team seats by plan",
      "Kanban, automations, and smart reply drafts",
    ],
    cta: { label: "Explore DealerVoice Inbox", href: "/dealer-inbox" },
  },
];

const FLOW = [
  { icon: PenLine, label: "Reviews bring buyers" },
  { icon: Bot, label: "AI captures intent" },
  { icon: Inbox, label: "Inbox closes the loop" },
];

export function DealerPlatformStack() {
  return (
    <section className="py-16 md:py-24 bg-background" aria-labelledby="dealer-platform-heading">
      <div className="container max-w-6xl">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            <Sparkles size={12} />
            One platform · Three revenue levers
          </p>
          <h2
            id="dealer-platform-heading"
            className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight"
          >
            Everything connected — not three tools duct-taped together
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Reputation earns trust. AI turns visitors into leads. Inbox keeps service and sales
            conversations from falling through the cracks. All under one DealerVoice subscription.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-14 px-4">
          {FLOW.map((item, i) => (
            <div key={item.label} className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2.5 rounded-full border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-medium text-foreground">
                <item.icon size={16} className="text-primary shrink-0" />
                {item.label}
              </div>
              {i < FLOW.length - 1 ? (
                <ArrowRight size={16} className="text-primary/40 hidden sm:block shrink-0" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className={`relative flex flex-col rounded-2xl border p-6 md:p-7 ${
                pillar.featured
                  ? "border-primary/40 bg-primary/5 shadow-md ring-1 ring-primary/15"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">
                  {pillar.step}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <pillar.icon size={20} />
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {pillar.tagline}
              </p>
              <h3 className="font-display text-xl font-bold text-foreground mt-1">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed flex-1">{pillar.body}</p>
              <ul className="mt-5 space-y-2">
                {pillar.bullets.map((line) => (
                  <li key={line} className="flex gap-2 text-sm text-foreground">
                    <Award size={14} className="text-primary shrink-0 mt-0.5" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link href={pillar.cta.href} className="mt-6 block">
                <Button
                  variant={pillar.featured ? "default" : "outline"}
                  size="sm"
                  className={`w-full gap-1.5 ${pillar.featured ? "" : "border-primary/25"}`}
                >
                  {pillar.cta.label}
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
