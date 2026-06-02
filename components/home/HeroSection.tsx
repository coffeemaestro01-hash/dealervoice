"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const POPULAR = ["Toyota", "BMW", "Tesla", "Mercedes-Benz", "Ford"];

interface HeroStats {
  dealers: number;
  countries: number;
  reviews: number;
}

function compact(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  return `${n}`;
}

export function HeroSection({ stats }: { stats: HeroStats }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const TRUST_STATS = [
    { value: compact(stats.dealers), label: "Dealerships listed" },
    { value: `${stats.countries}`, label: "Countries" },
    { value: stats.reviews > 0 ? compact(stats.reviews) : "100%", label: stats.reviews > 0 ? "Verified reviews" : "Verified reviews only" },
    { value: "Free", label: "To read & review" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    router.push(`/dealers?${params.toString()}`);
  };

  return (
    <section className="relative bg-white overflow-hidden">
      {/* soft gold ambiance */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(212,175,55,0.10),transparent_60%)]" />
      <div className="absolute top-24 -right-20 w-96 h-96 bg-gold-200/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-700 font-medium mb-6">
            <ShieldCheck size={14} />
            New platform - be among the first verified reviewers in your city
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-5">
            Find dealerships you can{" "}
            <span className="text-gold">trust</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto">
            Read verified customer reviews, compare dealership ratings, and make confident vehicle decisions.
          </p>

          {/* Prominent search */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto bg-white p-2 rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/60"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dealership or brand"
                className="pl-12 h-14 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="relative sm:w-52">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or country"
                className="pl-11 h-14 border-0 sm:border-l border-gray-100 bg-transparent text-base shadow-none focus-visible:ring-0 rounded-none"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 bg-gold-gradient text-night-900 hover:opacity-90 font-semibold shrink-0 border-0 rounded-xl"
            >
              Search
            </Button>
          </form>

          <p className="text-gray-500 text-sm mt-4">
            Popular:{" "}
            {POPULAR.map((b, i) => (
              <span key={b}>
                <button
                  onClick={() => router.push(`/dealers?q=${encodeURIComponent(b)}`)}
                  className="text-gold-700 hover:text-gold-800 hover:underline font-medium"
                >
                  {b}
                </button>
                {i < POPULAR.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14"
        >
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center rounded-xl border border-gray-100 bg-gray-50/60 py-4">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center gap-1">
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
