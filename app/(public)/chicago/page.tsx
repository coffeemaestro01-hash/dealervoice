import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Building2, MessageCircle, Trophy } from "lucide-react";
import { WHATSAPP_BUSINESS } from "@/lib/constants/social";
import {
  CHICAGO_JACKPOT,
  CHICAGOLAND_DEALERSHIP_PROMOTION_NAME,
  getChicagoJackpotAdminSummary,
} from "@/lib/promotions/chicago-jackpot";

export const metadata: Metadata = {
  title: "Chicago Car Dealers — Reviews & Ratings",
  description:
    "Compare Chicago and Illinois car dealerships on DealerVoice. Read buyer reviews, request quotes, and find transparent dealers near you.",
};

export const dynamic = "force-dynamic";

async function getChicagoDealers() {
  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) return [];

  return prisma.dealership.findMany({
    where: {
      countryId: us.id,
      deletedAt: null,
      OR: [
        { cityName: { contains: "Chicago", mode: "insensitive" } },
        { stateName: { contains: "Illinois", mode: "insensitive" } },
      ],
    },
    orderBy: [{ totalReviews: "desc" }, { overallRating: "desc" }],
    take: 12,
    select: {
      name: true,
      slug: true,
      cityName: true,
      overallRating: true,
      totalReviews: true,
    },
  });
}

export default async function ChicagoPage() {
  const dealers = await getChicagoDealers();
  let slotsRemaining: number = CHICAGO_JACKPOT.MAX_WINNERS;
  try {
    const jackpot = await getChicagoJackpotAdminSummary();
    slotsRemaining = jackpot.slotsRemaining;
  } catch {
    /* default */
  }

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-gradient-to-br from-background via-muted/40 to-background">
        <div className="container py-16 max-w-3xl">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase mb-3">Chicago · Illinois</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Find a dealer you can <span className="text-primary">trust</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            DealerVoice is built in Chicago. Compare local dealerships, read buyer reviews, and request quotes before you visit the lot.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dealers/us">
              <Button size="lg" className="bg-ember text-night-900 font-semibold border-0">
                Browse Illinois dealers
              </Button>
            </Link>
            <Link href="/claim">
              <Button size="lg" variant="outline" className="border-primary/30">
                Claim your dealership
              </Button>
            </Link>
            <Link href="/promotions">
              <Button size="lg" className="font-semibold gap-2">
                <Trophy size={18} />
                Dealer promotions
              </Button>
            </Link>
            <a href={WHATSAPP_BUSINESS.href} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-muted/30 gap-2">
                <MessageCircle size={18} /> WhatsApp us
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MapPin className="text-primary" size={24} /> Top Chicago-area dealers on DealerVoice
          </h2>
          {dealers.length === 0 ? (
            <p className="text-muted-foreground">Listings loading — browse all US dealers meanwhile.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dealers.map((d) => (
                <Link
                  key={d.slug}
                  href={`/dealership/${d.slug}`}
                  className="rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{d.name}</h3>
                      <p className="text-sm text-muted-foreground">{d.cityName ?? "Illinois"}</p>
                    </div>
                    {d.totalReviews > 0 && (
                      <span className="text-sm font-bold text-primary flex items-center gap-1">
                        <Star size={14} fill="currentColor" /> {d.overallRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{d.totalReviews} reviews</p>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="text-primary" size={22} />
                {CHICAGOLAND_DEALERSHIP_PROMOTION_NAME}
              </h3>
              <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">
                Claim your listing, collect {CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS} verified buyer reviews, and join the
                first {CHICAGO_JACKPOT.MAX_WINNERS} qualified Chicagoland dealerships to earn{" "}
                {CHICAGO_JACKPOT.ENTERPRISE_FREE_YEARS} years of Enterprise access.{" "}
                <strong className="text-foreground">{slotsRemaining} slots left.</strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link href="/promotions">
                <Button className="shrink-0 gap-2">
                  Full details <Building2 size={16} />
                </Button>
              </Link>
              <Link href="/claim">
                <Button variant="outline" className="border-primary/30 shrink-0">Claim &amp; enter</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
