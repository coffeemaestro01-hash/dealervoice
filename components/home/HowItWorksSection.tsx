import { Search, PenLine, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatDealerCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  if (n > 0) return `${n.toLocaleString()}+`;
  return "thousands of";
}

export function HowItWorksSection({ dealerCount = 0 }: { dealerCount?: number }) {
  const directoryLabel = formatDealerCount(dealerCount);

  const STEPS = [
    {
      step: "01",
      icon: Search,
      title: "Search",
      description: `Find dealerships by name, brand, or location in our growing directory of ${directoryLabel} dealerships worldwide.`,
    },
    {
      step: "02",
      icon: PenLine,
      title: "Review",
      description: "Share your experience. Upload a purchase invoice or service receipt to earn a Verified badge on your review.",
    },
    {
      step: "03",
      icon: TrendingUp,
      title: "Decide",
      description: "Compare ratings, read real experiences, and choose dealerships you can trust before you visit.",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">How <span className="text-primary">DealerVoice</span> works</h2>
          <p className="text-muted-foreground mt-2">Search → Review → Decide. Three steps to a better dealership choice.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STEPS.map((step, i) => (
            <div key={step.step} className="relative text-center">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-card" />
              )}
              <div className="relative inline-flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4 relative z-10">
                  <step.icon size={24} className="text-primary" />
                </div>
                <span className="text-xs font-bold text-primary mb-2">{step.step}</span>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/dealers">
            <Button size="lg" className="bg-ember text-night-900 font-semibold hover:opacity-90 border-0">
              Search Reviews
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
