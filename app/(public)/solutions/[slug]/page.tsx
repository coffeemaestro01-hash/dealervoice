import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { SOLUTIONS, SOLUTION_SLUGS, type SolutionSlug } from "@/lib/marketing/voice";
import { RoiCalculator } from "@/components/voice/RoiCalculator";
import { IntegrationsSection } from "@/components/voice/IntegrationsSection";
import { DemoBookingForm } from "@/components/voice/DemoBookingForm";
import { LuxuryMesh } from "@/components/luxury/LuxuryMesh";

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
  return { title: sol.headline, description: sol.subheadline };
}

export default async function SolutionPage({ params }: Props) {
  const { slug } = await params;
  const sol = SOLUTIONS[slug as SolutionSlug];
  if (!sol) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-night">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <LuxuryMesh />
        <div className="container relative max-w-3xl text-center">
          <div className="luxury-pill mx-auto mb-8">
            <Sparkles size={13} />
            {sol.brand}
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-semibold text-white mb-6 leading-tight">
            {sol.headline}
          </h1>
          <p className="text-lg text-gray-400 font-light leading-relaxed mb-10">{sol.subheadline}</p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-full btn-luxury-primary text-night-900 font-semibold text-sm tracking-wide"
          >
            {sol.cta}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-night-soft border-y border-white/[0.06]">
        <div className="container max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl text-white font-semibold mb-5">The challenge</h2>
          <p className="text-gray-400 leading-relaxed text-lg font-light">{sol.pain}</p>
          <h2 className="font-display text-2xl md:text-3xl text-white font-semibold mt-14 mb-6">What DealerVoice delivers</h2>
          <ul className="space-y-4">
            {sol.outcomes.map((o) => (
              <li key={o} className="flex gap-4 text-gray-300">
                <Check size={20} className="text-gold-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RoiCalculator />
      <IntegrationsSection />

      <section className="py-20 md:py-28 bg-night">
        <div className="container max-w-lg mx-auto">
          <h2 className="font-display text-3xl text-white text-center font-semibold mb-8">{sol.cta}</h2>
          <div className="luxury-card p-8 md:p-10">
            <DemoBookingForm dark source={`solution-${slug}`} defaultMessage={`Interested in DealerVoice for ${sol.brand}.`} />
          </div>
        </div>
      </section>
    </div>
  );
}
