import Link from "next/link";
import { Search, ShieldCheck, MessageSquare, Car, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Search by city & brand",
    body: "Browse verified dealerships in your area. Filter by brand, category, and rating.",
    href: "/dealers",
    cta: "Search dealers",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Check the Trust Score",
    body: "Every dealer gets a 0-100 Trust Score based on verified reviews, responsiveness, and more.",
    href: "/trust",
    cta: "How Trust works",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Read buyer reviews",
    body: "Real experiences from verified buyers — moderated by AI and humans so you can trust them.",
    href: "/write-review",
    cta: "Leave a review",
  },
  {
    icon: Car,
    step: "04",
    title: "Get your best deal",
    body: "Contact the dealer directly, or ask our Dream Car Assistant for a shortlist.",
    href: "/dealers",
    cta: "Find my dealer",
  },
];

export function BuyerJourneyStrip() {
  return (
    <section className="py-12 bg-muted border-y border-border">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Your <span className="text-primary">confident car-buying</span> journey
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm max-w-lg mx-auto">
            From search to signing — here&apos;s how DealerVoice protects you every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div
              key={s.step}
              className="relative rounded-xl bg-muted border border-border p-5 hover:border-primary/40 hover:bg-muted transition-all group"
            >
              {/* Connector arrow — hidden on last item and on mobile */}
              {i < STEPS.length - 1 && (
                <ArrowRight
                  size={14}
                  className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
                />
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center shrink-0">
                  <s.icon size={16} className="text-primary" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Step {s.step}
                </span>
              </div>

              <h3 className="font-semibold text-foreground text-sm mb-1.5">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{s.body}</p>

              <Link
                href={s.href}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-primary transition-colors"
              >
                {s.cta} <ArrowRight size={11} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
