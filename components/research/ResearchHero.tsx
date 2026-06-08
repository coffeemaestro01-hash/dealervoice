import Image from "next/image";
import { Calendar, User } from "lucide-react";

type Props = {
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
  authorName: string;
  tags?: string[];
};

export function ResearchHero({ title, excerpt, coverImage, publishedAt, authorName, tags }: Props) {
  return (
    <header className="relative bg-night-900 text-white">
      <div className="relative h-[42vh] min-h-[280px] max-h-[520px] w-full">
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gold-900 via-night-800 to-night-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/70 to-night-900/30" />
      </div>
      <div className="container max-w-4xl relative -mt-32 pb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 bg-gold-500/15 border border-gold-500/30 px-3 py-1 rounded-full">
            Research
          </span>
          {tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">{title}</h1>
        {excerpt && <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl">{excerpt}</p>}
        <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <User size={14} className="text-gold-500" />
            {authorName}
          </span>
          {publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} className="text-gold-500" />
              {publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
