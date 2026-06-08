import type { InterviewQA } from "@/lib/research/types";

export function InterviewBlock({ items }: { items: InterviewQA[] }) {
  if (items.length === 0) return null;

  return (
    <section className="my-12 space-y-6 not-prose" aria-labelledby="ceo-interview-heading">
      <h2 id="ceo-interview-heading" className="text-xl font-bold text-white">
        CEO interview
      </h2>
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="bg-gold-500/10 border-b border-gold-500/20 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-1">Question</p>
            <p className="text-white font-medium leading-relaxed">{item.question}</p>
          </div>
          <div className="px-6 py-5 bg-night-700/50">
            <p className="text-gray-200 leading-relaxed">{item.answer}</p>
            {(item.speaker || item.role) && (
              <p className="mt-4 text-sm text-gray-400">
                — {item.speaker}
                {item.role ? `, ${item.role}` : ""}
              </p>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
