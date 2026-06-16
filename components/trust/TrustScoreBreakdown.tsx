import Link from "next/link";
import { Star, ShieldCheck, MessageSquare, CheckCircle2, Clock, Award } from "lucide-react";
import type { TrustScore } from "@/lib/trust/types";

interface Props {
  trust: TrustScore;
  className?: string;
}

const FACTORS = [
  { key: "avgRating" as const, label: "Rating Quality", icon: Star },
  { key: "verifiedPercent" as const, label: "Verified Reviews", icon: ShieldCheck },
  { key: "responseRate" as const, label: "Response Rate", icon: MessageSquare },
  { key: "resolutionRate" as const, label: "Resolution Rate", icon: CheckCircle2 },
  { key: "freshness" as const, label: "Review Freshness", icon: Clock },
];

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right tabular-nums shrink-0">{pct}%</span>
    </div>
  );
}

export function TrustScoreBreakdown({ trust, className }: Props) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground text-sm">Trust Score Breakdown</h3>
        <Link href="/methodology" className="text-xs text-primary hover:text-primary hover:underline">
          How it&apos;s calculated ↗
        </Link>
      </div>

      <div className="space-y-3">
        {FACTORS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-2.5">
            <Icon size={13} className="text-primary shrink-0" />
            <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
            <ProgressBar value={trust.breakdown[key]} />
          </div>
        ))}

        {trust.breakdown.claimBonus > 0 && (
          <div className="flex items-center gap-2.5 pt-1 border-t border-border">
            <Award size={13} className="text-primary shrink-0" />
            <span className="text-xs text-muted-foreground w-28 shrink-0">Claimed Profile</span>
            <span className="text-xs font-semibold text-primary">
              +{trust.breakdown.claimBonus} bonus pts
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Trust Score (0-100)</span>
        <span className="text-lg font-bold text-foreground">{trust.score}</span>
      </div>
    </div>
  );
}
