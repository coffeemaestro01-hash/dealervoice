import { cn } from "@/lib/utils";
import type { TrustScore, TrustColor } from "@/lib/trust/types";

interface Props {
  trust: TrustScore;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const COLOR_CLASSES: Record<TrustColor, { pill: string; dot: string }> = {
  gold: {
    pill: "ring-gold-400 bg-gold-50 text-gold-700",
    dot: "bg-gold-400",
  },
  green: {
    pill: "ring-green-400 bg-green-50 text-green-700",
    dot: "bg-green-400",
  },
  yellow: {
    pill: "ring-yellow-400 bg-yellow-50 text-yellow-700",
    dot: "bg-yellow-400",
  },
  red: {
    pill: "ring-red-400 bg-red-50 text-red-700",
    dot: "bg-red-400",
  },
  gray: {
    pill: "ring-gray-300 bg-gray-50 text-gray-500",
    dot: "bg-gray-400",
  },
};

const SIZE_CLASSES = {
  sm: { pill: "text-xs px-2 py-0.5 gap-1", dot: "w-1.5 h-1.5", score: "text-xs font-bold" },
  md: { pill: "text-sm px-3 py-1 gap-1.5", dot: "w-2 h-2", score: "text-sm font-bold" },
  lg: { pill: "text-base px-4 py-2 gap-2", dot: "w-2.5 h-2.5", score: "text-base font-bold" },
};

export function TrustScoreBadge({ trust, size = "md", className }: Props) {
  const c = COLOR_CLASSES[trust.color];
  const s = SIZE_CLASSES[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full ring-1 font-medium select-none",
        c.pill,
        s.pill,
        className
      )}
      title={`DealerVoice Trust Score: ${trust.score}/100 — ${trust.label}`}
    >
      <span className={cn("rounded-full shrink-0", c.dot, s.dot)} aria-hidden />
      <span className={s.score}>{trust.score}</span>
      <span className="opacity-70 font-normal">{trust.label}</span>
    </div>
  );
}
