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

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  iconColor?: string;
}

function StatCard({ label, value, change, icon: Icon, iconColor = "text-gold-700 bg-gold-50" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs mt-1.5 font-medium",
              change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500")}>
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
      subscription?: { plan: string } | null;
    };
    stats: { totalReviews: number; avgRating: number; reputationScore: number; responseRate: number; pendingResponses: number; reviewsThisMonth: number; reviewsLastMonth: number; ratingChange: number };
    recentReviews: ReviewWithRelations[];
  } | null;
}

export function DealerOverviewPage({ data }: Props) {
  if (!data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No dealership found</h2>
        <p className="text-gray-600 mb-4">You are not associated with any dealership yet.</p>
        <Link href="/dealers/claim" className="text-gold-700 hover:underline text-sm">Claim a dealership →</Link>
      </div>
    );
  }

  const { dealership, stats, recentReviews } = data;
  const reviewGrowth = stats.reviewsLastMonth > 0
    ? Math.round(((stats.reviewsThisMonth - stats.reviewsLastMonth) / stats.reviewsLastMonth) * 100)
    : 0;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{dealership.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StarRating rating={dealership.overallRating} size="sm" showValue />
            <span className="text-sm text-gray-500">Reputation: <strong className="text-gray-900">{dealership.reputationScore}/100</strong></span>
            {dealership.subscription && (
              <span className="text-xs px-2 py-0.5 bg-gold-50 text-gold-800 border border-gold-100 rounded-full font-medium">
                {dealership.subscription.plan}
              </span>
            )}
          </div>
        </div>

        <Button asChild variant="outline" className="border-gold-600 text-gold-700 hover:bg-gold-50 w-full md:w-auto">
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Reviews" value={stats.totalReviews} change={reviewGrowth} icon={Star} iconColor="text-amber-600 bg-amber-50" />
        <StatCard label="Average Rating" value={`${stats.avgRating.toFixed(1)}/5`} change={stats.ratingChange} icon={TrendingUp} iconColor="text-green-600 bg-green-50" />
        <StatCard label="Pending Responses" value={stats.pendingResponses} icon={MessageSquare} iconColor="text-red-600 bg-red-50" />
        <StatCard label="Response Rate" value={`${Math.round(stats.responseRate * 100)}%`} icon={Clock} iconColor="text-purple-600 bg-purple-50" />
      </div>

      {/* Alerts */}
      {stats.pendingResponses > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-900">
              {stats.pendingResponses} review{stats.pendingResponses > 1 ? "s" : ""} need{stats.pendingResponses === 1 ? "s" : ""} a response
            </p>
            <p className="text-sm text-amber-700 mt-0.5">Responding to reviews improves your reputation score.</p>
          </div>
          <Link href="/dashboard/dealer/reviews?filter=unresponded" className="text-sm font-medium text-amber-700 hover:underline whitespace-nowrap">
            Respond now →
          </Link>
        </div>
      )}

      {/* Recent reviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
          <Link href="/dashboard/dealer/reviews" className="text-sm text-gold-700 hover:underline">View all</Link>
        </div>
        <div className="space-y-4">
          {recentReviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center shadow-sm">
              <p className="text-gray-500">No reviews yet</p>
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
