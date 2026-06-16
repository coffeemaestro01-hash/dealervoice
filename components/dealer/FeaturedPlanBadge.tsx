import { BadgeCheck, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaidPlan } from "@/lib/dealer/featured-badge";
import { planDisplayName } from "@/lib/dealer/featured-badge";

const TIER_STYLES: Record<
  PaidPlan,
  { label: string; className: string; icon: typeof BadgeCheck }
> = {
  PRO: {
    label: "Featured Pro",
    className: "bg-[#F5F0E6] text-[#5C4A1E] border-[#C9961E]/40",
    icon: BadgeCheck,
  },
  PRO_PLUS: {
    label: "Featured Pro+",
    className: "bg-gradient-to-r from-[#FFF8EB] to-[#F5E6C8] text-[#3D2E0A] border-[#B8860B]/50 shadow-sm",
    icon: Sparkles,
  },
  ENTERPRISE: {
    label: "Featured Enterprise",
    className: "bg-gradient-to-r from-[#EDE4D3] to-[#D4C4A8] text-[#1A1408] border-[#8B6914]/50 shadow-sm",
    icon: Crown,
  },
};

interface Props {
  plan: PaidPlan;
  size?: "sm" | "md";
  className?: string;
}

export function FeaturedPlanBadge({ plan, size = "sm", className }: Props) {
  const tier = TIER_STYLES[plan];
  const Icon = tier.icon;
  const compact = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold border rounded-full shrink-0",
        compact ? "text-[10px] px-2 py-0.5 tracking-wide uppercase" : "text-xs px-2.5 py-1",
        tier.className,
        className
      )}
      title={`${planDisplayName(plan)} dealer on DealerVoice`}
    >
      <Icon size={compact ? 10 : 12} aria-hidden />
      {tier.label}
    </span>
  );
}
