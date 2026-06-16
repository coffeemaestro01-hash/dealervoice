"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Flag, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { StarRating } from "@/components/common/StarRating";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, timeAgo, truncate, getInitials } from "@/lib/utils";
import type { ReviewWithRelations } from "@/types";

const SENTIMENT_STYLES: Record<string, string> = {
  Positive: "bg-muted text-primary border-primary/20",
  Neutral: "bg-muted text-muted-foreground border-border",
  Negative: "bg-destructive/10 text-destructive border-primary/20",
};

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
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [voted, setVoted] = useState<boolean | null>(null);
  const isLong = review.body.length > 400;

  async function handleHelpful(isHelpful: boolean) {
    if (voted === isHelpful) return;
    const prev = helpfulCount;
    setVoted(isHelpful);
    setHelpfulCount((c) => isHelpful ? c + 1 : Math.max(0, c - (voted === true ? 1 : 0)));
    try {
      const res = await fetch(`/api/reviews/${review.id}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHelpful }),
      });
      if (res.ok) {
        const data = await res.json();
        setHelpfulCount(data.helpfulCount);
      } else {
        setVoted(null);
        setHelpfulCount(prev);
      }
    } catch {
      setVoted(null);
      setHelpfulCount(prev);
    }
    onHelpful?.(review.id, isHelpful);
  }

  return (
    <article className="bg-card rounded-xl border border-border p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={review.author.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {getInitials(review.author.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-foreground">{review.author.name}</p>
            <p className="text-xs text-muted-foreground">
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
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground flex-wrap">
        <span className="px-2 py-0.5 bg-muted border border-border rounded-full">
          {REVIEW_TYPE_LABELS[review.reviewType] ?? review.reviewType}
        </span>
        {review.vehicleMake && (
          <span className="px-2 py-0.5 bg-muted border border-border rounded-full">
            {[review.vehicleYear, review.vehicleMake, review.vehicleModel].filter(Boolean).join(" ")}
          </span>
        )}
        {review.sentimentLabel && (
          <span
            className={cn(
              "px-2 py-0.5 border rounded-full font-medium capitalize",
              SENTIMENT_STYLES[review.sentimentLabel] ?? "bg-muted text-muted-foreground border-border"
            )}
          >
            {review.sentimentLabel}
          </span>
        )}
        <span className="ml-auto">{timeAgo(review.createdAt)}</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mt-3">{review.title}</h3>

      {/* Body */}
      <p className="text-foreground text-sm leading-relaxed mt-2 whitespace-pre-line">
        {isLong && !expanded ? truncate(review.body, 400) : review.body}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-primary text-sm mt-1 hover:underline"
        >
          {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read more</>}
        </button>
      )}

      {/* Sub-ratings */}
      {(review.ratingService || review.ratingPricing || review.ratingTransparency) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 p-3 bg-muted rounded-lg">
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
                <span className="text-muted-foreground">{r.label}</span>
                <StarRating rating={r.value!} size="sm" />
              </div>
            ))}
        </div>
      )}

      {/* Would recommend */}
      {review.wouldRecommend !== null && review.wouldRecommend !== undefined && (
        <p className={cn("text-xs font-medium mt-3", review.wouldRecommend ? "text-primary" : "text-destructive")}>
          {review.wouldRecommend ? "✓ Would recommend" : "✗ Would not recommend"}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">Helpful?</span>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 px-2 text-xs", voted === true ? "text-primary" : "text-muted-foreground hover:text-primary")}
          onClick={() => handleHelpful(true)}
        >
          <ThumbsUp size={12} className="mr-1" />
          {helpfulCount > 0 ? helpfulCount : ""} Yes
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 px-2 text-xs", voted === false ? "text-destructive" : "text-muted-foreground hover:text-destructive")}
          onClick={() => handleHelpful(false)}
        >
          <ThumbsDown size={12} className="mr-1" />
          No
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive ml-auto"
          onClick={() => onFlag?.(review.id)}
        >
          <Flag size={12} className="mr-1" />
          Report
        </Button>
      </div>

      {/* Dealer response */}
      {showDealerResponse && review.response && (
        <div className="mt-4 ml-4 pl-4 border-l-2 border-primary/30 bg-primary/10 rounded-r-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-primary" />
            <span className="text-xs font-semibold text-primary">Dealer Response</span>
            <span className="text-xs text-muted-foreground ml-auto">{timeAgo(review.response.createdAt)}</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{review.response.body}</p>
          {review.response.isResolved && (
            <span className="inline-flex items-center gap-1 text-xs text-primary mt-2">
              ✓ Issue resolved
            </span>
          )}
        </div>
      )}
    </article>
  );
}
