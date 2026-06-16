import type { Metadata } from "next";
import Link from "next/link";
import { Search, PenLine, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WriteReviewSearch } from "@/components/review/WriteReviewSearch";

export const metadata: Metadata = {
  title: "Write a Review",
  description: "Share your car dealership experience on DealerVoice. Search for the dealer you visited and submit a verified review.",
};

const STEPS = [
  { icon: Search, title: "Find your dealership", body: "Search by dealer name, brand, or city." },
  { icon: PenLine, title: "Share your experience", body: "Rate your visit and describe what happened — sales, service, or financing." },
  { icon: ShieldCheck, title: "Verify (optional)", body: "Upload an invoice or receipt to earn a Verified badge. See our methodology." },
];

export default async function WriteReviewLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const showWelcome = welcome === "1";

  return (
    <div className="bg-muted">
      <section className="bg-card border-b border-border">
        <div className="container py-12 md:py-16 max-w-3xl">
          {showWelcome && (
            <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
              Welcome to DealerVoice! Find the dealership you visited and be among the first to leave a trusted review.
            </div>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Write a dealership review
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Help other car buyers make better decisions. Search for the dealership you visited, open its profile, and
            click <strong>Write Review</strong>.
          </p>
          <WriteReviewSearch />
          <p className="text-sm text-muted-foreground mt-4">
            You&apos;ll sign in before submitting.{" "}
            <Link href="/methodology" className="text-primary hover:underline">
              How verification works
            </Link>
          </p>
        </div>
      </section>

      <section className="container py-12 max-w-4xl">
        <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">Three steps</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <span className="text-xs font-bold text-primary mb-2 block">0{i + 1}</span>
              <s.icon size={22} className="text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/dealers?sort=needs_review">
            <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
              Browse dealers needing first review
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
