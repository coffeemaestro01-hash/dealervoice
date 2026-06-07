"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Globe, BadgeCheck, Share2, PenLine, Award, ExternalLink } from "lucide-react";
import { getPremiumInventoryUrl } from "@/lib/dealer/premium";
import { StarRating } from "@/components/common/StarRating";
import { RatingBadge } from "@/components/common/RatingBadge";
import { Button } from "@/components/ui/button";
import { cn, formatNumber, reputationColor, buildCountryUrl } from "@/lib/utils";
import type { DealershipWithRelations } from "@/types";

interface Props {
  dealer: DealershipWithRelations & {
    description?: string | null;
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    inventoryUrl?: string | null;
    isPremiumClaimed?: boolean;
    coverImageUrl?: string | null;
    awards?: Array<{ title: string; year: number }>;
    ratingDistribution?: Record<string, number>;
    subscription?: { plan: string } | null;
  };
  isPremium?: boolean;
}

export function DealershipProfile({ dealer, isPremium = false }: Props) {
  const inventoryUrl = isPremium ? getPremiumInventoryUrl(dealer) : null;
  const location = [dealer.cityName, dealer.stateName, dealer.country?.name].filter(Boolean).join(", ");

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Cover */}
      <div className="h-40 md:h-56 bg-gradient-to-br from-gold-900 to-gold-800 relative overflow-hidden">
        {dealer.coverImageUrl && (
          <Image src={dealer.coverImageUrl} alt={dealer.name} fill className="object-cover opacity-60" />
        )}
      </div>

      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 pb-6 relative">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            {dealer.logoUrl ? (
              <Image src={dealer.logoUrl} alt={dealer.name} width={80} height={80} className="object-contain p-1" />
            ) : (
              <span className="text-3xl font-bold text-gray-300">{dealer.name[0]}</span>
            )}
          </div>

          {/* Header info */}
          <div className="flex-1 sm:pt-12">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{dealer.name}</h1>
                  {dealer.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-gold-50 text-gold-800 border border-gold-100 rounded-full">
                      <BadgeCheck size={12} />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
                  <MapPin size={14} />
                  <Link href={buildCountryUrl(dealer.country.code)} className="hover:text-gold-700 hover:underline">
                    {location}
                  </Link>
                </div>
                {/* Brands */}
                {dealer.brands.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {dealer.brands.slice(0, 6).map(({ brand }) => (
                      <span key={brand.slug} className="text-xs px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-gray-600">
                        {brand.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <div className="flex items-center gap-2">
                  <RatingBadge rating={dealer.overallRating} size="lg" />
                  <div>
                    <StarRating rating={dealer.overallRating} size="md" />
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatNumber(dealer.totalReviews)} reviews
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:mt-2">
                  <Link href={`/write-review/${dealer.id}`}>
                    <Button size="sm" className="bg-gold-800 hover:bg-gold-800 gap-1.5">
                      <PenLine size={14} aria-hidden />
                      Write Review
                    </Button>
                  </Link>
                  {inventoryUrl && (
                    <a href={inventoryUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5 border-gold-300 text-gold-800 hover:bg-gold-50">
                        <ExternalLink size={14} aria-hidden />
                        Live Inventory
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Share2 size={14} aria-hidden />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics bar */}
        <div className="flex flex-wrap gap-4 pb-5 text-sm border-t border-gray-50 pt-4">
          <div>
            <span className="text-gray-500">Reputation</span>
            <span className={cn("ml-1.5 font-semibold", reputationColor(dealer.reputationScore))}>
              {dealer.reputationScore}/100
            </span>
          </div>
          {dealer.responseRate > 0 && (
            <div>
              <span className="text-gray-500">Response rate</span>
              <span className="ml-1.5 font-semibold text-gray-900">{Math.round(dealer.responseRate * 100)}%</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Verified</span>
            <span className="ml-1.5 font-semibold text-gray-900">{dealer.verifiedReviews} reviews</span>
          </div>
          {dealer.phone && (
            <a href={`tel:${dealer.phone}`} className="flex items-center gap-1 text-gray-600 hover:text-gold-700">
              <Phone size={13} />
              {dealer.phone}
            </a>
          )}
          {dealer.website && (
            <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gold-700 hover:underline">
              <Globe size={13} />
              Website
            </a>
          )}
        </div>

        {/* Awards */}
        {dealer.awards && dealer.awards.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-5">
            {dealer.awards.map((award, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-700 font-medium">
                <Award size={12} />
                {award.title} {award.year}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
