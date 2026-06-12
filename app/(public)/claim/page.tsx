import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { Search, BadgeCheck, MessageSquare, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Claim Your Dealership",
  description: "Take control of your dealership's reputation on DealerVoice. Respond to reviews, track ratings, and win more customers.",
};

const BENEFITS = [
  { icon: MessageSquare, title: "Respond to reviews", body: "Reply publicly to customer feedback and show buyers you care." },
  { icon: BarChart3, title: "Track your reputation", body: "Monitor your rating, review trends, and reputation score over time." },
  { icon: BadgeCheck, title: "Verified badge", body: "Get a verified dealer badge that builds instant trust with shoppers." },
  { icon: ShieldCheck, title: "Report abuse", body: "Flag fake or policy-violating reviews for moderation review." },
];

async function searchDealers(q: string) {
  if (!q || q.length < 2) return [];
  try {
    return await prisma.dealership.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { cityName: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
      orderBy: { totalReviews: "desc" },
      select: { id: true, name: true, slug: true, cityName: true, stateName: true, claimedAt: true, country: { select: { name: true } } },
    });
  } catch {
    return [];
  }
}

export default async function ClaimPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const results = q ? await searchDealers(q) : [];

  return (
    <div className="bg-white">
      {/* Hero + search */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(212,175,55,0.10),transparent_60%)]" />
        <div className="container relative py-16 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-700 font-medium mb-6">
            <BadgeCheck size={14} /> Free to claim
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Claim your <span className="text-gold">dealership</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find your dealership below to manage its profile, respond to reviews, and build trust with car buyers on DealerVoice.
          </p>

          <form action="/claim" method="get" className="flex gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/60">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search your dealership name or city"
                className="w-full h-13 pl-12 pr-3 py-3.5 rounded-xl border-0 focus:outline-none text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-auto px-7 bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90 rounded-xl">Search</Button>
          </form>
        </div>
      </section>

      {/* Results */}
      {q && (
        <section className="py-10 border-b border-gray-100 bg-gray-50">
          <div className="container max-w-2xl">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              {results.length > 0 ? `Results for “${q}”` : `No matches for “${q}”`}
            </h2>
            {results.length === 0 ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  We couldn&apos;t find that dealership. Try a different spelling, or list it yourself — it&apos;s free.
                </p>
                <Link href={`/register-dealership${q ? `?name=${encodeURIComponent(q)}` : ""}`}>
                  <Button className="bg-gold-gradient text-night-900 font-semibold border-0">
                    List your dealership
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{d.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {[d.cityName, d.stateName, d.country?.name].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    {d.claimedAt ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 shrink-0">Already claimed</span>
                    ) : (
                      <Link href={`/dealership/${d.slug}?claim=1`} className="shrink-0">
                        <Button size="sm" className="bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90">
                          Claim <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why claim your profile?</h2>
            <p className="text-gray-600 mt-2">Everything you need to manage your reputation - free to start.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-gray-100 p-6 shadow-sm bg-white">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-gold-50 text-gold-600 mb-4"><b.icon size={22} /></span>
                <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/pricing"><Button variant="outline" size="lg" className="border-gold/50 text-gold-700 hover:bg-gold-50">See plans &amp; pricing</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
