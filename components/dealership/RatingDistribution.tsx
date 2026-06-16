import { Star } from "lucide-react";
import type { DealershipWithRelations } from "@/types";
import prisma from "@/lib/db";

async function getRatingDistribution(dealershipId: string) {
  const reviews = await prisma.review.groupBy({
    by: ["overallRating"],
    where: { dealershipId, status: "PUBLISHED", deletedAt: null },
    _count: true,
  });
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => { dist[r.overallRating] = r._count; });
  return dist;
}

interface Props {
  dealer: DealershipWithRelations;
}

export async function RatingDistribution({ dealer }: Props) {
  const dist = await getRatingDistribution(dealer.id);
  const total = dealer.totalReviews;

  const subRatings = [
    { label: "Transparency", value: dealer.ratingTransparency },
    { label: "Pricing Fairness", value: dealer.ratingPricing },
    { label: "Customer Service", value: dealer.ratingService },
    { label: "Delivery", value: dealer.ratingDelivery },
    { label: "After-Sales", value: dealer.ratingAfterSales },
  ].filter((r) => r.value > 0);

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h2 className="font-semibold text-foreground mb-5">Rating Breakdown</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Star distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = dist[star] ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-0.5 w-8 text-muted-foreground">
                  <Star size={12} className="star-filled fill-current" />
                  <span>{star}</span>
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/10 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-muted-foreground text-xs w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Sub-ratings */}
        {subRatings.length > 0 && (
          <div className="space-y-3">
            {subRatings.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-semibold text-foreground">{r.value.toFixed(1)}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(r.value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
