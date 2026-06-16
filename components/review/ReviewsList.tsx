import prisma from "@/lib/db";
import Link from "next/link";
import { ReviewCard } from "./ReviewCard";

const LIMIT = 10;

async function getReviews(dealershipId: string, page: number) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { dealershipId, status: "PUBLISHED", deletedAt: null },
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, reputationScore: true, totalReviews: true } },
        response: { select: { id: true, body: true, createdAt: true, updatedAt: true, isResolved: true } },
        media: { select: { url: true, type: true, altText: true }, take: 5 },
      },
    }),
    prisma.review.count({ where: { dealershipId, status: "PUBLISHED", deletedAt: null } }),
  ]);
  return { reviews, total, totalPages: Math.ceil(total / LIMIT) };
}

interface Props {
  dealershipId: string;
  page: number;
}

export async function ReviewsList({ dealershipId, page }: Props) {
  const { reviews, total, totalPages } = await getReviews(dealershipId, page);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Reviews ({total})</h2>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center shadow-sm">
          <p className="text-foreground font-medium mb-1">No reviews yet</p>
          <p className="text-muted-foreground mb-5">Be the first to share your experience with this dealership.</p>
          <Link
            href={`/write-review/${dealershipId}`}
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-ember text-night-900 font-semibold hover:opacity-90 transition"
          >
            Write the first review
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review as any} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`?page=${page - 1}`} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`?page=${page + 1}`} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
