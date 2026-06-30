import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Inbox,
  Kanban,
  Mail,
  MessageSquare,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_PRICES_USD } from "@/lib/payment";
import { INBOX_SEAT_LIMITS } from "@/lib/inbox/constants";
import { BrandAmbient } from "@/components/common/BrandAmbient";

const FEATURES = [
  {
    icon: Inbox,
    title: "One inbox for every customer question",
    body: "Service, sales, parts, and warranty — all in one place. No more lost emails across personal inboxes or sticky notes on monitors.",
  },
  {
    icon: Bot,
    title: "AI that sets up your email for you",
    body: "Gmail, Outlook, IMAP, or forwarding — our onboarding assistant walks your team through connect-and-send in plain language. No IT degree required.",
  },
  {
    icon: Sparkles,
    title: "Reply faster with smart drafts",
    body: "Gemini-powered draft replies and editable templates for appointments, recalls, warranty intake, and more — written in your dealership voice.",
  },
  {
    icon: Kanban,
    title: "Kanban, automations, and SLA visibility",
    body: "Track every ticket from new to resolved. Auto-tag service vs sales inquiries. See response-time health at a glance.",
  },
  {
    icon: Users,
    title: "Your whole team, one system",
    body: "Pro includes 5 seats, Pro+ includes 10, Enterprise shares 50 seats across linked rooftops — every advisor on the same playbook.",
  },
  {
    icon: Mail,
    title: "Web form intake built in",
    body: "Embed a contact path on your site or share a form link. Every submission becomes a tracked ticket with full history.",
  },
];

const STEPS = [
  "Claim your dealership on DealerVoice and upgrade to a paid plan.",
  "Open Customer Inbox from your dealer dashboard — starter templates seed automatically.",
  "Chat with the setup assistant to connect your support email however you run it today.",
  "Invite your team, reply to real customers, and watch response times improve.",
];

const PLANS = [
  { name: "Pro", price: PLAN_PRICES_USD.PRO.monthlyDisplay, seats: INBOX_SEAT_LIMITS.PRO },
  { name: "Pro+", price: PLAN_PRICES_USD.PRO_PLUS.monthlyDisplay, seats: INBOX_SEAT_LIMITS.PRO_PLUS, highlight: true },
  { name: "Enterprise", price: PLAN_PRICES_USD.ENTERPRISE.monthlyDisplay, seats: INBOX_SEAT_LIMITS.ENTERPRISE },
];

export function DealerInboxMarketing() {
  return (
    <div className="bg-card">
      <section className="relative overflow-hidden border-b border-border">
        <BrandAmbient />
        <div className="container relative py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/25 rounded-full px-3 py-1 mb-4">
                <MessageSquare size={12} />
                New · Included with paid plans
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
                DealerVoice Inbox — customer support built for the lot
              </h1>
              <p className="text-muted-foreground mt-5 text-lg leading-relaxed max-w-xl">
                Stop losing service appointments and sales leads in scattered email threads. DealerVoice Inbox
                gives your rooftop a professional support desk — AI setup, team collaboration, and every
                customer conversation in one place.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/pricing">
                  <Button size="lg" className="gap-2 font-semibold">
                    See plans & upgrade <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/claim">
                  <Button size="lg" variant="outline" className="gap-2 border-primary/30">
                    Claim free profile first
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Already on a paid plan?{" "}
                <Link href="/ticketing/inbox" className="text-primary font-medium hover:underline">
                  Open your inbox →
                </Link>
              </p>
            </div>

            <div className="relative rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-lg">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/50">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-muted-foreground font-medium">DealerVoice Inbox</span>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                    <div>
                      <p className="font-semibold text-foreground">Service appointment request</p>
                      <p className="text-muted-foreground text-xs mt-1">DV-000142 · Waiting · 12 min ago</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded">
                      Service
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3 p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold text-foreground">Trade-in quote follow-up</p>
                      <p className="text-muted-foreground text-xs mt-1">DV-000141 · Open · 1 hr ago</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Sales
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
                    <Sparkles size={14} className="text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      AI draft ready — review and send in one click
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-b border-border">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-foreground">Why dealers switch to Inbox</h2>
            <p className="text-muted-foreground mt-3">
              Reputation brings buyers to your profile. Inbox makes sure you answer them like a modern operator — not a shared Gmail password and hope.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border p-6 bg-card shadow-sm hover:border-primary/30 transition-colors">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4">
                  <f.icon size={20} />
                </span>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted border-b border-border">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Live in four steps</h2>
          <ol className="space-y-4">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-4 items-start">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-muted-foreground pt-1 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Included with every paid plan</h2>
            <p className="text-muted-foreground mt-2">Free claimed profiles see an upgrade path — no surprise add-ons.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-6 text-center ${
                  p.highlight ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card"
                }`}
              >
                {p.highlight && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Most popular</span>
                )}
                <p className="text-lg font-bold text-foreground mt-1">{p.name}</p>
                <p className="text-2xl font-extrabold text-foreground mt-2">
                  {p.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  Up to <strong className="text-foreground">{p.seats}</strong> team seats on Inbox
                </p>
              </div>
            ))}
          </div>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10 text-sm text-muted-foreground">
            {["Kanban board", "Canned responses", "Automations", "SLA tracking", "CSAT surveys", "AI onboarding"].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check size={14} className="text-primary" />
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
      </section>

      <section className="py-16 border-t border-border bg-gradient-to-b from-primary/8 to-background">
        <div className="container text-center max-w-2xl">
          <Zap className="mx-auto text-primary mb-4" size={32} />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Your customers already email you. Now answer like a pro.
          </h2>
          <p className="text-muted-foreground mb-8">
            Join dealerships using DealerVoice for reputation and operations in one platform. Upgrade today and open Inbox from your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="gap-2 font-semibold">
                View pricing <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/for-dealers">
              <Button size="lg" variant="outline" className="border-primary/30">
                All dealer solutions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
