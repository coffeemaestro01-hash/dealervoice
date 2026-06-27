import { Bot, MessageSquare, Shield, Sparkles } from "lucide-react";

const PILLARS = [
  {
    icon: MessageSquare,
    title: "Verified voice",
    body: "Real buyer reviews with proof — not anonymous noise. Every dealership gets a public record buyers can trust.",
  },
  {
    icon: Shield,
    title: "Trust score",
    body: "A transparent 0–100 score from ratings, verification, response rate, and recency. Methodology published. Never bought.",
  },
  {
    icon: Bot,
    title: "AI that works",
    body: "Sales assistant, review insights, and moderation — built in, not bolted on. Dealers capture leads 24/7 on Pro plans.",
  },
];

export function HomepagePlatformShowcase() {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 flex items-center justify-center gap-2">
            <Sparkles size={14} />
            Why DealerVoice exists
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight">
            Reputation management,
            <span className="text-primary"> finally built for dealers.</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-base md:text-lg leading-relaxed">
            Not a generic review site. Not a CRM with a star rating widget. The full stack — discovery, trust,
            response, and AI conversion — in one platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {PILLARS.map((p, i) => (
            <article
              key={p.title}
              className="group relative rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-500 hover:shadow-ember"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                <p.icon size={22} strokeWidth={1.5} />
              </span>
              <h3 className="font-display text-xl font-medium text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
