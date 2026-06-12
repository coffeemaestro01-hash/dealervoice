import { Quote } from "lucide-react";
import prisma from "@/lib/db";
import Link from "next/link";

async function getTestimonials() {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { isFeatured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
    });
    if (rows.length > 0) return rows;

    // Pull from published reviews when no curated testimonials exist
    const reviews = await prisma.review.findMany({
      where: { status: "PUBLISHED", deletedAt: null, body: { not: "" } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        body: true,
        title: true,
        author: { select: { displayName: true, name: true } },
        dealership: { select: { cityName: true, stateName: true } },
        verificationStatus: true,
      },
    });

    return reviews.map((r, i) => ({
      id: `review-${i}`,
      quote: r.body.length > 220 ? `${r.body.slice(0, 217)}…` : r.body,
      authorName: r.author.displayName ?? r.author.name ?? "Verified buyer",
      authorCity: r.dealership.cityName,
      authorState: r.dealership.stateName,
      isVerified: r.verificationStatus !== "UNVERIFIED",
    }));
  } catch {
    return [];
  }
}

export async function TestimonialsSection() {
  const testimonials = await getTestimonials();

  return (
    <section className="py-14 bg-gray-50 border-t border-gray-100" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 id="testimonials-heading" className="font-display text-2xl md:text-3xl font-bold text-gray-900">
            What car buyers are saying
          </h2>
          <p className="text-gray-600 mt-2">
            Real experiences from people researching and buying from dealerships nationwide.
          </p>
        </div>

        {testimonials.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <blockquote
                key={t.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col"
              >
                <Quote className="text-gold-500 mb-3" size={24} aria-hidden />
                <p className="text-gray-700 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 pt-4 border-t border-gray-100">
                  <cite className="not-italic font-semibold text-gray-900 text-sm">{t.authorName}</cite>
                  {(t.authorCity || t.authorState) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[t.authorCity, t.authorState].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {t.isVerified && (
                    <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      Verified experience
                    </span>
                  )}
                </footer>
              </blockquote>
            ))}
          </div>
        ) : (
          <div className="text-center max-w-md mx-auto rounded-2xl border border-dashed border-gray-200 bg-white p-8">
            <p className="text-gray-600 text-sm">
              Be among the first to share your dealership experience. Your review helps other buyers make confident decisions.
            </p>
            <Link
              href="/write-review"
              className="inline-block mt-4 text-gold-700 font-semibold text-sm hover:underline"
            >
              Write the first review →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
