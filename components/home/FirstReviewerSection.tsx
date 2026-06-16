import Link from "next/link";
import prisma from "@/lib/db";
import { PenLine } from "lucide-react";
import { DealerCard } from "@/components/dealership/DealerCard";
import { publicDealerWhere } from "@/lib/dealer/status";

async function getNeedsReviewDealers() {
  return prisma.dealership.findMany({
    where: { ...publicDealerWhere, totalReviews: 0 },
    take: 6,
    orderBy: [{ isFeatured: "desc" }, { reputationScore: "desc" }, { createdAt: "desc" }],
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: {
        include: { brand: { select: { name: true, slug: true, logoUrl: true } } },
        take: 5,
      },
      subscription: { select: { plan: true } },
    },
  });
}

export async function FirstReviewerSection() {
  let dealers: Awaited<ReturnType<typeof getNeedsReviewDealers>> = [];
  try {
    dealers = await getNeedsReviewDealers();
  } catch {
    return null;
  }
  if (dealers.length === 0) return null;

  return (
    <section className="py-14 md:py-16 bg-background border-y border-border">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-2">
              <PenLine size={16} aria-hidden />
              Help build trust
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Be the <span className="text-primary">first reviewer</span>
            </h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-xl">
              These dealerships don&apos;t have reviews yet. Share your experience and help the next car buyer decide.
            </p>
          </div>
          <Link href="/dealers?sort=needs_review" className="text-sm font-semibold text-primary hover:text-primary shrink-0">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {dealers.map((dealer) => (
            <DealerCard key={dealer.id} dealer={dealer as never} />
          ))}
        </div>
      </div>
    </section>
  );
}
