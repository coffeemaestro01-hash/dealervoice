"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { StarRating } from "@/components/common/StarRating";
import { VerificationBadge } from "@/components/common/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { timeAgo, cn } from "@/lib/utils";
import type { ReviewWithRelations } from "@/types";

interface Props {
  review: ReviewWithRelations;
  dealershipId: string;
  onResponded: () => void;
}

export function DealerReviewRow({ review, dealershipId, onResponded }: Props) {
  const { toast } = useToast();
  const [responding, setResponding] = useState(false);
  const [responseText, setResponseText] = useState(review.response?.body ?? "");
  const [isResolved, setIsResolved] = useState(review.response?.isResolved ?? false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const respondMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/reviews/${review.id}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: responseText, isResolved }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
    },
    onSuccess: () => {
      toast({ title: "Response published" });
      setResponding(false);
      onResponded();
    },
    onError: (err: Error) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const fetchSuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const res = await fetch("/api/ai/suggest-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id }),
      });
      const data = await res.json();
      if (data.data?.suggestion) setResponseText(data.data.suggestion);
    } catch {
      toast({ title: "Could not generate suggestion", variant: "destructive" });
    } finally {
      setLoadingSuggestion(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5">
        {/* Review header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{review.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.overallRating} size="sm" showValue />
              <VerificationBadge status={review.verificationStatus} />
              <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {review.response ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <CheckCircle size={13} />
                Responded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                Awaiting response
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{review.body}</p>
        <p className="text-xs text-gray-400 mt-1">- {review.author.name}</p>

        {/* Existing response */}
        {review.response && !responding && (
          <div className="mt-4 pl-4 border-l-2 border-gold-100 bg-gold-50/50 rounded-r p-3 text-sm text-gray-700">
            <p className="text-xs font-semibold text-gold-800 mb-1">Your response</p>
            {review.response.body}
          </div>
        )}
      </div>

      {/* Response area */}
      {responding ? (
        <div className="border-t border-gray-50 p-5 bg-gray-50/50">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Write your response</label>
            {process.env.NEXT_PUBLIC_AI_ENABLED === "true" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 text-purple-600 hover:text-purple-700"
                onClick={fetchSuggestion}
                disabled={loadingSuggestion}
              >
                {loadingSuggestion ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                AI Suggest
              </Button>
            )}
          </div>
          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Write a professional response..."
            rows={4}
            className="text-sm"
          />
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={isResolved} onChange={(e) => setIsResolved(e.target.checked)} className="rounded" />
              Mark issue as resolved
            </label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setResponding(false)}>Cancel</Button>
              <Button
                size="sm"
                className="bg-gold-800 hover:bg-gold-800"
                onClick={() => respondMutation.mutate()}
                disabled={!responseText.trim() || respondMutation.isPending}
              >
                {respondMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Publish Response
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-50 px-5 py-3 flex justify-end">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setResponding(true)}>
            <MessageSquare size={14} />
            {review.response ? "Edit Response" : "Respond"}
          </Button>
        </div>
      )}
    </div>
  );
}
