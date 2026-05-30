"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

const sizeMap = { sm: 12, md: 16, lg: 20, xl: 28 };

export function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const px = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        const filled = value <= rating;
        const partial = !filled && value - 1 < rating;
        const fillPercent = partial ? (rating - (value - 1)) * 100 : 0;

        return (
          <span
            key={i}
            className={cn("relative inline-block", interactive && "cursor-pointer hover:scale-110 transition-transform")}
            style={{ width: px, height: px }}
            onClick={() => interactive && onChange?.(value)}
            onMouseEnter={() => interactive && onChange?.(value)}
            role={interactive ? "button" : undefined}
            aria-label={interactive ? `Rate ${value} stars` : undefined}
          >
            {/* Empty star */}
            <Star
              size={px}
              className="absolute inset-0 star-empty fill-current"
              strokeWidth={0}
            />
            {/* Filled star */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: filled ? "100%" : `${fillPercent}%` }}
            >
              <Star size={px} className="star-filled fill-current" strokeWidth={0} />
            </span>
          </span>
        );
      })}
      {showValue && (
        <span className={cn("ml-1 font-semibold tabular-nums", size === "sm" ? "text-xs" : "text-sm")}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
