import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getResearchArticleBySlug } from "@/lib/research/queries";
import { getResearchArticleMeta } from "@/lib/research/article-meta";
import { ResearchHero } from "@/components/research/ResearchHero";
import { ResearchArticleBody } from "@/components/research/ResearchArticleBody";
import { StatCalloutGrid } from "@/components/research/StatCallout";
import { FeaturedDealerSpotlightGrid } from "@/components/research/FeaturedDealerSpotlight";
import { InterviewBlock } from "@/components/research/InterviewBlock";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getResearchArticleBySlug(slug);
  if (!post) return { title: "Research not found" };
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDesc ?? post.excerpt ?? undefined,
    openGraph: post.coverImage
      ? { images: [{ url: post.coverImage, alt: post.title }] }
      : undefined,
  };
}

export default async function ResearchArticlePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getResearchArticleBySlug(slug);
  if (!post) notFound();

  const meta = getResearchArticleMeta(slug);

  return (
    <article className="bg-night-900 text-white min-h-screen">
      <ResearchHero
        title={post.title}
        excerpt={post.excerpt}
        coverImage={post.coverImage}
        publishedAt={post.publishedAt}
        authorName={post.authorName}
        tags={post.tags}
      />

      <div className="container max-w-3xl py-12 md:py-16">
        <Link
          href="/research"
          className="inline-flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-300 mb-10"
        >
          <ArrowLeft size={14} /> All research
        </Link>

        {meta.stats && <StatCalloutGrid stats={meta.stats} />}
        {meta.spotlights && <FeaturedDealerSpotlightGrid dealers={meta.spotlights} />}

        <ResearchArticleBody content={post.content} />

        {meta.interviews && <InterviewBlock items={meta.interviews} />}
      </div>
    </article>
  );
}
