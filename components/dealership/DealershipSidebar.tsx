"use client";

import Link from "next/link";
import { MapPin, Phone, Globe, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import type { DealershipWithRelations } from "@/types";

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
    id: string;
  };
}

export function DealershipSidebar({ dealer }: Props) {
  const location = [dealer.address, dealer.cityName, dealer.stateName, dealer.country?.name]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {/* Write Review CTA */}
      <div className="bg-gold-50 border border-gold-100 rounded-xl p-5 text-center">
        <h3 className="font-semibold text-gold-900 mb-1">Been to this dealer?</h3>
        <p className="text-gold-800 text-sm mb-4">Share your experience to help other car buyers.</p>
        <Link href={`/write-review/${dealer.id}`}>
          <Button className="w-full bg-gold-800 hover:bg-gold-800">Write a Review</Button>
        </Link>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Contact & Location</h3>
        <div className="space-y-3 text-sm">
          {location && (
            <div className="flex gap-2 text-gray-600">
              <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
              <span>{location}</span>
            </div>
          )}
          {dealer.phone && (
            <a href={`tel:${dealer.phone}`} className="flex gap-2 text-gray-600 hover:text-gold-700">
              <Phone size={15} className="mt-0.5 shrink-0 text-gray-400" />
              <span>{dealer.phone}</span>
            </a>
          )}
          {dealer.website && (
            <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="flex gap-2 text-gold-700 hover:underline">
              <Globe size={15} className="mt-0.5 shrink-0" />
              <span className="truncate">{dealer.website.replace(/^https?:\/\//, "")}</span>
            </a>
          )}
          {dealer.email && (
            <a href={`mailto:${dealer.email}`} className="flex gap-2 text-gold-700 hover:underline">
              <Mail size={15} className="mt-0.5 shrink-0" />
              <span className="truncate">{dealer.email}</span>
            </a>
          )}
        </div>

        {(dealer.facebookUrl || dealer.instagramUrl || dealer.twitterUrl) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
            {dealer.facebookUrl && (
              <a href={dealer.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-700">
                <Facebook size={18} />
              </a>
            )}
            {dealer.instagramUrl && (
              <a href={dealer.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600">
                <Instagram size={18} />
              </a>
            )}
            {dealer.twitterUrl && (
              <a href={dealer.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500">
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

      {/* Map */}
      {dealer.latitude && dealer.longitude && (
        <DealerMap
          latitude={dealer.latitude}
          longitude={dealer.longitude}
          name={dealer.name}
          address={[dealer.address, dealer.cityName].filter(Boolean).join(", ")}
          className="h-48 w-full"
        />
      )}

      {/* Is this your dealership? */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm text-center">
        <p className="text-sm text-gray-600 mb-3">Is this your dealership?</p>
        <Link href={`/claim?dealer=${dealer.id}`}>
          <Button variant="outline" size="sm" className="w-full">Claim This Profile</Button>
        </Link>
      </div>
    </>
  );
}
