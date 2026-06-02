import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { WriteReviewForm } from "@/components/review/WriteReviewForm";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ dealershipId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dealershipId } = await params;
  const dealer = await prisma.dealership.findUnique({ where: { id: dealershipId }, select: { name: true } });
  if (!dealer) return {};
  return { title: `Write a Review - ${dealer.name}` };
}

export default async function WriteReviewPage({ params }: Props) {
  const { dealershipId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?callbackUrl=/write-review/${dealershipId}`);

  const dealer = await prisma.dealership.findUnique({
    where: { id: dealershipId, status: "ACTIVE", deletedAt: null },
    select: { id: true, name: true, slug: true, logoUrl: true, cityName: true, stateName: true, country: { select: { name: true } } },
  });

  if (!dealer) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container max-w-2xl">
        <WriteReviewForm dealer={dealer} />
      </div>
    </div>
  );
}
