import { ShieldCheck, Award, Globe, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Reviews",
    description: "Every review is backed by purchase invoices, service receipts, or VIN verification.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Award,
    title: "Reputation Scoring",
    description: "Our proprietary algorithm scores dealerships 0–100 based on 6 key factors.",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Reviews for dealerships across 190+ countries in 8 languages.",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Zap,
    title: "AI-Powered Insights",
    description: "Sentiment analysis and fake review detection powered by advanced AI.",
    color: "text-amber-600 bg-amber-50",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why trust DealerVoice?</h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            We combine real customer experiences with rigorous verification to give you the most reliable dealership insights.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className={`inline-flex p-3 rounded-xl ${f.color} mb-4`}>
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
