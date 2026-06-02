import Link from "next/link";
import prisma from "@/lib/db";
import { DealerCard } from "@/components/dealership/DealerCard";

async function getFeaturedDealers() {
  return prisma.dealership.findMany({
    where: { isFeatured: true, status: "ACTIVE", deletedAt: null },
    take: 6,
    orderBy: { reputationScore: "desc" },
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: { include: { brand: { select: { name: true, slug: true, logoUrl: true } } }, take: 5 },
      subscription: { select: { plan: true } },
    },
  });
}

export async function FeaturedDealers() {
  let dealers: Awaited<ReturnType<typeof getFeaturedDealers>> = [];
  try { dealers = await getFeaturedDealers(); } catch { return null; }
  if (dealers.length === 0) return null;

  return (
    <section className="py-16 bg-night-soft border-y border-white/5">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Top-rated <span className="text-gold">dealers</span></h2>
            <p className="text-gray-400 mt-1">Dealerships with exceptional customer experiences</p>
          </div>
          <Link href="/dealers" className="text-sm font-medium text-gold-400 hover:text-gold-300 hidden sm:block">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dealers.map((dealer) => (
            <DealerCard key={dealer.id} dealer={dealer as any} featured={dealer.isFeatured} />
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/dealers" className="text-sm font-medium text-gold-400 hover:text-gold-300">
            View all dealerships →
          </Link>
        </div>
      </div>
    </section>
  );
}
