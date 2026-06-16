import Link from "next/link";
import { ShieldCheck, Award, Globe, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Reviews",
    description: "Reviews can be verified with purchase invoices, service receipts, or VIN proof.",
  },
  {
    icon: Award,
    title: "Reputation Scoring",
    description: "Our proprietary algorithm scores dealerships 0-100 based on 6 key factors.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Real dealership listings across 26 countries in Asia, Europe & North America - and growing.",
  },
  {
    icon: Zap,
    title: "AI-Powered Insights",
    description: "Moderation and fraud checks help keep reviews authentic and useful for car buyers.",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 bg-pearl border-y border-border">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why trust <span className="text-primary">DealerVoice</span>?</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            We combine real customer experiences with rigorous verification to give you the most reliable dealership insights.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-card border border-border shadow-soft rounded-xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.title === "Verified Reviews" ? (
                  <>
                    Reviews can be verified with purchase invoices, service receipts, or VIN proof.{" "}
                    <Link href="/methodology" className="text-primary hover:text-primary hover:underline">
                      Read our methodology
                    </Link>
                    .
                  </>
                ) : (
                  f.description
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
