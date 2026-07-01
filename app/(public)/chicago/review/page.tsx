import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Write a Chicago Dealer Review — DealerVoice",
  description:
    "Bought or serviced a car in Chicagoland? Leave an honest review in 2 minutes. Help the next buyer choose a trustworthy dealership.",
};

export default function ChicagoReviewPage() {
  return (
    <div className="bg-card min-h-[70vh]">
      <section className="container py-16 max-w-2xl">
        <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-2">Chicago buyers</p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Bought a car recently? <span className="text-primary">Tell Chicago.</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Your review helps the next buyer avoid bad experiences and rewards honest dealers. It takes about two minutes and
          is free.
        </p>
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 mb-8 text-sm text-foreground">
          <strong className="text-primary">Limited offer:</strong> First 10 verified Chicagoland reviews receive a{" "}
          <strong>$25 gift card</strong> after publish (terms apply). Help us seed honest reviews for Chicago buyers.
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/write-review">
            <Button size="lg" className="gap-2 font-semibold">
              <Star size={18} /> Write a review
            </Button>
          </Link>
          <Link href="/chicago">
            <Button size="lg" variant="outline" className="gap-2 border-primary/30">
              <MapPin size={18} /> Find your dealer
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-8">
          DealerVoice is built in Chicago. We never charge buyers to read or write reviews.
        </p>
      </section>
    </div>
  );
}
