"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowDown, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductShowcaseCard } from "@/components/home/TrustScoreVisual";

interface HeroStats {
  dealers: number;
  countries: number;
  reviews: number;
}

function compact(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  return n.toLocaleString();
}

export function HomepageCinematicHero({ stats }: { stats: HeroStats }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/dealers?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col bg-showroom overflow-hidden pt-16">
      {/* Ambient layers */}
      <div className="absolute inset-0 bg-circuit opacity-[0.07]" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.99 0.005 85 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.99 0.005 85 / 0.5) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
        aria-hidden
      />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="container relative flex-1 flex flex-col justify-center py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-8">
              <Sparkles size={12} />
              AI-native reputation platform
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-light leading-[1.05] tracking-tight text-white">
              Where dealership
              <br />
              <span className="text-gradient-gold font-normal">trust becomes real.</span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-white/55 max-w-lg leading-relaxed">
              The platform built for automotive retail — verified reviews, transparent trust scores, and AI that
              helps dealers capture every lead. One standard. One place.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-md" role="search">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a dealer or city…"
                  className="h-12 pl-11 bg-white/[0.06] border-white/10 text-white placeholder:text-white/35 focus-visible:ring-primary/40 rounded-xl"
                />
              </div>
              <Button type="submit" className="h-12 px-6 rounded-xl font-semibold shadow-ember shrink-0">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm text-white/40">
              <span>
                <strong className="text-white/80 font-medium tabular-nums">{compact(stats.dealers)}</strong> dealers
              </span>
              <span>
                <strong className="text-white/80 font-medium tabular-nums">{stats.countries || "10"}+</strong>{" "}
                countries
              </span>
              <span>
                <strong className="text-white/80 font-medium tabular-nums">
                  {stats.reviews > 0 ? compact(stats.reviews) : "Open"}
                </strong>{" "}
                reviews
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/for-dealers">
                <Button size="lg" className="rounded-xl font-semibold shadow-ember gap-0">
                  For dealerships
                </Button>
              </Link>
              <Link href="/buyers">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white"
                >
                  For car buyers
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 lg:mt-0"
          >
            <ProductShowcaseCard dealerCount={stats.dealers} />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="pb-8 flex justify-center"
      >
        <ArrowDown size={18} className="text-white/25 animate-bounce" aria-hidden />
      </motion.div>
    </section>
  );
}
