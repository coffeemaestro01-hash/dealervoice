import Link from "next/link";
import prisma from "@/lib/db";
import { ReviewCard } from "@/components/review/ReviewCard";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

async function getRecentReviews() {
  return prisma.review.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, reputationScore: true, totalReviews: true } },
      response: { select: { id: true, body: true, createdAt: true, updatedAt: true, isResolved: true } },
      media: { select: { url: true, type: true, altText: true }, take: 3 },
    },
  });
}

export async function RecentReviewsSection() {
  let reviews: Awaited<ReturnType<typeof getRecentReviews>> = [];
  try {
    reviews = await getRecentReviews();
  } catch {
    return null;
  }

  return (
    <section className="py-16 bg-pearl border-y border-border">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Recent customer <span className="text-primary">reviews</span>
          </h2>
          <p className="text-muted-foreground mt-2">Real experiences from verified car buyers</p>
        </div>

        {reviews.length === 0 ? (
          <div className="max-w-lg mx-auto text-center rounded-2xl border border-border bg-background/50 p-10">
            <PenLine size={32} className="text-primary mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Reviews are open</h3>
            <p className="text-muted-foreground text-sm mb-6">
              We&apos;re building a community of verified buyer experiences. Be among the first to review a dealership
              in your city.
            </p>
            <Link href="/write-review">
              <Button className="bg-primary hover:bg-primary/90 text-foreground font-semibold">Write a review</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review as never} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
