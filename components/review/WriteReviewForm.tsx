"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { Loader2, Car, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/common/StarRating";
import { useToast } from "@/components/ui/use-toast";
import { reviewSchema, type ReviewInput } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { VerificationUpload } from "@/components/review/VerificationUpload";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const CATEGORIES = [
  {
    value: "SALES_FINANCING" as const,
    label: "Sales / Financing",
    description: "Buying, leasing, or financing a vehicle",
    icon: Car,
  },
  {
    value: "SERVICE_PARTS" as const,
    label: "Service / Parts",
    description: "Maintenance, repairs, or parts department",
    icon: Wrench,
  },
];

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
  const [hoveredRating, setHoveredRating] = useState(0);
  const [verificationDocUrl, setVerificationDocUrl] = useState<string | null>(null);

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      dealershipId: dealer.id,
      overallRating: 0,
    } as Partial<ReviewInput>,
  });

  const overallRating = watch("overallRating");
  const reviewCategory = watch("reviewCategory");

  const submitMutation = useMutation({
    mutationFn: async (data: ReviewInput) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, verificationDocUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to submit review");
      return json;
    },
    onSuccess: (data) => {
      toast({ title: "Review submitted!", description: data.message });
      const flagged = data.data?.status === "FLAGGED" ? "1" : "0";
      const params = new URLSearchParams({
        slug: dealer.slug,
        dealer: dealer.name,
        flagged,
      });
      router.push(`/review-thank-you?${params.toString()}`);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = handleSubmit((data) => submitMutation.mutate(data));

  return (
    <div>
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

          {/* Category selection */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-900 mb-3">
              What are you reviewing? *
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const selected = reviewCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setValue("reviewCategory", cat.value, { shouldValidate: true })}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                      selected
                        ? "border-gold-500 bg-gold-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      selected ? "bg-gold-100 text-gold-800" : "bg-gray-100 text-gray-500"
                    )}>
                      <Icon size={20} aria-hidden />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cat.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.reviewCategory && (
              <p className="text-red-500 text-xs mt-2">{errors.reviewCategory.message}</p>
            )}
          </fieldset>

          {/* Sales-specific fields */}
          {reviewCategory === "SALES_FINANCING" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <Label htmlFor="salesConsultantName">Sales Consultant Name *</Label>
                <Input
                  id="salesConsultantName"
                  className="mt-1"
                  placeholder="Who helped you?"
                  {...register("salesConsultantName")}
                />
                {errors.salesConsultantName && (
                  <p className="text-red-500 text-xs mt-1">{errors.salesConsultantName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="vehicleModel">Vehicle Model Bought *</Label>
                <Input
                  id="vehicleModel"
                  className="mt-1"
                  placeholder="e.g. Toyota Camry XSE"
                  {...register("vehicleModel")}
                />
                {errors.vehicleModel && (
                  <p className="text-red-500 text-xs mt-1">{errors.vehicleModel.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="vehicleMake" className="text-sm">Make (optional)</Label>
                <Input id="vehicleMake" className="mt-1" placeholder="Toyota" {...register("vehicleMake")} />
              </div>
              <div>
                <Label htmlFor="vehicleYear" className="text-sm">Year (optional)</Label>
                <Input
                  id="vehicleYear"
                  type="number"
                  className="mt-1"
                  placeholder="2024"
                  {...register("vehicleYear", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          {/* Service-specific fields */}
          {reviewCategory === "SERVICE_PARTS" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <Label htmlFor="serviceAdvisorName">Service Advisor Name *</Label>
                <Input
                  id="serviceAdvisorName"
                  className="mt-1"
                  placeholder="Who assisted you?"
                  {...register("serviceAdvisorName")}
                />
                {errors.serviceAdvisorName && (
                  <p className="text-red-500 text-xs mt-1">{errors.serviceAdvisorName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="serviceRendered">Service Rendered *</Label>
                <Input
                  id="serviceRendered"
                  className="mt-1"
                  placeholder="e.g. Oil Change, Brake Repair"
                  {...register("serviceRendered")}
                />
                {errors.serviceRendered && (
                  <p className="text-red-500 text-xs mt-1">{errors.serviceRendered.message}</p>
                )}
              </div>
            </div>
          )}

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
              { name: "ratingTransparency" as const, label: reviewCategory === "SERVICE_PARTS" ? "Repair Transparency" : "Sales Transparency" },
              { name: "ratingPricing" as const, label: "Pricing Fairness" },
              { name: "ratingService" as const, label: "Customer Service" },
              { name: "ratingDelivery" as const, label: reviewCategory === "SERVICE_PARTS" ? "Turnaround Time" : "Delivery Experience" },
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

          <div>
            <Label htmlFor="title">Review Title *</Label>
            <Input id="title" className="mt-1" placeholder="Summarize your experience in a sentence" {...register("title")} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

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

          <div>
            <Label htmlFor="visitDate">Date of Visit</Label>
            <Input id="visitDate" type="date" className="mt-1 w-full sm:w-48" {...register("visitDate")} />
          </div>

          {/* Verification upload */}
          <div>
            <Label className="mb-2 block">Proof of Purchase (optional)</Label>
            <VerificationUpload
              value={verificationDocUrl}
              onChange={setVerificationDocUrl}
            />
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
