import Link from "next/link";
import { ArrowRight, Shield, FileText } from "lucide-react";

export function HomepageTrustTeaser() {
  return (
    <section className="py-12 border-y border-border bg-pearl/50">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 max-w-4xl mx-auto">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Transparent by design</p>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              Scores you can explain. Reviews you can trust.
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              Verified buyer experiences, published methodology, and dealer response tools — built for accountability, not pay-to-hide.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/trust"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors"
            >
              <Shield size={16} className="text-primary" />
              How we earn trust
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors"
            >
              <FileText size={16} className="text-primary" />
              Scoring methodology
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
