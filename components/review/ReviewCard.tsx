"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Flag, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { StarRating } from "@/components/common/StarRating";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, timeAgo, truncate, getInitials } from "@/lib/utils";
import type { ReviewWithRelations } from "@/types";

const REVIEW_TYPE_LABELS: Record<string, string> = {
  NEW_CAR_PURCHASE: "New Car Purchase",
  USED_CAR_PURCHASE: "Used Car Purchase",
  VEHICLE_SERVICE: "Vehicle Service",
  PARTS_DEPARTMENT: "Parts",
  FINANCING: "Financing",
  WARRANTY_CLAIM: "Warranty",
  TRADE_IN: "Trade-In",
};

interface ReviewCardProps {
  review: ReviewWithRelations;
  showDealerResponse?: boolean;
  onHelpful?: (id: string, isHelpful: boolean) => void;
  onFlag?: (id: string) => void;
}

export function ReviewCard({ review, showDealerResponse = true, onHelpful, onFlag }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.body.length > 400;

  return (
    <article className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={review.author.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-gold-100 text-gold-700 font-semibold text-sm">
              {getInitials(review.author.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-gray-900">{review.author.name}</p>
            <p className="text-xs text-gray-500">
              {review.author.totalReviews} review{review.author.totalReviews !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StarRating rating={review.overallRating} size="sm" showValue />
          <VerificationBadge status={review.verificationStatus} />
        </div>
      </div>

      {/* Type & Date */}
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full">
          {REVIEW_TYPE_LABELS[review.reviewType] ?? review.reviewType}
        </span>
        {review.vehicleMake && (
          <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full">
            {[review.vehicleYear, review.vehicleMake, review.vehicleModel].filter(Boolean).join(" ")}
          </span>
        )}
        <span className="ml-auto">{timeAgo(review.createdAt)}</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mt-3">{review.title}</h3>

      {/* Body */}
      <p className="text-gray-700 text-sm leading-relaxed mt-2 whitespace-pre-line">
        {isLong && !expanded ? truncate(review.body, 400) : review.body}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-gold-600 text-sm mt-1 hover:underline"
        >
          {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read more</>}
        </button>
      )}

      {/* Sub-ratings */}
      {(review.ratingService || review.ratingPricing || review.ratingTransparency) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
          {[
            { label: "Transparency", value: review.ratingTransparency },
            { label: "Pricing", value: review.ratingPricing },
            { label: "Service", value: review.ratingService },
            { label: "Delivery", value: review.ratingDelivery },
            { label: "After-Sales", value: review.ratingAfterSales },
          ]
            .filter((r) => r.value)
            .map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{r.label}</span>
                <StarRating rating={r.value!} size="sm" />
              </div>
            ))}
        </div>
      )}

      {/* Would recommend */}
      {review.wouldRecommend !== null && review.wouldRecommend !== undefined && (
        <p className={cn("text-xs font-medium mt-3", review.wouldRecommend ? "text-green-600" : "text-red-600")}>
          {review.wouldRecommend ? "✓ Would recommend" : "✗ Would not recommend"}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
        <span className="text-xs text-gray-500">Helpful?</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-gray-600 hover:text-green-600"
          onClick={() => onHelpful?.(review.id, true)}
        >
          <ThumbsUp size={12} className="mr-1" />
          {review.helpfulCount > 0 ? review.helpfulCount : ""} Yes
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-gray-600 hover:text-red-600"
          onClick={() => onHelpful?.(review.id, false)}
        >
          <ThumbsDown size={12} className="mr-1" />
          No
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-gray-500 hover:text-red-500 ml-auto"
          onClick={() => onFlag?.(review.id)}
        >
          <Flag size={12} className="mr-1" />
          Report
        </Button>
      </div>

      {/* Dealer response */}
      {showDealerResponse && review.response && (
        <div className="mt-4 ml-4 pl-4 border-l-2 border-gold/30 bg-gold-50/50 rounded-r-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-gold-600" />
            <span className="text-xs font-semibold text-gold-700">Dealer Response</span>
            <span className="text-xs text-gray-500 ml-auto">{timeAgo(review.response.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{review.response.body}</p>
          {review.response.isResolved && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-2">
              ✓ Issue resolved
            </span>
          )}
        </div>
      )}
    </article>
  );
}
