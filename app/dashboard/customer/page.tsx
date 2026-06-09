import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";

export const metadata: Metadata = {
  title: "My Dashboard | DealerVoice",
  description: "View your reviews, quotes, and saved dealers.",
};

export default async function CustomerDashboardPage() {
  const user = await requireAuth();

  const [reviews, leads, savedDealers] = await Promise.all([
    prisma.review.findMany({
      where: { authorId: user.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        overallRating: true,
        status: true,
        verificationStatus: true,
        createdAt: true,
        dealership: {
          select: { id: true, name: true, slug: true, cityName: true, logoUrl: true },
        },
      },
    }),
    prisma.lead.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        status: true,
        vehicle: true,
        createdAt: true,
        dealership: {
          select: { id: true, name: true, slug: true, cityName: true, logoUrl: true },
        },
      },
    }),
    prisma.savedDealer.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        dealership: {
          select: {
            id: true,
            name: true,
            slug: true,
            cityName: true,
            stateName: true,
            overallRating: true,
            totalReviews: true,
            logoUrl: true,
          },
        },
      },
    }),
  ]);

  return (
    <CustomerDashboard
      user={{ id: user.id, name: user.name ?? "User", email: user.email ?? "" }}
      reviews={reviews as any}
      leads={leads as any}
      savedDealers={savedDealers as any}
    />
  );
}
