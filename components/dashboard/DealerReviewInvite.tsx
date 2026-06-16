"use client";

import { useState } from "react";
import Image from "next/image";
import { Link2, Copy, Check, PenLine, Download, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  buildReviewInviteEmailText,
  buildReviewInviteSms,
  dealerReviewInvitePrintUrl,
  dealerReviewInviteUrl,
  reviewInviteQrApiUrl,
} from "@/lib/reviews/invite";

export function DealerReviewInvite({ slug, dealerName }: { slug: string; dealerName: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<"link" | "sms" | "email" | null>(null);
  const reviewLink = dealerReviewInviteUrl(slug);
  const qrSrc = reviewInviteQrApiUrl(slug);
  const printUrl = dealerReviewInvitePrintUrl(slug);

  const copy = async (text: string, kind: "link" | "sms" | "email", label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      toast({ title: `${label} copied` });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 mb-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
              <PenLine size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Get your first 10 reviews</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Share the link or QR after every sale or service visit. Goal: <strong>10 verified reviews</strong>{" "}
                to unlock trust scores and Pro conversion.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <code className="flex-1 text-xs bg-card border border-border rounded-lg px-3 py-2 truncate text-foreground">
              {reviewLink}
            </code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copy(reviewLink, "link", "Invite link")}
              className="shrink-0 gap-1.5 border-primary/30"
            >
              {copied === "link" ? <Check size={14} /> : <Copy size={14} />}
              Copy link
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5 border-primary/30"
              onClick={() => copy(buildReviewInviteSms(dealerName, slug), "sms", "SMS template")}
            >
              <MessageSquare size={14} />
              {copied === "sms" ? "Copied" : "Copy SMS"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5 border-primary/30"
              onClick={() => copy(buildReviewInviteEmailText(dealerName, slug), "email", "Email template")}
            >
              <Mail size={14} />
              {copied === "email" ? "Copied" : "Copy email"}
            </Button>
            <Button type="button" size="sm" variant="outline" className="gap-1.5 border-primary/30" asChild>
              <a href={printUrl} target="_blank" rel="noopener noreferrer">
                <Download size={14} />
                Print counter card
              </a>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Link2 size={12} /> Text, email, receipt footer, or lobby QR stand
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="bg-card border border-border rounded-xl p-3 shadow-soft">
            <Image src={qrSrc} alt={`QR code to review ${dealerName}`} width={160} height={160} unoptimized />
          </div>
          <a
            href={qrSrc}
            download={`${slug}-review-qr.png`}
            className="text-xs text-primary hover:underline font-medium"
          >
            Download QR PNG
          </a>
        </div>
      </div>
    </div>
  );
}
