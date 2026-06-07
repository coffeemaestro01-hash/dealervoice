"use client";

import Link from "next/link";
import { MapPin, Phone, Globe, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import type { DealershipWithRelations } from "@/types";
import { AutomotiveAdBanner } from "@/components/ads/AutomotiveAdBanner";
import { getPremiumInventoryUrl } from "@/lib/dealer/premium";

const DealerMap = dynamic(
  () => import("@/components/map/DealerMap").then((m) => m.DealerMap),
  { ssr: false, loading: () => <div className="h-48 bg-gray-100 rounded-xl animate-pulse" /> }
);

interface Props {
  dealer: DealershipWithRelations & {
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    email?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
    description?: string | null;
    yearEstablished?: number | null;
    claimedAt?: Date | string | null;
    isPremiumClaimed?: boolean;
    inventoryUrl?: string | null;
    id: string;
    slug: string;
    subscription?: { plan: string } | null;
  };
  isPremium?: boolean;
}

export function DealershipSidebar({ dealer, isPremium = false }: Props) {
  const location = [dealer.address, dealer.cityName, dealer.stateName, dealer.country?.name]
    .filter(Boolean)
    .join(", ");

  const inventoryUrl = isPremium ? getPremiumInventoryUrl(dealer) : null;

  return (
    <>
      {!isPremium && (
        <AutomotiveAdBanner type="Auto_Ecosystem_Partner" compact />
      )}

      {inventoryUrl && (
        <div className="bg-gold-50 border border-gold-200 rounded-xl p-5 text-center">
          <h3 className="font-semibold text-gold-900 mb-1">Browse Live Inventory</h3>
          <p className="text-gold-800 text-sm mb-4">Premium verified dealer — shop vehicles directly.</p>
          <a href={inventoryUrl} target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-gold-800 hover:bg-gold-900">View Inventory</Button>
          </a>
        </div>
      )}

      <div className="bg-gold-50 border border-gold-100 rounded-xl p-5 text-center">
        <h3 className="font-semibold text-gold-900 mb-1">Been to this dealer?</h3>
        <p className="text-gold-800 text-sm mb-4">Share your experience to help other car buyers.</p>
        <Link href={`/write-review/${dealer.id}`}>
          <Button className="w-full bg-gold-800 hover:bg-gold-800">Write a Review</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Contact & Location</h3>
        <div className="space-y-3 text-sm">
          {location && (
            <div className="flex gap-2 text-gray-600">
              <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
              <span>{location}</span>
            </div>
          )}
          {dealer.phone && (
            <a href={`tel:${dealer.phone}`} className="flex gap-2 text-gray-600 hover:text-gold-700">
              <Phone size={15} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
              <span>{dealer.phone}</span>
            </a>
          )}
          {dealer.website && (
            <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="flex gap-2 text-gold-700 hover:underline">
              <Globe size={15} className="mt-0.5 shrink-0" aria-hidden />
              <span className="truncate">{dealer.website.replace(/^https?:\/\//, "")}</span>
            </a>
          )}
          {dealer.email && (
            <a href={`mailto:${dealer.email}`} className="flex gap-2 text-gold-700 hover:underline">
              <Mail size={15} className="mt-0.5 shrink-0" aria-hidden />
              <span className="truncate">{dealer.email}</span>
            </a>
          )}
        </div>

        {(dealer.facebookUrl || dealer.instagramUrl || dealer.twitterUrl) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
            {dealer.facebookUrl && (
              <a href={dealer.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-700" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            )}
            {dealer.instagramUrl && (
              <a href={dealer.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600" aria-label="Instagram">
                <Instagram size={18} />
              </a>
            )}
            {dealer.twitterUrl && (
              <a href={dealer.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            )}
          </div>
        )}

        {dealer.yearEstablished && (
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
            Established {dealer.yearEstablished}
          </p>
        )}
      </div>

      {dealer.latitude && dealer.longitude && (
        <DealerMap
          latitude={dealer.latitude}
          longitude={dealer.longitude}
          name={dealer.name}
          address={[dealer.address, dealer.cityName].filter(Boolean).join(", ")}
          className="h-48 w-full"
        />
      )}

      {!isPremium && (
        <div className="bg-night rounded-xl border-2 border-gold/30 p-5 shadow-sm text-center">
          <p className="text-sm text-gray-300 mb-1 font-medium">Is this your dealership?</p>
          <p className="text-xs text-gray-500 mb-4">Claim to remove competitor ads and unlock premium features.</p>
          <Link href={`/dealership/${dealer.slug}?claim=1`}>
            <Button size="lg" className="w-full bg-gold-gradient text-night-900 font-bold hover:opacity-90 border-0">
              Claim This Profile
            </Button>
          </Link>
          <p className="mt-3">
            <Link href={`/pricing?dealer=${dealer.id}`} className="text-xs text-gold-400 hover:text-gold-300">
              View premium plans →
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
