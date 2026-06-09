import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Microscope } from "lucide-react";
import { getResearchArticles } from "@/lib/research/queries";

export async function ResearchStripSection() {
  const articles = await getResearchArticles(3);
  if (articles.length === 0) return null;

  return (
    <section className="py-14 bg-night-900 border-t border-white/10" aria-labelledby="research-strip-heading">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Microscope className="text-gold-500" size={22} />
            <h2 id="research-strip-heading" className="font-display text-2xl font-bold text-white">
              DealerVoice research
            </h2>
          </div>
          <Link href="/research" className="text-sm font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1">
            All research <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/research/${a.slug}`}
              className="group rounded-2xl border border-white/10 overflow-hidden bg-night-800/50 hover:border-gold-500/40 transition-all"
            >
              <div className="relative h-36 bg-night-700">
                {a.coverImage ? (
                  <Image
                    src={a.coverImage}
                    alt=""
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gold-900/30 to-night-800" />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-white group-hover:text-gold-300 transition-colors line-clamp-2">
                  {a.title}
                </h3>
                {a.excerpt && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{a.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
