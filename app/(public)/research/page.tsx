import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Microscope } from "lucide-react";
import { getResearchArticles } from "@/lib/research/queries";

export const metadata: Metadata = {
  title: "Research — Dealership Trust, Reviews & Platform Insights",
  description:
    "Editorial research on dealership trust, premium dealer perspectives, and why outlet-level reviews matter in 2026.",
};

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const articles = await getResearchArticles();

  return (
    <div className="bg-night-900 text-white min-h-screen">
      <section className="border-b border-white/10 bg-gradient-to-b from-night-800 to-night-900">
        <div className="container py-16 md:py-20 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-gold-400 text-sm font-semibold uppercase tracking-widest mb-4">
            <Microscope size={16} />
            DealerVoice Research
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Trust infrastructure for <span className="text-gold-400">automotive retail</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Photo-rich editorial on dealership reputation worldwide — CEO interviews,
            premium dealer voices, and platform research you will not find in the blog.
          </p>
          {articles.length > 0 && (
            <p className="text-sm text-gray-500 mt-4">{articles.length} published studies</p>
          )}
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-5xl">
          {articles.length === 0 ? (
            <p className="text-gray-500 text-center">Research articles coming soon.</p>
          ) : (
            <div className="grid gap-8">
              {articles.map((article, i) => (
                <Link
                  key={article.slug}
                  href={`/research/${article.slug}`}
                  className="group grid md:grid-cols-5 gap-0 rounded-2xl border border-white/10 overflow-hidden bg-night-800/50 hover:border-gold-500/40 transition-all"
                >
                  <div className="relative md:col-span-2 h-52 md:h-auto min-h-[200px] bg-night-700">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 40vw"
                        priority={i < 2}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gold-900/30 to-night-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-night-900/80 hidden md:block" />
                  </div>
                  <div className="md:col-span-3 p-7 md:p-8 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold uppercase tracking-wider text-gold-400/90"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-gold-300 transition-colors mb-3 leading-snug">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">{article.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={12} />
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                        {article.authorName ? ` · ${article.authorName}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gold-400 font-semibold">
                        Read <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
