import Link from "next/link";
import Image from "next/image";
import { MapPin, MessageSquare, BadgeCheck, Megaphone, PenLine } from "lucide-react";
import { StarRating } from "@/components/common/StarRating";
import { RatingBadge } from "@/components/common/RatingBadge";
import { FeaturedPlanBadge } from "@/components/dealer/FeaturedPlanBadge";
import { getFeaturedBadgePlan } from "@/lib/dealer/featured-badge";
import { cn, formatNumber, buildDealerUrl } from "@/lib/utils";
import type { DealershipWithRelations } from "@/types";

interface DealerCardProps {
  dealer: DealershipWithRelations & {
    isSponsored?: boolean;
    isPremiumClaimed?: boolean;
    featuredBadgeEnabled?: boolean;
    claimedAt?: Date | string | null;
    status?: string;
    subscription?: { plan: string; status?: string } | null;
  };
  featured?: boolean;
  className?: string;
}

export function DealerCard({ dealer, featured, className }: DealerCardProps) {
  const badgePlan = getFeaturedBadgePlan(dealer);
  return (
    <Link
      href={buildDealerUrl(dealer as any)}
      className={cn(
        "group block bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200",
        featured && "ring-2 ring-primary ring-offset-1",
        className
      )}
    >
      <div className="p-5">
        <div className="flex gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center">
              {dealer.logoUrl ? (
                <Image src={dealer.logoUrl} alt={dealer.name} width={64} height={64} className="object-contain p-1" />
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">{dealer.name[0]}</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5 flex-wrap">
                  <span className="truncate">{dealer.name}</span>
                  {(dealer as { isSponsored?: boolean }).isSponsored && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 shrink-0">
                      <Megaphone size={9} aria-hidden />
                      Sponsored
                    </span>
                  )}
                  {badgePlan && <FeaturedPlanBadge plan={badgePlan} />}
                </h3>
                <div className="flex items-center gap-1 mt-0.5 text-muted-foreground text-sm">
                  <MapPin size={12} />
                  <span className="truncate">
                    {[dealer.cityName, dealer.stateName, dealer.country?.name].filter(Boolean).join(", ")}
                  </span>
                </div>
              </div>
              {dealer.totalReviews > 0 ? (
                <RatingBadge rating={dealer.overallRating} size="sm" />
              ) : (
                <span className="text-xs font-medium text-muted-foreground bg-muted border border-border rounded-lg px-2 py-0.5 shrink-0">
                  Not yet rated
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {dealer.totalReviews > 0 ? (
                <>
                  <StarRating rating={dealer.overallRating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(dealer.totalReviews)} review{dealer.totalReviews !== 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 border border-primary/30 rounded-full px-2 py-0.5">
                  <PenLine size={11} aria-hidden />
                  Be the first reviewer
                </span>
              )}
              {dealer.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <BadgeCheck size={12} />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Brands */}
        {dealer.brands && dealer.brands.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {dealer.brands.slice(0, 5).map(({ brand }) => (
              <span key={brand.slug} className="text-xs px-2 py-0.5 bg-muted border border-border rounded-full text-muted-foreground">
                {brand.name}
              </span>
            ))}
            {dealer.brands.length > 5 && (
              <span className="text-xs px-2 py-0.5 bg-muted border border-border rounded-full text-muted-foreground">
                +{dealer.brands.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Response rate */}
        {dealer.responseRate > 0 && (
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <MessageSquare size={11} />
            <span>{Math.round(dealer.responseRate * 100)}% response rate</span>
          </div>
        )}
      </div>

      {dealer.totalReviews > 0 && (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Reputation Score</span>
            <span className="font-semibold text-foreground">{dealer.reputationScore}/100</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                dealer.reputationScore >= 80 ? "bg-muted" :
                dealer.reputationScore >= 60 ? "bg-muted" :
                dealer.reputationScore >= 40 ? "bg-muted" :
                dealer.reputationScore >= 20 ? "bg-muted" : "bg-destructive/10"
              )}
              style={{ width: `${dealer.reputationScore}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
