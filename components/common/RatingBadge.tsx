import { cn, ratingBadgeColor } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingBadge({ rating, size = "md", className }: RatingBadgeProps) {
  const sizeClasses = { sm: "text-sm px-2 py-0.5 min-w-[2rem]", md: "text-base px-2.5 py-1 min-w-[2.5rem]", lg: "text-lg px-3 py-1.5 min-w-[3rem]" };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-bold text-white tabular-nums",
        ratingBadgeColor(rating),
        sizeClasses[size],
        className
      )}
    >
      {rating.toFixed(1)}
    </span>
  );
}
