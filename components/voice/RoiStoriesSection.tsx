import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROI_STORIES } from "@/lib/marketing/voice";

export function RoiStoriesSection() {
  return (
    <section className="py-16 md:py-20 bg-night">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Results, not <span className="text-gold">testimonials</span>
          </h2>
          <p className="text-gray-400 mt-2">Dealers buy outcomes. Here&apos;s what DealerVoice delivers.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ROI_STORIES.map((story) => (
            <div key={story.dealer} className="card-dark rounded-2xl border border-white/10 p-6 md:p-8 flex flex-col">
              <p className="text-xs text-gold-400 font-semibold uppercase tracking-wide mb-3">{story.dealer}</p>
              <p className="text-3xl font-extrabold text-white leading-tight">
                {story.metric}
              </p>
              <p className="text-gray-500 text-sm mb-4">{story.period}</p>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">{story.detail}</p>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-2xl font-bold text-gold-400">{story.revenue}</p>
                <p className="text-xs text-gray-500">{story.revenueLabel}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Representative pilot results · Individual outcomes vary by call volume and store size
        </p>

        <div className="text-center mt-8">
          <Link href="/demo" className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium text-sm">
            Get results like these at your store <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
