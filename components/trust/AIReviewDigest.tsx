import { ThumbsUp, ThumbsDown, Tag, Sparkles, Hash } from "lucide-react";
import type { ReviewDigest } from "@/lib/ai/review-digest";

interface Props {
  digest: ReviewDigest;
  className?: string;
}

const SENTIMENT_CONFIG = {
  positive: { label: "Mostly Positive", classes: "bg-muted text-primary border-primary/20" },
  mixed: { label: "Mixed Reviews", classes: "bg-muted text-primary border-primary/20" },
  negative: { label: "Mostly Negative", classes: "bg-destructive/10 text-destructive border-primary/20" },
  neutral: { label: "Neutral", classes: "bg-muted text-muted-foreground border-border" },
};

export function AIReviewDigest({ digest, className }: Props) {
  const sentCfg = SENTIMENT_CONFIG[digest.sentiment];

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-primary">
          <Sparkles size={14} />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {digest.aiGenerated ? "AI Review Digest" : "Review Digest"}
          </span>
        </div>
        <span
          className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full border ${sentCfg.classes}`}
        >
          {sentCfg.label}
        </span>
      </div>

      <p className="text-sm text-foreground leading-relaxed mb-4">{digest.summary}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {digest.pros.length > 0 && (
          <div className="rounded-xl bg-muted border border-primary/20 p-3">
            <div className="flex items-center gap-1.5 text-primary mb-2">
              <ThumbsUp size={13} />
              <span className="text-xs font-semibold">Buyers praise</span>
            </div>
            <ul className="space-y-1">
              {digest.pros.map((p) => (
                <li key={p} className="text-xs text-primary">
                  · {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {digest.cons.length > 0 && (
          <div className="rounded-xl bg-destructive/10 border border-primary/20 p-3">
            <div className="flex items-center gap-1.5 text-destructive mb-2">
              <ThumbsDown size={13} />
              <span className="text-xs font-semibold">Common concerns</span>
            </div>
            <ul className="space-y-1">
              {digest.cons.map((c) => (
                <li key={c} className="text-xs text-destructive">
                  · {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {digest.themes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {digest.themes.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-0.5"
            >
              <Hash size={10} />
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
