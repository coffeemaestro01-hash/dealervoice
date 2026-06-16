import type { Metadata } from "next";
import { Star, ShieldCheck, Clock, MessageSquare, TrendingUp, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Reputation Score Methodology",
  description: "How DealerVoice calculates a dealership's 0-100 reputation score - transparently and fairly.",
};

const FACTORS = [
  { icon: Star, title: "Average rating", weight: "Largest factor", body: "The mean of all published star ratings for the dealership." },
  { icon: TrendingUp, title: "Review volume", body: "More reviews give a more reliable picture; a single 5★ counts less than fifty." },
  { icon: ShieldCheck, title: "Verification ratio", body: "Reviews backed by proof of purchase or service carry more weight than unverified ones." },
  { icon: Clock, title: "Recency", body: "Recent experiences reflect current service quality more than years-old reviews." },
  { icon: MessageSquare, title: "Responsiveness", body: "Dealers who respond to reviews (positive or negative) show they care." },
  { icon: Scale, title: "Consistency", body: "Stable ratings over time score higher than erratic swings." },
];

export default function MethodologyPage() {
  return (
    <div className="bg-card">
      <section className="border-b border-border bg-muted">
        <div className="container py-14 max-w-3xl">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">How the <span className="text-primary">reputation score</span> works</h1>
          <p className="text-lg text-muted-foreground">
            Every dealership gets a 0-100 DealerVoice score. We publish exactly how it&apos;s calculated - no black boxes, no pay-to-win.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-5 mb-12">
            {FACTORS.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border p-6 shadow-sm">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-3"><f.icon size={20} /></span>
                <h3 className="font-semibold text-foreground">{f.title} {f.weight && <span className="text-xs text-primary font-medium">· {f.weight}</span>}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{f.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-muted border border-border p-7 space-y-4 text-foreground leading-relaxed">
            <h2 className="text-xl font-bold text-foreground">Our principles</h2>
            <p>✅ We <strong>never</strong> edit, hide, or down-rank a review because it&apos;s negative.</p>
            <p>✅ We <strong>never</strong> let a dealer change a reviewer&apos;s words - only reply to them.</p>
            <p>✅ We <strong>never</strong> sell a better score. Paid plans unlock tools, not ratings.</p>
            <p>✅ Suspected fake reviews are sent to human/AI moderation, never silently deleted.</p>
            <p className="text-sm text-muted-foreground pt-2">
              This methodology evolves as the platform grows. Material changes will be versioned and dated here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
