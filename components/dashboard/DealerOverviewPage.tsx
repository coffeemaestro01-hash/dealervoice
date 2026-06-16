"use client";

import Link from "next/link";
import { MessageSquare, Star, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Minus, ExternalLink } from "lucide-react";
import { StarRating } from "@/components/common/StarRating";
import { ReviewCard } from "@/components/review/ReviewCard";
import { Button } from "@/components/ui/button";
import { cn, buildDealerUrl } from "@/lib/utils";
import type { ReviewWithRelations } from "@/types";
import { PremiumUpgradeBanner } from "@/components/dashboard/PremiumUpgradeBanner";
import { DealerReviewInvite } from "@/components/dashboard/DealerReviewInvite";
import { DealerFeaturedBadgeEmbed } from "@/components/dashboard/DealerFeaturedBadgeEmbed";
import { getFeaturedBadgePlan } from "@/lib/dealer/featured-badge";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  iconColor?: string;
}

function StatCard({ label, value, change, icon: Icon, iconColor = "text-primary bg-primary/10" }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs mt-1.5 font-medium",
              change > 0 ? "text-primary" : change < 0 ? "text-destructive" : "text-muted-foreground")}>
              {change > 0 ? <ArrowUpRight size={13} /> : change < 0 ? <ArrowDownRight size={13} /> : <Minus size={13} />}
              {Math.abs(change)}% vs last month
            </div>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl", iconColor)}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

interface Props {
  data: {
    dealership: {
      id: string;
      name: string;
      slug: string;
      overallRating: number;
      reputationScore: number;
      responseRate: number;
      isPremiumClaimed?: boolean;
      featuredBadgeEnabled?: boolean;
      claimedAt?: Date | string | null;
      status?: string;
      subscription?: { plan: string; status?: string } | null;
    };
    stats: { totalReviews: number; avgRating: number; reputationScore: number; responseRate: number; pendingResponses: number; reviewsThisMonth: number; reviewsLastMonth: number; ratingChange: number };
    recentReviews: ReviewWithRelations[];
  } | null;
}

export function DealerOverviewPage({ data }: Props) {
  if (!data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">No dealership found</h2>
        <p className="text-muted-foreground mb-4">You are not associated with any dealership yet.</p>
        <Link href="/dealers/claim" className="text-primary hover:underline text-sm">Claim a dealership →</Link>
      </div>
    );
  }

  const { dealership, stats, recentReviews } = data;
  const badgePlan = getFeaturedBadgePlan(dealership);
  const reviewGrowth = stats.reviewsLastMonth > 0
    ? Math.round(((stats.reviewsThisMonth - stats.reviewsLastMonth) / stats.reviewsLastMonth) * 100)
    : 0;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{dealership.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StarRating rating={dealership.overallRating} size="sm" showValue />
            <span className="text-sm text-muted-foreground">Reputation: <strong className="text-foreground">{dealership.reputationScore}/100</strong></span>
            {dealership.subscription && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded-full font-medium">
                {dealership.subscription.plan}
              </span>
            )}
          </div>
        </div>

        <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 w-full md:w-auto">
          <Link href={buildDealerUrl(dealership as any)} target="_blank">
            <ExternalLink size={16} className="mr-2" /> View Public Profile
          </Link>
        </Button>
      </div>

      <PremiumUpgradeBanner
        dealershipId={dealership.id}
        dealerName={dealership.name}
        isPremiumClaimed={dealership.isPremiumClaimed}
        subscription={dealership.subscription}
      />

      <DealerReviewInvite slug={dealership.slug} dealerName={dealership.name} />

      {badgePlan && (
        <DealerFeaturedBadgeEmbed slug={dealership.slug} dealerName={dealership.name} plan={badgePlan} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Reviews" value={stats.totalReviews} change={reviewGrowth} icon={Star} iconColor="text-primary bg-primary/10" />
        <StatCard label="Average Rating" value={`${stats.avgRating.toFixed(1)}/5`} change={stats.ratingChange} icon={TrendingUp} iconColor="text-primary bg-muted" />
        <StatCard label="Pending Responses" value={stats.pendingResponses} icon={MessageSquare} iconColor="text-destructive bg-destructive/10" />
        <StatCard label="Response Rate" value={`${Math.round(stats.responseRate * 100)}%`} icon={Clock} iconColor="text-muted-foreground bg-muted" />
      </div>

      {/* Alerts */}
      {stats.pendingResponses > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-primary">
              {stats.pendingResponses} review{stats.pendingResponses > 1 ? "s" : ""} need{stats.pendingResponses === 1 ? "s" : ""} a response
            </p>
            <p className="text-sm text-primary mt-0.5">Responding to reviews improves your reputation score.</p>
          </div>
          <Link href="/dashboard/dealer/reviews?filter=unresponded" className="text-sm font-medium text-primary hover:underline whitespace-nowrap">
            Respond now →
          </Link>
        </div>
      )}

      {/* Recent reviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Reviews</h2>
          <Link href="/dashboard/dealer/reviews" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="space-y-4">
          {recentReviews.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-10 text-center shadow-sm">
              <p className="text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            recentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
