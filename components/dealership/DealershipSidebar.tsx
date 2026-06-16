"use client";

import Link from "next/link";
import { MapPin, Phone, Globe, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import type { DealershipWithRelations } from "@/types";
import { AutomotiveAdBanner } from "@/components/ads/AutomotiveAdBanner";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit";
import { getPremiumInventoryUrl } from "@/lib/dealer/premium";

const DealerMap = dynamic(
  () => import("@/components/map/DealerMap").then((m) => m.DealerMap),
  { ssr: false, loading: () => <div className="h-48 bg-muted rounded-xl animate-pulse" /> }
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
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-5 text-center">
          <h3 className="font-semibold text-foreground mb-1">Browse Live Inventory</h3>
          <p className="text-primary text-sm mb-4">Premium verified dealer — shop vehicles directly.</p>
          <a href={inventoryUrl} target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-primary hover:bg-primary/90">View Inventory</Button>
          </a>
        </div>
      )}

      <div className="bg-primary/10 border border-primary/30 rounded-xl p-5 text-center">
        <h3 className="font-semibold text-foreground mb-1">Been to this dealer?</h3>
        <p className="text-primary text-sm mb-4">Share your experience to help other car buyers.</p>
        <Link href={`/write-review/${dealer.id}`}>
          <Button className="w-full bg-primary hover:bg-primary">Write a Review</Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Contact & Location</h3>
        <div className="space-y-3 text-sm">
          {location && (
            <div className="flex gap-2 text-muted-foreground">
              <MapPin size={15} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
              <span>{location}</span>
            </div>
          )}
          {dealer.phone && (
            <a href={`tel:${dealer.phone}`} className="flex gap-2 text-muted-foreground hover:text-primary">
              <Phone size={15} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
              <span>{dealer.phone}</span>
            </a>
          )}
          {dealer.website && (
            <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="flex gap-2 text-primary hover:underline">
              <Globe size={15} className="mt-0.5 shrink-0" aria-hidden />
              <span className="truncate">{dealer.website.replace(/^https?:\/\//, "")}</span>
            </a>
          )}
          {dealer.email && (
            <a href={`mailto:${dealer.email}`} className="flex gap-2 text-primary hover:underline">
              <Mail size={15} className="mt-0.5 shrink-0" aria-hidden />
              <span className="truncate">{dealer.email}</span>
            </a>
          )}
        </div>

        {(dealer.facebookUrl || dealer.instagramUrl || dealer.twitterUrl) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            {dealer.facebookUrl && (
              <a href={dealer.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            )}
            {dealer.instagramUrl && (
              <a href={dealer.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Instagram">
                <Instagram size={18} />
              </a>
            )}
            {dealer.twitterUrl && (
              <a href={dealer.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            )}
          </div>
        )}

        {dealer.yearEstablished && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
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

      <AdSenseUnit slotKey="dealerSidebar" format="rectangle" className="rounded-xl border border-border bg-muted p-3" />

      {!isPremium && (
        <div className="bg-background rounded-xl border-2 border-primary/30 p-5 shadow-sm text-center">
          <p className="text-sm text-muted-foreground mb-1 font-medium">Is this your dealership?</p>
          <p className="text-xs text-muted-foreground mb-4">Claim to remove competitor ads and unlock premium features.</p>
          <Link href={`/dealership/${dealer.slug}?claim=1`}>
            <Button size="lg" className="w-full bg-ember text-night-900 font-bold hover:opacity-90 border-0">
              Claim This Profile
            </Button>
          </Link>
          <p className="mt-3">
            <Link href={`/pricing?dealer=${dealer.id}`} className="text-xs text-primary hover:text-primary">
              View premium plans →
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
