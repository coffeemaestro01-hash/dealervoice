import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOLUTIONS, SOLUTION_SLUGS, type SolutionSlug } from "@/lib/marketing/voice";
import { RoiCalculator } from "@/components/voice/RoiCalculator";
import { IntegrationsSection } from "@/components/voice/IntegrationsSection";
import { DemoBookingForm } from "@/components/voice/DemoBookingForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SOLUTION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sol = SOLUTIONS[slug as SolutionSlug];
  if (!sol) return {};
  return {
    title: `${sol.headline} | DealerVoice`,
    description: sol.subheadline,
  };
}

export default async function SolutionPage({ params }: Props) {
  const { slug } = await params;
  const sol = SOLUTIONS[slug as SolutionSlug];
  if (!sol) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-night">
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(251,101,20,0.12),transparent_60%)]" />
        <div className="container relative max-w-3xl text-center">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wide mb-4">{sol.brand}</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-5">{sol.headline}</h1>
          <p className="text-lg text-gray-400 mb-8">{sol.subheadline}</p>
          <Link href="/demo">
            <Button size="lg" className="bg-gold-gradient text-night-900 font-semibold border-0 gap-2 h-12 px-8">
              {sol.cta}
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-14 bg-night-soft border-y border-white/5">
        <div className="container max-w-3xl">
          <h2 className="text-xl font-bold text-white mb-4">The challenge</h2>
          <p className="text-gray-400 leading-relaxed">{sol.pain}</p>
          <h2 className="text-xl font-bold text-white mt-10 mb-4">What DealerVoice delivers</h2>
          <ul className="space-y-3">
            {sol.outcomes.map((o) => (
              <li key={o} className="flex gap-3 text-gray-300 text-sm">
                <Check size={18} className="text-green-400 shrink-0 mt-0.5" />
                {o}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RoiCalculator />
      <IntegrationsSection />

      <section className="py-16 bg-night">
        <div className="container max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">{sol.cta}</h2>
          <div className="rounded-2xl border border-white/10 bg-white p-7 shadow-sm">
            <DemoBookingForm
              source={`solution-${slug}`}
              defaultMessage={`Interested in DealerVoice for ${sol.brand}.`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
