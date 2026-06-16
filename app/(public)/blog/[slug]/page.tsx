import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db";
import { isResearchPost } from "@/lib/research/queries";
import { Calendar, ArrowLeft } from "lucide-react";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
    select: { title: true, metaTitle: true, metaDesc: true, excerpt: true },
  });
  if (!post) return { title: "Post not found" };
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDesc ?? post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
  });
  if (!post) notFound();
  if (isResearchPost(post.category)) redirect(`/research/${slug}`);

  return (
    <article className="bg-card">
      <div className="container max-w-3xl py-12 md:py-16">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft size={14} /> Back to blog
        </Link>
        {post.category && (
          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-4">
            {post.category}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">{post.title}</h1>
        <p className="text-sm text-muted-foreground mb-8 inline-flex items-center gap-2">
          <Calendar size={14} />
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""} · {post.authorName}
        </p>
        {post.excerpt && <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{post.excerpt}</p>}
        <AdSenseUnit slotKey="blogInArticle" format="fluid" layout="in-article" className="mb-8" />
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content.includes("<") ? post.content : post.content.replace(/\n/g, "<br />") }}
        />
      </div>
    </article>
  );
}
