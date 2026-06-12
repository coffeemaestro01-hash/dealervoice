import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Building2, MessageCircle } from "lucide-react";
import { WHATSAPP_BUSINESS } from "@/lib/constants/social";

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

  return (
    <div className="bg-white">
      <section className="border-b border-gray-100 bg-gradient-to-br from-night-900 via-night-800 to-night-900 text-white">
        <div className="container py-16 max-w-3xl">
          <p className="text-gold-400 text-sm font-semibold tracking-wide uppercase mb-3">Chicago · Illinois</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Find a dealer you can <span className="text-gold-400">trust</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            DealerVoice is built in Chicago. Compare local dealerships, read buyer reviews, and request quotes before you visit the lot.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dealers/us">
              <Button size="lg" className="bg-gold-gradient text-night-900 font-semibold border-0">
                Browse Illinois dealers
              </Button>
            </Link>
            <Link href="/claim">
              <Button size="lg" variant="outline" className="border-gold/40 text-white hover:bg-white/10">
                Claim your dealership
              </Button>
            </Link>
            <a href={WHATSAPP_BUSINESS.href} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-green-500/50 text-green-300 hover:bg-green-950/30 gap-2">
                <MessageCircle size={18} /> WhatsApp us
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="text-gold-600" size={24} /> Top Chicago-area dealers on DealerVoice
          </h2>
          {dealers.length === 0 ? (
            <p className="text-gray-500">Listings loading — browse all US dealers meanwhile.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dealers.map((d) => (
                <Link
                  key={d.slug}
                  href={`/dealership/${d.slug}`}
                  className="rounded-xl border border-gray-100 p-5 hover:border-gold/40 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{d.name}</h3>
                      <p className="text-sm text-gray-500">{d.cityName ?? "Illinois"}</p>
                    </div>
                    {d.totalReviews > 0 && (
                      <span className="text-sm font-bold text-gold-700 flex items-center gap-1">
                        <Star size={14} fill="currentColor" /> {d.overallRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{d.totalReviews} reviews</p>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-10 rounded-2xl border border-gold/30 bg-gold-50/50 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="text-gold-600" /> Are you a Chicago dealer?
              </h3>
              <p className="text-gray-600 mt-1 max-w-lg">
                Claim your free profile, respond to reviews, and join our pilot Pro program. We&apos;re onboarding Illinois dealers first.
              </p>
            </div>
            <Link href="/register-dealership">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white shrink-0">List your store</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
