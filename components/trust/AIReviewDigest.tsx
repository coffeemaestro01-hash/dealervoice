import { ThumbsUp, ThumbsDown, Tag, Sparkles, Hash } from "lucide-react";
import type { ReviewDigest } from "@/lib/ai/review-digest";

interface Props {
  digest: ReviewDigest;
  className?: string;
}

const SENTIMENT_CONFIG = {
  positive: { label: "Mostly Positive", classes: "bg-green-50 text-green-700 border-green-200" },
  mixed: { label: "Mixed Reviews", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  negative: { label: "Mostly Negative", classes: "bg-red-50 text-red-700 border-red-200" },
  neutral: { label: "Neutral", classes: "bg-gray-50 text-gray-600 border-gray-200" },
};

export function AIReviewDigest({ digest, className }: Props) {
  const sentCfg = SENTIMENT_CONFIG[digest.sentiment];

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-gold-600">
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

      <p className="text-sm text-gray-700 leading-relaxed mb-4">{digest.summary}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {digest.pros.length > 0 && (
          <div className="rounded-xl bg-green-50 border border-green-100 p-3">
            <div className="flex items-center gap-1.5 text-green-700 mb-2">
              <ThumbsUp size={13} />
              <span className="text-xs font-semibold">Buyers praise</span>
            </div>
            <ul className="space-y-1">
              {digest.pros.map((p) => (
                <li key={p} className="text-xs text-green-800">
                  · {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {digest.cons.length > 0 && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3">
            <div className="flex items-center gap-1.5 text-red-600 mb-2">
              <ThumbsDown size={13} />
              <span className="text-xs font-semibold">Common concerns</span>
            </div>
            <ul className="space-y-1">
              {digest.cons.map((c) => (
                <li key={c} className="text-xs text-red-800">
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
              className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5"
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
