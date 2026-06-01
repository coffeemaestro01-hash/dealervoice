"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { ChevronRight, Loader2, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "@/components/common/StarRating";
import { useToast } from "@/components/ui/use-toast";
import { reviewSchema, type ReviewInput } from "@/lib/validations";

const REVIEW_TYPES = [
  { value: "NEW_CAR_PURCHASE", label: "New Car Purchase" },
  { value: "USED_CAR_PURCHASE", label: "Used Car Purchase" },
  { value: "VEHICLE_SERVICE", label: "Vehicle Service" },
  { value: "PARTS_DEPARTMENT", label: "Parts Department" },
  { value: "FINANCING", label: "Financing Experience" },
  { value: "WARRANTY_CLAIM", label: "Warranty Claim" },
  { value: "TRADE_IN", label: "Trade-In Experience" },
];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

interface Props {
  dealer: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    cityName?: string | null;
    stateName?: string | null;
    country: { name: string };
  };
}

export function WriteReviewForm({ dealer }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [hoveredRating, setHoveredRating] = useState(0);

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      dealershipId: dealer.id,
      overallRating: 0,
    },
  });

  const overallRating = watch("overallRating");

  const submitMutation = useMutation({
    mutationFn: async (data: ReviewInput) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to submit review");
      return json;
    },
    onSuccess: (data) => {
      toast({ title: "Review submitted!", description: data.message });
      router.push(`/dealership/${dealer.slug}`);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = handleSubmit((data) => submitMutation.mutate(data));

  return (
    <div>
      {/* Dealer header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
          {dealer.logoUrl ? (
            <Image src={dealer.logoUrl} alt={dealer.name} width={56} height={56} className="object-contain p-1" />
          ) : (
            <span className="text-xl font-bold text-gray-300">{dealer.name[0]}</span>
          )}
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{dealer.name}</h1>
          <p className="text-sm text-gray-500">
            {[dealer.cityName, dealer.stateName, dealer.country.name].filter(Boolean).join(", ")}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Write Your Review</h2>

          {/* Review type */}
          <div>
            <Label>What type of experience are you reviewing?</Label>
            <Controller
              name="reviewType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select experience type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVIEW_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.reviewType && <p className="text-red-500 text-xs mt-1">{errors.reviewType.message}</p>}
          </div>

          {/* Overall rating */}
          <div>
            <Label>Overall Rating *</Label>
            <div className="flex items-center gap-4 mt-2">
              <Controller
                name="overallRating"
                control={control}
                render={({ field }) => (
                  <StarRating
                    rating={hoveredRating || field.value}
                    size="xl"
                    interactive
                    onChange={(r) => { setValue("overallRating", r); setHoveredRating(0); }}
                  />
                )}
              />
              {overallRating > 0 && (
                <span className="text-sm font-semibold text-gray-700">{RATING_LABELS[overallRating]}</span>
              )}
            </div>
            {errors.overallRating && <p className="text-red-500 text-xs mt-1">Please select a rating</p>}
          </div>

          {/* Sub-ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "ratingTransparency" as const, label: "Sales Transparency" },
              { name: "ratingPricing" as const, label: "Pricing Fairness" },
              { name: "ratingService" as const, label: "Customer Service" },
              { name: "ratingDelivery" as const, label: "Delivery Experience" },
              { name: "ratingAfterSales" as const, label: "After-Sales Support" },
            ].map((field) => (
              <div key={field.name}>
                <Label className="text-sm">{field.label}</Label>
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: f }) => (
                    <StarRating rating={f.value ?? 0} size="sm" interactive onChange={f.onChange} className="mt-1" />
                  )}
                />
              </div>
            ))}
          </div>

          {/* Would recommend */}
          <div>
            <Label>Would you recommend this dealer?</Label>
            <div className="flex gap-3 mt-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setValue("wouldRecommend", val)}
                  className={`px-5 py-2 rounded-lg border text-sm font-medium transition-all ${
                    watch("wouldRecommend") === val
                      ? val ? "bg-green-50 border-green-400 text-green-700" : "bg-red-50 border-red-400 text-red-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Review Title *</Label>
            <Input id="title" className="mt-1" placeholder="Summarize your experience in a sentence" {...register("title")} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Body */}
          <div>
            <Label htmlFor="body">Your Review *</Label>
            <Textarea
              id="body"
              className="mt-1"
              placeholder="Share the details of your experience (min. 50 characters)"
              rows={5}
              {...register("body")}
            />
            <div className="flex justify-between mt-1">
              {errors.body && <p className="text-red-500 text-xs">{errors.body.message}</p>}
              <span className="text-xs text-gray-400 ml-auto">{watch("body")?.length ?? 0} chars</span>
            </div>
          </div>

          {/* Vehicle info */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="vehicleMake" className="text-sm">Make</Label>
              <Input id="vehicleMake" className="mt-1" placeholder="Toyota" {...register("vehicleMake")} />
            </div>
            <div>
              <Label htmlFor="vehicleModel" className="text-sm">Model</Label>
              <Input id="vehicleModel" className="mt-1" placeholder="Camry" {...register("vehicleModel")} />
            </div>
            <div>
              <Label htmlFor="vehicleYear" className="text-sm">Year</Label>
              <Input id="vehicleYear" type="number" className="mt-1" placeholder="2024" {...register("vehicleYear", { valueAsNumber: true })} />
            </div>
          </div>

          {/* Date of visit */}
          <div>
            <Label htmlFor="visitDate">Date of Visit</Label>
            <Input id="visitDate" type="date" className="mt-1 w-48" {...register("visitDate")} />
          </div>

          <Button
            type="submit"
            className="w-full bg-gold-800 hover:bg-gold-800 h-12 text-base font-semibold"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <><Loader2 size={18} className="animate-spin mr-2" />Submitting…</>
            ) : (
              "Submit Review"
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By submitting, you agree to our{" "}
            <a href="/terms" className="text-gold-700 hover:underline">Terms of Service</a>. Reviews are subject to moderation.
          </p>
        </div>
      </form>
    </div>
  );
}
