import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { StarRating } from "@/components/common/StarRating";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { ReviewCard } from "@/components/review/ReviewCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  MessageSquare,
  ShieldCheck,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DealerHero } from "@/components/dealers/DealerHero";
import { DealerContactSidebar } from "@/components/dealers/DealerContactSidebar";
import { TeamSection } from "@/components/dealers/TeamSection";
import { LeadForm } from "@/components/dealers/LeadForm";

interface Props {
  params: Promise<{
    country: string;
    city: string;
    slug: string;
  }>;
}

async function getDealerData(slug: string) {
  const dealer = await prisma.dealership.findUnique({
    where: { slug },
    include: {
      country: true,
      city: true,
      brands: { include: { brand: true } },
      teamMembers: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              reputationScore: true,
              totalReviews: true,
            },
          },
          response: true,
          media: true,
        },
      },
      _count: {
        select: {
          reviews: { where: { status: "PUBLISHED" } },
        },
      },
    },
  });

  return dealer;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await getDealerData(slug);

  if (!dealer) return { title: "Dealer Not Found" };

  const cityName = dealer.cityName || dealer.city?.name;
  const countryName = dealer.country?.name;

  return {
    title: `${dealer.name} - ${cityName}, ${countryName} | DealerVoice`,
    description: dealer.description || `Read reviews and get quotes from ${dealer.name} in ${cityName}.`,
  };
}

export default async function DealerProfilePage({ params }: Props) {
  const { slug } = await params;
  const dealer = await getDealerData(slug);

  if (!dealer) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <DealerHero dealer={dealer} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About {dealer.name}</h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                {dealer.description ? (
                  <p className="whitespace-pre-line">{dealer.description}</p>
                ) : (
                  <p>Welcome to {dealer.name}. We are dedicated to providing the best automotive experience.</p>
                )}
              </div>

              {dealer.brands.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Authorized Brands</h3>
                  <div className="flex flex-wrap gap-2">
                    {dealer.brands.map((b) => (
                      <Badge key={b.brandId} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none px-3 py-1">
                        {b.brand.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Team Section */}
            <TeamSection members={dealer.teamMembers} dealerName={dealer.name} />

            {/* Reviews Section */}
            <section id="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Customer Reviews
                  <span className="ml-2 text-gray-400 font-normal">({dealer._count.reviews})</span>
                </h2>
                <Button asChild className="bg-gold-600 hover:bg-gold-700 text-white font-semibold">
                  <Link href={`/dealership/${dealer.slug}/write-review`}>Write a Review</Link>
                </Button>
              </div>

              <div className="space-y-4">
                {dealer.reviews.length > 0 ? (
                  dealer.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review as any} />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No reviews yet</h3>
                    <p className="text-gray-500 mt-1 mb-6">Be the first to share your experience with {dealer.name}.</p>
                    <Button asChild variant="outline" className="border-gold-600 text-gold-700 hover:bg-gold-50">
                      <Link href={`/dealership/${dealer.slug}/write-review`}>Write a Review</Link>
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LeadForm dealerId={dealer.id} dealerName={dealer.name} />
            <DealerContactSidebar dealer={dealer} />
          </div>
        </div>
      </div>
    </div>
  );
}
