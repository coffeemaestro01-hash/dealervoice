import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { publicDealerWhere } from "@/lib/dealer/status";
import { dealerReviewInviteUrl, reviewInviteQrApiUrl } from "@/lib/reviews/invite";
import { PrintButton } from "@/components/review/PrintButton";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const dealer = await prisma.dealership.findFirst({
    where: { slug, ...publicDealerWhere },
    select: { name: true },
  });
  return {
    title: dealer ? `Review ${dealer.name}` : "Review invite",
    robots: { index: false, follow: false },
  };
}

export default async function ReviewInvitePrintPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const dealer = await prisma.dealership.findFirst({
    where: { slug, ...publicDealerWhere },
    select: { name: true, slug: true, cityName: true, stateName: true },
  });
  if (!dealer) notFound();

  const inviteUrl = dealerReviewInviteUrl(dealer.slug);
  const qrSrc = reviewInviteQrApiUrl(dealer.slug);
  const location = [dealer.cityName, dealer.stateName].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-background print:bg-background">
      <div className="container max-w-lg py-10 print:py-6">
        <div className="rounded-2xl border border-border bg-card shadow-soft p-8 print:shadow-none print:border-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">DealerVoice</p>
          <h1 className="font-display text-2xl font-light text-foreground mb-1">{dealer.name}</h1>
          {location ? <p className="text-sm text-muted-foreground mb-6">{location}</p> : <div className="mb-6" />}

          <div className="inline-block bg-background border border-border rounded-xl p-4 mb-4">
            <Image src={qrSrc} alt="Scan to leave a review" width={220} height={220} unoptimized priority />
          </div>

          <p className="text-lg font-medium text-foreground mb-2">How was your experience?</p>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
            Scan the code or visit the link below. Takes about 2 minutes. Your review helps other car buyers.
          </p>

          <p className="text-xs text-primary break-all font-mono bg-muted rounded-lg px-3 py-2">{inviteUrl}</p>
        </div>

        <div className="mt-6 flex justify-center gap-4 print:hidden">
          <PrintButton />
          <Link href={`/dealership/${dealer.slug}`} className="text-sm text-primary hover:underline py-2.5">
            View profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
