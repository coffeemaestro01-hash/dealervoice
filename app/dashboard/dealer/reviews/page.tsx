"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, MessageSquare, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DealerReviewRow } from "@/components/dashboard/DealerReviewRow";

async function fetchReviews(dealershipId: string, filter: string, page: number) {
  const params = new URLSearchParams({ dealershipId, page: String(page), limit: "20" });
  if (filter === "unresponded") params.set("responded", "false");
  const res = await fetch(`/api/reviews?${params}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function DealerReviewsPage() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [dealershipId, setDealershipId] = useState("");

  // On mount, fetch dealership
  useState(() => {
    fetch("/api/users/me/dealership").then((r) => r.json()).then((d) => d.data?.id && setDealershipId(d.data.id));
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dealer-reviews", dealershipId, filter, page],
    queryFn: () => fetchReviews(dealershipId, filter, page),
    enabled: !!dealershipId,
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="unresponded">Needs Response</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : (
        <>
          <div className="space-y-4">
            {(data?.data ?? []).length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
                <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">No reviews found</p>
              </div>
            ) : (
              (data?.data ?? []).map((review: any) => (
                <DealerReviewRow key={review.id} review={review} dealershipId={dealershipId} onResponded={refetch} />
              ))
            )}
          </div>

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="flex items-center text-sm text-gray-600 px-3">Page {page} of {data.pagination.totalPages}</span>
              <Button variant="outline" disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
