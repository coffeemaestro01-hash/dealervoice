import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";
import prisma from "@/lib/db";
import { MARKET_LABELS } from "@/lib/geo/market";

export async function GlobalCoverageSection() {
  let countries: { code: string; name: string; dealerCount: number }[] = [];
  try {
    countries = await prisma.country.findMany({
      where: { isActive: true, dealerCount: { gt: 0 } },
      orderBy: { dealerCount: "desc" },
      take: 12,
      select: { code: true, name: true, dealerCount: true },
    });
  } catch {
    return null;
  }

  if (countries.length === 0) return null;

  return (
    <section className="py-14 bg-night border-y border-white/5" aria-labelledby="global-coverage-heading">
      <div className="container">
        <div className="flex items-center gap-3 mb-8">
          <Globe className="text-gold-500" size={22} />
          <div>
            <h2 id="global-coverage-heading" className="font-display text-2xl font-bold text-white">
              Dealerships worldwide
            </h2>
            <p className="text-sm text-gray-500 mt-1">Browse by country — reviews and inventory growing in every market.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {countries.map((c) => (
            <Link
              key={c.code}
              href={c.code === "IN" ? "/dealers/in" : `/dealers/${c.code.toLowerCase()}`}
              className="rounded-xl border border-white/10 card-dark p-4 hover:border-gold/30 transition-colors group"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-gold-500">{c.code}</p>
              <p className="font-semibold text-white mt-1 group-hover:text-gold-300 transition-colors">
                {MARKET_LABELS[c.code] ?? c.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">{c.dealerCount.toLocaleString()} dealers</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/dealers" className="text-gold-400 hover:text-gold-300 inline-flex items-center gap-1 font-medium">
            All countries <ArrowRight size={14} />
          </Link>
          <Link href="/dealers/in/inventory" className="text-gray-400 hover:text-gold-300">
            India inventory →
          </Link>
          <Link href="/dealers/us/inventory" className="text-gray-400 hover:text-gold-300">
            US inventory →
          </Link>
        </div>
      </div>
    </section>
  );
}
