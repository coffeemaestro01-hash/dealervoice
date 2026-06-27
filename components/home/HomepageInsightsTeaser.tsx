import Link from "next/link";
import prisma from "@/lib/db";
import { RESEARCH_CATEGORY } from "@/lib/research/constants";
import { ArrowRight } from "lucide-react";

async function getLatest() {
  const [blog, research] = await Promise.all([
    prisma.blogPost.findFirst({
      where: { isPublished: true, category: { not: RESEARCH_CATEGORY } },
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true, excerpt: true },
    }),
    prisma.blogPost.findFirst({
      where: { isPublished: true, category: RESEARCH_CATEGORY },
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true, excerpt: true },
    }),
  ]);
  return { blog, research };
}

export async function HomepageInsightsTeaser() {
  let blog: Awaited<ReturnType<typeof getLatest>>["blog"] = null;
  let research: Awaited<ReturnType<typeof getLatest>>["research"] = null;
  try {
    ({ blog, research } = await getLatest());
  } catch {
    return null;
  }
  if (!blog && !research) return null;

  return (
    <section className="py-14 bg-background">
      <div className="container max-w-4xl">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Insights</p>
            <h2 className="font-display text-xl font-bold text-foreground">From the DealerVoice editorial desk</h2>
          </div>
          <Link href="/insights" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {blog ? (
            <Link href={`/blog/${blog.slug}`} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors group">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">Blog</span>
              <h3 className="font-semibold text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h3>
              {blog.excerpt ? <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{blog.excerpt}</p> : null}
            </Link>
          ) : null}
          {research ? (
            <Link href={`/research/${research.slug}`} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors group">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">Research</span>
              <h3 className="font-semibold text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-2">{research.title}</h3>
              {research.excerpt ? <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{research.excerpt}</p> : null}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
