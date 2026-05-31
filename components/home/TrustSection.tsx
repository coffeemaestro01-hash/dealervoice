import { ShieldCheck, Award, Globe, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Reviews",
    description: "Every review is backed by purchase invoices, service receipts, or VIN verification.",
  },
  {
    icon: Award,
    title: "Reputation Scoring",
    description: "Our proprietary algorithm scores dealerships 0–100 based on 6 key factors.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Reviews for dealerships across 190+ countries in 8 languages.",
  },
  {
    icon: Zap,
    title: "AI-Powered Insights",
    description: "Sentiment analysis and fake review detection powered by advanced AI.",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 bg-night-soft">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Why trust <span className="text-gold">DealerVoice</span>?</h2>
          <p className="text-gray-400 mt-2 max-w-xl mx-auto">
            We combine real customer experiences with rigorous verification to give you the most reliable dealership insights.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-dark rounded-xl p-6 transition-transform hover:-translate-y-1">
              <div className="inline-flex p-3 rounded-xl bg-gold-500/15 text-gold-400 mb-4">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
