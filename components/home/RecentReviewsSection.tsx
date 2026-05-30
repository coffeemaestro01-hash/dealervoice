import prisma from "@/lib/db";
import { ReviewCard } from "@/components/review/ReviewCard";

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
  const reviews = await getRecentReviews();
  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Recent customer reviews</h2>
          <p className="text-gray-600 mt-2">Real experiences from verified car buyers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review as any} />
          ))}
        </div>
      </div>
    </section>
  );
}
