import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Share2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Thank You — Your Review Helps Buyers",
  description: "Your dealership review has been submitted on DealerVoice.",
};

interface Props {
  searchParams: Promise<{ dealer?: string; slug?: string; flagged?: string }>;
}

export default async function ReviewThankYouPage({ searchParams }: Props) {
  const { dealer, slug, flagged } = await searchParams;
  const isModeration = flagged === "1";

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full bg-card rounded-2xl border border-border shadow-lg p-8 text-center">
        <CheckCircle2 className={`mx-auto mb-4 ${isModeration ? "text-primary" : "text-primary"}`} size={48} />
        <h1 className="text-2xl font-bold text-foreground">
          {isModeration ? "Review submitted for review" : "Thank you for your review!"}
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          {isModeration
            ? "Our team will review your submission shortly. Once approved, it will appear on the dealership profile."
            : dealer
              ? `Your experience at ${dealer} is now live. You're helping car buyers make informed decisions.`
              : "Your review is live. You're helping car buyers make informed decisions."}
        </p>

        <div className="mt-8 space-y-3">
          {slug && (
            <Link href={`/dealership/${slug}`} className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-foreground">
                View dealership profile
              </Button>
            </Link>
          )}
          <Link href="/write-review" className="block">
            <Button variant="outline" className="w-full gap-2">
              <Share2 size={16} />
              Review another dealership
            </Button>
          </Link>
          <Link href="/chicago" className="block">
            <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
              <Building2 size={16} />
              Browse Chicago dealerships
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
