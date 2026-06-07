import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { Calendar, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Car buying tips, dealership insights, and DealerVoice product news.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: { slug: true, title: true, excerpt: true, publishedAt: true, category: true },
  });

  return (
    <div className="bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container py-14 text-center max-w-2xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            The <span className="text-gold">DealerVoice</span> blog
          </h1>
          <p className="text-lg text-gray-600">Car-buying tips, dealership insights, and product updates.</p>
        </div>
      </section>

      <section className="py-14">
        <div className="container grid md:grid-cols-2 gap-6 max-w-4xl">
          {posts.length === 0 ? (
            <p className="text-gray-500 col-span-2 text-center">New articles coming soon.</p>
          ) : (
            posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md hover:border-gold/40 transition-all"
              >
                {p.category && (
                  <span className="inline-block text-xs font-semibold text-gold-700 bg-gold-50 rounded-full px-3 py-1 mb-4">
                    {p.category}
                  </span>
                )}
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-gold-700 transition-colors mb-2">
                  {p.title}
                </h2>
                {p.excerpt && <p className="text-sm text-gray-600 leading-relaxed mb-4">{p.excerpt}</p>}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ""}
                  </span>
                  <span className="inline-flex items-center gap-1 text-gold-700 font-medium">
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
