"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TRUST_STATS = [
  { value: "2.4M+", label: "Verified Reviews" },
  { value: "180K+", label: "Dealerships Listed" },
  { value: "190+", label: "Countries" },
  { value: "4.8★", label: "Platform Rating" },
];

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    router.push(`/dealers?${params.toString()}`);
  };

  return (
    <section className="relative bg-night-gradient text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[36rem] h-[36rem] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-gold-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-300 mb-6">
            <ShieldCheck size={14} />
            Trusted by millions of car buyers worldwide
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-white">
            Find Dealerships You Can{" "}
            <span className="text-gold">Trust</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl mx-auto">
            Read verified customer reviews, compare dealership ratings, and make confident vehicle decisions.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dealership or brand..."
                className="pl-10 h-12 bg-white text-gray-900 border-0 shadow-lg text-base"
              />
            </div>
            <div className="relative sm:w-48">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or country"
                className="pl-10 h-12 bg-white text-gray-900 border-0 shadow-lg text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 bg-gold-gradient text-night-900 hover:opacity-90 font-semibold shrink-0 shadow-gold border-0">
              Search
            </Button>
          </form>

          <p className="text-gray-400 text-sm mt-4">
            Popular: <span className="text-gold-400">Toyota, BMW, Tesla, Mercedes-Benz, Ford</span>
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-16"
        >
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gold">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
