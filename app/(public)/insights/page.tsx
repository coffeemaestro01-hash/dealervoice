import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { BlogStripSection } from "@/components/home/BlogStripSection";
import { ResearchStripSection } from "@/components/home/ResearchStripSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights — Blog & Research | DealerVoice",
  description:
    "Editorial articles and research on car buying, dealer reputation, and the automotive retail industry from DealerVoice.",
};

export default function InsightsPage() {
  return (
    <>
      <section className="py-14 md:py-16 border-b border-border">
        <div className="container max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Insights</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Blog & research for buyers and dealers
          </h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Practical guides, industry analysis, and reputation insights — curated in one place.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm font-medium">
            <Link href="/blog" className="text-primary hover:underline inline-flex items-center gap-1">
              All blog posts <ArrowRight size={14} />
            </Link>
            <Link href="/research" className="text-primary hover:underline inline-flex items-center gap-1">
              All research <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Suspense>
        <BlogStripSection />
      </Suspense>
      <Suspense>
        <ResearchStripSection />
      </Suspense>
    </>
  );
}
