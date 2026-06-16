"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { claimSchema, type ClaimInput } from "@/lib/validations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { FileUpload } from "@/components/common/FileUpload";
import { useSession } from "next-auth/react";

interface Props {
  dealershipId: string;
  dealershipName: string;
  dealershipSlug?: string;
}

export function ClaimModal({ dealershipId, dealershipName, dealershipSlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [autoApproved, setAutoApproved] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams?.get("claim") === "1") {
      setIsOpen(true);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ClaimInput>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      dealershipId,
      businessEmail: session?.user?.email || "",
      businessPhone: "",
      notes: "",
      documentUrl: "",
    },
  });

  const onSubmit = async (data: ClaimInput) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "You must be signed in to claim a dealership.",
        variant: "destructive",
      });
      const slug = dealershipSlug ?? dealershipId;
      router.push(`/login?callbackUrl=/dealership/${slug}?claim=1`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit claim");
      }

      const result = await response.json();
      const approved = Boolean(result.autoApproved);
      setAutoApproved(approved);
      setRedirectUrl(result.redirectUrl ?? null);
      setIsSuccess(true);
      toast({
        title: approved ? "Claim approved!" : "Claim submitted",
        description: approved
          ? "You now own this profile. Upgrade to Pro to remove competitor ads."
          : "Our team will review your claim within 1 business day.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Remove claim=1 from URL without refreshing page
      const url = new URL(window.location.href);
      url.searchParams.delete("claim");
      window.history.replaceState({}, "", url.toString());
      if (isSuccess) {
        router.refresh();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Claim {dealershipName}</DialogTitle>
          <DialogDescription>
            Submit your details and a proof of ownership document to claim this dealership.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-muted text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">{autoApproved ? "You're in!" : "Claim Submitted"}</h3>
            <p className="text-muted-foreground">
              {autoApproved
                ? "Your profile is live in your dashboard. Upgrade to Pro to strip competitor ads and unlock inventory + analytics."
                : "Our team will review your application and documents. You'll receive an email once approved."}
            </p>
            <div className="flex flex-col gap-2 mt-4">
              {autoApproved && redirectUrl && (
                <Button
                  className="w-full bg-ember text-night-900 font-bold"
                  onClick={() => {
                    handleOpenChange(false);
                    router.push(redirectUrl);
                  }}
                >
                  Upgrade to Pro →
                </Button>
              )}
              <Button
                variant={autoApproved ? "outline" : "default"}
                className="w-full"
                onClick={() => {
                  handleOpenChange(false);
                  if (autoApproved) router.push("/dashboard/dealer");
                }}
              >
                {autoApproved ? "Go to dashboard" : "Close"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input id="businessEmail" type="email" placeholder="owner@dealership.com" {...register("businessEmail")} />
              {errors.businessEmail && <p className="text-xs text-destructive">{errors.businessEmail.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input id="businessPhone" placeholder="(555) 123-4567" {...register("businessPhone")} />
              {errors.businessPhone && <p className="text-xs text-destructive">{errors.businessPhone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Proof of Ownership Document</Label>
              <Controller
                name="documentUrl"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onRemove={() => field.onChange("")}
                    purpose="verification"
                    accept={{
                      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
                      "application/pdf": [".pdf"],
                    }}
                    maxSize={10 * 1024 * 1024}
                  />
                )}
              />
              {errors.documentUrl && <p className="text-xs text-destructive">{errors.documentUrl.message}</p>}
              <p className="text-[10px] text-muted-foreground">
                Upload a photo, screenshot, or PDF of a utility bill, business license, or tax document showing the dealership name and address.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information to help us verify your claim..."
                rows={3}
                {...register("notes")}
              />
              {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-foreground min-w-[120px]" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Claim"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
