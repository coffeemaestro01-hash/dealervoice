import Link from "next/link";
import Image from "next/image";
import { MapPin, MessageSquare, BadgeCheck } from "lucide-react";
import { StarRating } from "@/components/common/StarRating";
import { RatingBadge } from "@/components/common/RatingBadge";
import { cn, formatNumber, buildDealerUrl } from "@/lib/utils";
import type { DealershipWithRelations } from "@/types";

interface DealerCardProps {
  dealer: DealershipWithRelations;
  featured?: boolean;
  className?: string;
}

export function DealerCard({ dealer, featured, className }: DealerCardProps) {
  return (
    <Link
      href={buildDealerUrl(dealer.slug)}
      className={cn(
        "group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200",
        featured && "ring-2 ring-blue-500 ring-offset-1",
        className
      )}
    >
      <div className="p-5">
        <div className="flex gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
              {dealer.logoUrl ? (
                <Image src={dealer.logoUrl} alt={dealer.name} width={64} height={64} className="object-contain p-1" />
              ) : (
                <span className="text-2xl font-bold text-gray-300">{dealer.name[0]}</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                  {dealer.name}
                </h3>
                <div className="flex items-center gap-1 mt-0.5 text-gray-500 text-sm">
                  <MapPin size={12} />
                  <span className="truncate">
                    {[dealer.cityName, dealer.stateName, dealer.country?.name].filter(Boolean).join(", ")}
                  </span>
                </div>
              </div>
              <RatingBadge rating={dealer.overallRating} size="sm" />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={dealer.overallRating} size="sm" />
              <span className="text-xs text-gray-500">
                {formatNumber(dealer.totalReviews)} review{dealer.totalReviews !== 1 ? "s" : ""}
              </span>
              {dealer.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                  <BadgeCheck size={12} />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Brands */}
        {dealer.brands && dealer.brands.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {dealer.brands.slice(0, 5).map(({ brand }) => (
              <span key={brand.slug} className="text-xs px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-gray-600">
                {brand.name}
              </span>
            ))}
            {dealer.brands.length > 5 && (
              <span className="text-xs px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-gray-500">
                +{dealer.brands.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Response rate */}
        {dealer.responseRate > 0 && (
          <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
            <MessageSquare size={11} />
            <span>{Math.round(dealer.responseRate * 100)}% response rate</span>
          </div>
        )}
      </div>

      {/* Reputation bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Reputation Score</span>
          <span className="font-semibold text-gray-700">{dealer.reputationScore}/100</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              dealer.reputationScore >= 80 ? "bg-green-500" :
              dealer.reputationScore >= 60 ? "bg-lime-500" :
              dealer.reputationScore >= 40 ? "bg-yellow-500" :
              dealer.reputationScore >= 20 ? "bg-orange-500" : "bg-red-500"
            )}
            style={{ width: `${dealer.reputationScore}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
