import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/common/StarRating";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserPlus, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  dealer: any; // Type this properly later if needed
}

export function DealerHero({ dealer }: Props) {
  const cityName = dealer.cityName || dealer.city?.name;
  const stateCode = dealer.stateCode || dealer.city?.stateCode;

  return (
    <div className="relative w-full">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full bg-muted overflow-hidden">
        {dealer.coverImageUrl ? (
          <Image
            src={dealer.coverImageUrl}
            alt={`${dealer.name} cover`}
            fill
            className="object-cover opacity-60"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-muted to-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-muted/80 via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-6 pb-6 border-b border-border">
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-card p-2 shadow-xl border-4 border-background overflow-hidden shrink-0 flex items-center justify-center">
            {dealer.logoUrl ? (
              <Image
                src={dealer.logoUrl}
                alt={`${dealer.name} logo`}
                width={160}
                height={160}
                className="object-contain"
              />
            ) : (
              <span className="text-4xl md:text-6xl font-black text-primary">
                {dealer.name[0]}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-foreground pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {dealer.isVerified && (
                <Badge className="bg-muted hover:bg-muted text-foreground border-none flex gap-1 items-center px-2 py-0.5">
                  <ShieldCheck size={14} /> Verified Dealer
                </Badge>
              )}
              {dealer.isFeatured && (
                <Badge className="bg-primary/10 hover:bg-primary text-foreground border-none flex gap-1 items-center px-2 py-0.5">
                  <Star size={14} fill="currentColor" /> Featured
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
              {dealer.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <StarRating rating={dealer.overallRating} size="md" showValue />
                <span className="text-foreground text-sm">
                  ({dealer._count.reviews} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <MapPin size={16} className="text-primary" />
                {cityName}, {stateCode}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pb-2 w-full md:w-auto">
            {dealer.status !== "CLAIMED" && (
              <Button asChild variant="outline" className="bg-card border-border text-foreground hover:bg-card hover:text-foreground flex-1 md:flex-none">
                <Link href={`/claim/${dealer.slug}`}>
                  <UserPlus size={18} className="mr-2" /> Claim This Dealer
                </Link>
              </Button>
            )}
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-ember px-8 flex-1 md:flex-none">
              <Link href="#request-quote">Request a Quote</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
