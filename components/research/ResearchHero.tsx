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
    <header className="relative bg-pearl text-foreground">
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-background" />
      </div>
      <div className="container max-w-4xl relative -mt-32 pb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
            Research
          </span>
          {tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-card border border-border px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">{title}</h1>
        {excerpt && <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">{excerpt}</p>}
        <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <User size={14} className="text-primary" />
            {authorName}
          </span>
          {publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} className="text-primary" />
              {publishedAt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
