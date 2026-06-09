"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const POPULAR = ["Toyota", "Honda", "Ford", "Hyundai", "BMW"];
const POPULAR_LOCATIONS = [
  { label: "India", href: "/dealers/in" },
  { label: "United States", href: "/dealers/us" },
  { label: "United Kingdom", href: "/dealers/gb" },
  { label: "UAE", href: "/dealers/ae" },
  { label: "Australia", href: "/dealers/au" },
];

interface HeroStats {
  dealers: number;
  countries: number;
  reviews: number;
  indiaDealers?: number;
}

function compact(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  return n.toLocaleString();
}

export function HeroSection({ stats }: { stats: HeroStats }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const TRUST_STATS = [
    { value: compact(stats.dealers), label: "Dealerships listed" },
    { value: String(stats.countries || 10), label: "Countries" },
    {
      value: stats.reviews > 0 ? compact(stats.reviews) : "Open",
      label: stats.reviews > 0 ? "Published reviews" : "Be the first reviewer",
    },
    { value: "Free", label: "To read & review" },
  ];

  const trustLine = [
    stats.dealers > 0 ? `${compact(stats.dealers)} dealerships` : null,
    stats.countries > 0 ? `${stats.countries} countries` : null,
    "Verified reviews worldwide",
  ]
    .filter(Boolean)
    .join(" · ");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    router.push(`/dealers?${params.toString()}`);
  };

  return (
    <section className="relative bg-night overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(251,101,20,0.06),transparent_60%)]" />

      <div className="container relative py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-400 font-medium mb-6">
            <ShieldCheck size={14} />
            {trustLine}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5">
            Find the dealership{" "}
            <span className="text-gold">you can trust</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Real reviews from verified car buyers across{" "}
            {stats.countries > 0 ? `${stats.countries} countries` : "the world"}.
            Compare dealership reputation, read transparent feedback, and make confident purchase decisions.
          </p>

          <form
            onSubmit={handleSearch}
            role="search"
            aria-label="Search car dealership reviews"
            className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto bg-white p-2 rounded-2xl border border-white/10 shadow-2xl shadow-black/40"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Dealer name, brand, or city"
                aria-label="Search dealers"
                className="pl-12 h-14 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="relative sm:w-52">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or state"
                className="pl-11 h-14 border-0 sm:border-l border-white/10 bg-transparent text-base shadow-none focus-visible:ring-0 rounded-none"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 bg-gold-600 hover:bg-gold-700 text-white font-semibold shrink-0 border-0 rounded-xl"
            >
              Search Reviews
            </Button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
            <Link href="/claim">
              <Button
                variant="outline"
                size="lg"
                className="border-gold/50 text-gold-300 bg-transparent hover:bg-gold-500/15 gap-2 h-11"
              >
                <Building2 size={16} />
                Claim Your Dealership
              </Button>
            </Link>
          </div>

          <p className="text-gray-500 text-sm mt-4">
            Popular brands:{" "}
            {POPULAR.map((b, i) => (
              <span key={b}>
                <button
                  onClick={() => router.push(`/dealers?q=${encodeURIComponent(b)}`)}
                  className="text-gold-400 hover:text-gold-300 hover:underline font-medium"
                >
                  {b}
                </button>
                {i < POPULAR.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Top regions:{" "}
            {POPULAR_LOCATIONS.map((loc, i) => (
              <span key={loc.label}>
                <Link href={loc.href} className="text-gold-400/80 hover:text-gold-300 hover:underline font-medium">
                  {loc.label}
                </Link>
                {i < POPULAR_LOCATIONS.length - 1 ? ", " : ""}
              </span>
            ))}
            {" · "}
            <Link href="/dealers" className="text-gold-400 hover:text-gold-300 hover:underline font-medium">
              All regions
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14"
        >
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center rounded-xl border border-white/10 card-dark py-4">
              <div className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
