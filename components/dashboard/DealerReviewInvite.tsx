"use client";

import { useState } from "react";
import { Link2, Copy, Check, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function DealerReviewInvite({ slug, dealerName }: { slug: string; dealerName: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const base = typeof window !== "undefined" ? window.location.origin : "https://dealervoice.io";
  const reviewLink = `${base}/dealership/${slug}?write=1`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reviewLink);
      setCopied(true);
      toast({ title: "Link copied", description: "Share this with customers after a sale or service visit." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 mb-6">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
          <PenLine size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">Invite customers to review {dealerName}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Share this link after a sale or service visit. Customers land on your profile with Write Review highlighted.
          </p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <code className="flex-1 text-xs bg-card border border-border rounded-lg px-3 py-2 truncate text-foreground">
              {reviewLink}
            </code>
            <Button type="button" size="sm" variant="outline" onClick={copy} className="shrink-0 gap-1.5 border-primary/30">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Link2 size={12} /> Send via SMS, email, or print on a receipt
          </p>
        </div>
      </div>
    </div>
  );
}
