import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import prisma from "@/lib/db";

async function getPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, excerpt: true, category: true, publishedAt: true },
    });
  } catch {
    return [];
  }
}

export async function BlogStripSection() {
  const posts = await getPosts();

  if (posts.length === 0) return null;

  return (
    <section className="py-14 bg-white border-t border-gray-100" aria-labelledby="blog-strip-heading">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="text-gold-600" size={22} />
            <h2 id="blog-strip-heading" className="font-display text-2xl font-bold text-gray-900">
              Guides for Indian car buyers
            </h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-gold-700 hover:underline flex items-center gap-1">
            All articles <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group rounded-2xl border border-gray-100 p-6 hover:border-gold-200 hover:shadow-md transition-all"
            >
              {p.category && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">{p.category}</span>
              )}
              <h3 className="font-semibold text-gray-900 mt-2 group-hover:text-gold-800 transition-colors line-clamp-2">
                {p.title}
              </h3>
              {p.excerpt && <p className="text-sm text-gray-600 mt-2 line-clamp-3">{p.excerpt}</p>}
              {p.publishedAt && (
                <time className="text-xs text-gray-400 mt-3 block" dateTime={p.publishedAt.toISOString()}>
                  {p.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </time>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
