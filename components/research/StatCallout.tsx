import type { ResearchStat } from "@/lib/research/types";

export function StatCalloutGrid({ stats }: { stats: ResearchStat[] }) {
  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-10 not-prose">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-5 text-center"
        >
          <p className="text-2xl md:text-3xl font-extrabold text-primary">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
