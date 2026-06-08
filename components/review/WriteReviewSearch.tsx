"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function WriteReviewSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ intent: "write" });
    if (query.trim()) params.set("q", query.trim());
    router.push(`/dealers?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Dealer name, brand, or city"
          className="pl-10 h-12"
          aria-label="Search dealership to review"
        />
      </div>
      <Button type="submit" className="h-12 px-6 bg-gold-600 hover:bg-gold-700 text-white font-semibold">
        Find dealership
      </Button>
    </form>
  );
}
