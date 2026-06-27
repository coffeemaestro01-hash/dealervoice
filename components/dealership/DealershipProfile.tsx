"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Globe, BadgeCheck, Share2, PenLine, Award, ExternalLink } from "lucide-react";
import { getPremiumInventoryUrl } from "@/lib/dealer/premium";
import { getFeaturedBadgePlan } from "@/lib/dealer/featured-badge";
import { FeaturedPlanBadge } from "@/components/dealer/FeaturedPlanBadge";
import { StarRating } from "@/components/common/StarRating";
import { RatingBadge } from "@/components/common/RatingBadge";
import { Button } from "@/components/ui/button";
import { cn, formatNumber, reputationColor, buildCountryUrl } from "@/lib/utils";
import type { DealershipWithRelations } from "@/types";
import { SaveButton } from "@/components/dealership/SaveButton";

interface Props {
  dealer: DealershipWithRelations & {
    description?: string | null;
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    inventoryUrl?: string | null;
    isPremiumClaimed?: boolean;
    featuredBadgeEnabled?: boolean;
    claimedAt?: Date | string | null;
    status?: string;
    coverImageUrl?: string | null;
    awards?: Array<{ title: string; year: number }>;
    ratingDistribution?: Record<string, number>;
    subscription?: { plan: string; status?: string } | null;
    serviceAreas?: Array<{ cityName: string; stateName: string | null }>;
  };
  isPremium?: boolean;
  highlightWrite?: boolean;
}

export function DealershipProfile({ dealer, isPremium = false, highlightWrite = false }: Props) {
  const inventoryUrl = isPremium ? getPremiumInventoryUrl(dealer) : null;
  const location = [dealer.cityName, dealer.stateName, dealer.country?.name].filter(Boolean).join(", ");
  const badgePlan = getFeaturedBadgePlan(dealer);

  return (
    <div className="bg-card border-b border-border">
      {/* Cover */}
      <div className="h-40 md:h-56 bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
        {dealer.coverImageUrl && (
          <Image src={dealer.coverImageUrl} alt={dealer.name} fill className="object-cover opacity-60" />
        )}
      </div>

      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 pb-6 relative">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            {dealer.logoUrl ? (
              <Image src={dealer.logoUrl} alt={dealer.name} width={80} height={80} className="object-contain p-1" />
            ) : (
              <span className="text-3xl font-bold text-muted-foreground">{dealer.name[0]}</span>
            )}
          </div>

          {/* Header info */}
          <div className="flex-1 sm:pt-12">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{dealer.name}</h1>
                  {dealer.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded-full">
                      <BadgeCheck size={12} />
                      Verified
                    </span>
                  )}
                  {badgePlan && <FeaturedPlanBadge plan={badgePlan} size="md" />}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
                  <MapPin size={14} />
                  <Link href={buildCountryUrl(dealer.country.code)} className="hover:text-primary hover:underline">
                    {location}
                  </Link>
                </div>
                {dealer.serviceAreas && dealer.serviceAreas.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Also serves:{" "}
                    {dealer.serviceAreas
                      .map((a) => (a.stateName ? `${a.cityName}, ${a.stateName}` : a.cityName))
                      .join(" · ")}
                  </p>
                )}
                {/* Brands */}
                {dealer.brands.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {dealer.brands.slice(0, 6).map(({ brand }) => (
                      <span key={brand.slug} className="text-xs px-2 py-0.5 bg-muted border border-border rounded-full text-muted-foreground">
                        {brand.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <div className="flex items-center gap-2">
                  {dealer.totalReviews > 0 ? (
                    <>
                      <RatingBadge rating={dealer.overallRating} size="lg" />
                      <div>
                        <StarRating rating={dealer.overallRating} size="md" />
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatNumber(dealer.totalReviews)} reviews
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">Not yet rated</p>
                      <p className="text-xs text-muted-foreground mt-0.5">No reviews yet</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 sm:mt-2">
                  <Link href={`/write-review/${dealer.id}`}>
                    <Button
                      size="sm"
                      className={cn(
                        "gap-1.5 font-semibold",
                        highlightWrite
                          ? "bg-primary hover:bg-primary/90 text-foreground ring-2 ring-primary ring-offset-1"
                          : "bg-primary hover:bg-primary/90 text-foreground"
                      )}
                    >
                      <PenLine size={14} aria-hidden />
                      Write Review
                    </Button>
                  </Link>
                  {inventoryUrl && (
                    <a href={inventoryUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                        <ExternalLink size={14} aria-hidden />
                        Live Inventory
                      </Button>
                    </a>
                  )}
                  <SaveButton dealershipId={dealer.id} />
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
        <div className="flex flex-wrap gap-4 pb-5 text-sm border-t border-border pt-4">
          <div>
            <span className="text-muted-foreground">Reputation</span>
            {dealer.totalReviews > 0 ? (
              <span className={cn("ml-1.5 font-semibold", reputationColor(dealer.reputationScore))}>
                {dealer.reputationScore}/100
              </span>
            ) : (
              <span className="ml-1.5 font-semibold text-muted-foreground">Not yet rated</span>
            )}
          </div>
          {dealer.responseRate > 0 && (
            <div>
              <span className="text-muted-foreground">Response rate</span>
              <span className="ml-1.5 font-semibold text-foreground">{Math.round(dealer.responseRate * 100)}%</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Verified</span>
            <span className="ml-1.5 font-semibold text-foreground">{dealer.verifiedReviews} reviews</span>
          </div>
          {dealer.phone && (
            <a href={`tel:${dealer.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary">
              <Phone size={13} />
              {dealer.phone}
            </a>
          )}
          {dealer.website && (
            <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
              <Globe size={13} />
              Website
            </a>
          )}
        </div>

        {/* Awards */}
        {dealer.awards && dealer.awards.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-5">
            {dealer.awards.map((award, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium">
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
