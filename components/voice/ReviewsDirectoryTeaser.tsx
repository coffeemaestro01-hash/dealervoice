import Link from "next/link";
import { Search, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  dealers: number;
  reviews: number;
}

export function ReviewsDirectoryTeaser({ dealers, reviews }: Props) {
  return (
    <section className="py-14 bg-white border-t border-gray-100">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-gray-100 bg-gray-50 p-8 md:p-10">
          <div>
            <div className="flex items-center gap-2 text-gold-700 text-sm font-medium mb-2">
              <Star size={16} />
              For car buyers
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Also: trusted dealership reviews
            </h2>
            <p className="text-gray-600 mt-2 max-w-lg text-sm">
              {dealers.toLocaleString()}+ dealerships listed · {reviews > 0 ? `${reviews.toLocaleString()}+ verified reviews` : "Verified reviews"}.
              Research before you buy.
            </p>
          </div>
          <Link href="/dealers">
            <Button variant="outline" className="gap-2 border-gold-300 text-gold-800 hover:bg-gold-50">
              <Search size={16} />
              Find Dealers
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
