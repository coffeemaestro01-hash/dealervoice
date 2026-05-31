import { Search, PenLine, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Find Your Dealer",
    description: "Search by name, brand, or location. Browse our directory of 180,000+ dealerships worldwide.",
  },
  {
    step: "02",
    icon: PenLine,
    title: "Verify & Review",
    description: "Upload your purchase invoice or service receipt to earn a Verified badge on your review.",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Make Better Decisions",
    description: "Compare reputation scores, read verified experiences, and choose dealers you can trust.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 bg-night">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">How <span className="text-gold">DealerVoice</span> works</h2>
          <p className="text-gray-400 mt-2">Simple, transparent, and trusted by millions.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STEPS.map((step, i) => (
            <div key={step.step} className="relative text-center">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-gold/20" />
              )}
              <div className="relative inline-flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-night-500 border-2 border-gold/40 flex items-center justify-center mb-4 relative z-10">
                  <step.icon size={24} className="text-gold-400" />
                </div>
                <span className="text-xs font-bold text-gold-500 mb-2">{step.step}</span>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/register">
            <Button size="lg" className="bg-gold-gradient text-night-900 font-semibold hover:opacity-90 border-0">Start for Free</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
