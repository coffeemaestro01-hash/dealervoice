import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { publicDealerWhere } from "@/lib/dealer/status";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await prisma.dealership.findFirst({
    where: { slug, ...publicDealerWhere },
    select: { name: true },
  });
  if (!dealer) return {};
  return { title: `Write a Review - ${dealer.name}` };
}

/** SEO-friendly alias: /dealership/{slug}/write-review → /write-review/{id} */
export default async function DealershipWriteReviewAliasPage({ params }: Props) {
  const { slug } = await params;

  const dealer = await prisma.dealership.findFirst({
    where: { slug, ...publicDealerWhere },
    select: { id: true },
  });

  if (!dealer) notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/write-review/${dealer.id}`)}`);
  }

  redirect(`/write-review/${dealer.id}`);
}
