"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, MapPin, X, PenLine } from "lucide-react";
import Link from "next/link";
import { DealerCard } from "./DealerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { DealershipWithRelations } from "@/types";

async function searchDealers(params: URLSearchParams) {
  const res = await fetch(`/api/search/dealers?${params.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json() as Promise<{ data: DealershipWithRelations[]; total: number; totalPages: number }>;
}

interface DealerSearchPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export function DealerSearchPage({ searchParams: initialParams }: DealerSearchPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [query, setQuery] = useState((initialParams.q as string) ?? "");
  const [location, setLocation] = useState((initialParams.location as string) ?? "");
  const [brand, setBrand] = useState((initialParams.brand as string) ?? "");
  const [sort, setSort] = useState((initialParams.sort as string) ?? "relevance");
  const [page, setPage] = useState(1);
  const writeIntent = sp.get("intent") === "write" || initialParams.intent === "write";

  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (location) params.set("location", location);
  if (brand) params.set("brand", brand);
  if (sort !== "relevance") params.set("sort", sort);
  params.set("page", String(page));

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["dealers", params.toString()],
    queryFn: () => searchDealers(params),
    staleTime: 30_000,
  });

  const updateUrl = useCallback(() => {
    const newParams = new URLSearchParams();
    if (query) newParams.set("q", query);
    if (location) newParams.set("location", location);
    if (brand) newParams.set("brand", brand);
    if (sort !== "relevance") newParams.set("sort", sort);
    if (writeIntent) newParams.set("intent", "write");
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [query, location, brand, sort, pathname, router, writeIntent]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateUrl();
  };

  const clearFilter = (key: string) => {
    if (key === "q") setQuery("");
    if (key === "location") setLocation("");
    if (key === "brand") setBrand("");
    setPage(1);
  };

  const activeFilters = [
    query && { key: "q", label: `"${query}"` },
    location && { key: "location", label: location },
    brand && { key: "brand", label: brand },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search header */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container py-6">
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-4">
            {writeIntent ? "Find a dealership to review" : "Find Car Dealerships"}
          </h1>
          {writeIntent && (
            <p className="text-sm text-gray-600 mb-4 max-w-2xl">
              Search for the dealership you visited, open its profile, then click{" "}
              <span className="font-medium text-gray-900">Write Review</span>. You can verify your review with a
              purchase invoice or service receipt.{" "}
              <Link href="/methodology" className="text-gold-700 hover:underline">
                How verification works
              </Link>
            </p>
          )}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Dealership name or brand..."
                className="pl-10"
              />
            </div>
            <div className="relative sm:w-56">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, state, or country"
                className="pl-9"
              />
            </div>
            <Button type="submit" className="btn-primary shrink-0">Search</Button>
          </form>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-gray-500">Active filters:</span>
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => clearFilter(f.key)}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-gold-50 text-gold-800 border border-gold-100 rounded-full hover:bg-gold-100"
                >
                  {f.label}
                  <X size={10} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container py-6">
        {writeIntent && !isLoading && (data?.data.length ?? 0) > 0 && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold-50 px-4 py-3 text-sm text-gold-900">
            <PenLine size={18} className="shrink-0 mt-0.5" />
            <p>Select a dealership below, then use <strong>Write Review</strong> on its profile.</p>
          </div>
        )}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-600">
            {isLoading ? "Searching..." : `${data?.total?.toLocaleString() ?? 0} dealerships found`}
          </p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gray-400" />
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                setPage(1);
                const newParams = new URLSearchParams();
                if (query) newParams.set("q", query);
                if (location) newParams.set("location", location);
                if (brand) newParams.set("brand", brand);
                if (v !== "relevance") newParams.set("sort", v);
                if (writeIntent) newParams.set("intent", "write");
                router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
              }}
            >
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="needs_review">Needs First Review</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviewed</SelectItem>
                <SelectItem value="reputation">Best Reputation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading || isFetching
            ? Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-xl" />
              ))
            : data?.data.map((dealer) => (
                <DealerCard key={dealer.id} dealer={dealer} />
              ))}
        </div>

        {/* Empty state */}
        {!isLoading && !isFetching && data?.data.length === 0 && (
          <div className="text-center py-20 max-w-md mx-auto">
            <p className="text-gray-500 text-lg">No dealerships found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms</p>
            <div className="mt-6 space-y-3">
              <Link
                href={`/register-dealership${query ? `?name=${encodeURIComponent(query)}${location ? `&city=${encodeURIComponent(location)}` : ""}` : ""}`}
              >
                <Button className="bg-gold-gradient text-night-900 font-semibold border-0">
                  List your dealership
                </Button>
              </Link>
              <p className="text-xs text-gray-400">
                Already listed? <Link href="/claim" className="text-gold-700 hover:underline">Claim your profile</Link>
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Page {page} of {data.totalPages}
            </span>
            <Button variant="outline" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
