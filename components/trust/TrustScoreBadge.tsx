import { cn } from "@/lib/utils";
import type { TrustScore, TrustColor } from "@/lib/trust/types";

interface Props {
  trust: TrustScore;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const COLOR_CLASSES: Record<TrustColor, { pill: string; dot: string }> = {
  gold: {
    pill: "ring-primary bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  green: {
    pill: "ring-primary bg-muted text-primary",
    dot: "bg-muted",
  },
  yellow: {
    pill: "ring-primary bg-muted text-primary",
    dot: "bg-muted",
  },
  red: {
    pill: "ring-destructive bg-destructive/10 text-destructive",
    dot: "bg-destructive/10",
  },
  gray: {
    pill: "ring-border bg-muted text-muted-foreground",
    dot: "bg-muted",
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
