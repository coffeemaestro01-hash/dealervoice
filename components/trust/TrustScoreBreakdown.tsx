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
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gold-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right tabular-nums shrink-0">{pct}%</span>
    </div>
  );
}

export function TrustScoreBreakdown({ trust, className }: Props) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">Trust Score Breakdown</h3>
        <Link href="/methodology" className="text-xs text-gold-600 hover:text-gold-700 hover:underline">
          How it&apos;s calculated ↗
        </Link>
      </div>

      <div className="space-y-3">
        {FACTORS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-2.5">
            <Icon size={13} className="text-gold-500 shrink-0" />
            <span className="text-xs text-gray-600 w-28 shrink-0">{label}</span>
            <ProgressBar value={trust.breakdown[key]} />
          </div>
        ))}

        {trust.breakdown.claimBonus > 0 && (
          <div className="flex items-center gap-2.5 pt-1 border-t border-gray-100">
            <Award size={13} className="text-gold-500 shrink-0" />
            <span className="text-xs text-gray-600 w-28 shrink-0">Claimed Profile</span>
            <span className="text-xs font-semibold text-gold-600">
              +{trust.breakdown.claimBonus} bonus pts
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">Trust Score (0-100)</span>
        <span className="text-lg font-bold text-gray-900">{trust.score}</span>
      </div>
    </div>
  );
}
