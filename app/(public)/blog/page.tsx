import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { RESEARCH_CATEGORY } from "@/lib/research/constants";
import { Calendar, ArrowRight } from "lucide-react";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit";

export const metadata: Metadata = {
  title: "Blog — Car Buyer Guides, Dealer Insights & Research",
  description:
    "Global car buying guides, dealership trust research, and dealer reputation tips from DealerVoice — built in Chicago, available worldwide.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true, category: { not: RESEARCH_CATEGORY } },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: { slug: true, title: true, excerpt: true, publishedAt: true, category: true },
  });

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[];

  return (
    <div className="bg-card">
      <section className="border-b border-border bg-muted">
        <div className="container py-14 text-center max-w-2xl">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            The <span className="text-primary">DealerVoice</span> blog
          </h1>
          <p className="text-lg text-muted-foreground">
            Buyer guides, dealer reputation tips, and research on automotive trust — for dealerships and buyers worldwide.
          </p>
          {posts.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">{posts.length} published articles</p>
          )}
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-4xl mb-8">
          <AdSenseUnit slotKey="blogList" format="horizontal" className="mx-auto max-w-3xl" />
        </div>
        {categories.length > 0 && (
          <div className="container max-w-4xl mb-8 flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <span
                key={cat}
                className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-1"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
        <div className="container grid md:grid-cols-2 gap-6 max-w-4xl">
          {posts.length === 0 ? (
            <p className="text-muted-foreground col-span-2 text-center">New articles coming soon.</p>
          ) : (
            posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-2xl border border-border p-7 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                {p.category && (
                  <span className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-4">
                    {p.category}
                  </span>
                )}
                <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                  {p.title}
                </h2>
                {p.excerpt && <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.excerpt}</p>}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ""}
                  </span>
                  <span className="inline-flex items-center gap-1 text-primary font-medium">
                    Read <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
