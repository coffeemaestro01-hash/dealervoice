import Link from "next/link";
import { Search, Star, ArrowRight } from "lucide-react";

interface Props {
  dealers: number;
  reviews: number;
}

export function ReviewsDirectoryTeaser({ dealers, reviews }: Props) {
  return (
    <section className="py-16 md:py-20 bg-[#faf9f7] border-t border-gray-200/80">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 md:p-12 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.12)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 text-gold-700 text-xs font-semibold uppercase tracking-luxury mb-3">
                <Star size={14} />
                For car buyers
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900">
                Trusted dealership reviews
              </h2>
              <p className="text-gray-600 mt-2 max-w-md text-sm leading-relaxed">
                {dealers.toLocaleString()}+ dealerships · {reviews > 0 ? `${reviews.toLocaleString()}+ verified reviews` : "Verified reviews"}.
                Research with confidence before you buy.
              </p>
            </div>
            <Link
              href="/dealers"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full border border-gold-300/80 text-gold-800 font-semibold text-sm hover:bg-gold-50 hover:border-gold-400 transition-all shrink-0"
            >
              <Search size={16} />
              Explore Directory
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
