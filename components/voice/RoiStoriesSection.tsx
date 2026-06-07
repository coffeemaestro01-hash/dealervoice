import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROI_STORIES } from "@/lib/marketing/voice";
import { SectionHeader } from "@/components/luxury/SectionHeader";
import { LuxuryMesh } from "@/components/luxury/LuxuryMesh";

export function RoiStoriesSection() {
  return (
    <section className="relative py-24 md:py-32 bg-night overflow-hidden">
      <LuxuryMesh className="opacity-40" />
      <div className="container relative">
        <SectionHeader
          eyebrow="Proven outcomes"
          title={<>Results that <span className="text-gold italic">move the needle</span></>}
          subtitle="Not testimonials — measurable revenue impact from dealerships like yours."
        />

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {ROI_STORIES.map((story) => (
            <div key={story.dealer} className="luxury-card p-8 md:p-9 flex flex-col group">
              <p className="text-[10px] uppercase tracking-luxury text-gold-400/90 font-semibold mb-4">{story.dealer}</p>
              <p className="font-display text-4xl md:text-[2.75rem] font-semibold text-white leading-none luxury-stat">
                {story.metric}
              </p>
              <p className="text-gray-500 text-sm mt-2 mb-5">{story.period}</p>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">{story.detail}</p>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="font-display text-3xl font-semibold text-gold luxury-stat">{story.revenue}</p>
                <p className="text-[10px] uppercase tracking-luxury text-gray-500 mt-1">{story.revenueLabel}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-10 tracking-wide">
          Representative pilot results · Individual outcomes vary by call volume
        </p>

        <div className="text-center mt-10">
          <Link href="/demo" className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium text-sm tracking-wide transition-colors">
            Get results at your store <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
