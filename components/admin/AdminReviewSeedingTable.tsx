"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Copy, Check, ExternalLink, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  buildReviewInviteEmailText,
  buildReviewInviteSms,
  dealerReviewInvitePrintUrl,
  dealerReviewInviteUrl,
  dealerWriteReviewUrl,
  reviewInviteQrApiUrl,
} from "@/lib/reviews/invite";

export type ReviewSeedDealer = {
  id: string;
  name: string;
  slug: string;
  cityName: string | null;
  stateName: string | null;
  isFranchised: boolean;
};

export function AdminReviewSeedingTable({ dealers }: { dealers: ReviewSeedDealer[] }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast({ title: `${label} copied` });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  if (dealers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground bg-card border border-border rounded-xl p-6">
        No Illinois dealers with zero reviews found. Run geo import or broaden the wedge.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {dealers.map((d, i) => {
        const invite = dealerReviewInviteUrl(d.slug);
        const write = dealerWriteReviewUrl(d.id);
        const print = dealerReviewInvitePrintUrl(d.slug);
        const qr = reviewInviteQrApiUrl(d.slug);
        const location = [d.cityName, d.stateName].filter(Boolean).join(", ");

        return (
          <div key={d.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-primary">#{i + 1}</span>
                  <h3 className="font-semibold text-foreground">{d.name}</h3>
                  {d.isFranchised ? (
                    <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Franchised
                    </span>
                  ) : null}
                </div>
                {location ? <p className="text-sm text-muted-foreground mt-0.5">{location}</p> : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-primary/30"
                    onClick={() => copy(`${d.id}-invite`, invite, "Customer invite link")}
                  >
                    {copied === `${d.id}-invite` ? <Check size={14} /> : <Copy size={14} />}
                    Customer link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-primary/30"
                    onClick={() => copy(`${d.id}-write`, write, "Founder seed link")}
                  >
                    <PenLine size={14} />
                    {copied === `${d.id}-write` ? "Copied" : "Seed review link"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-primary/30"
                    onClick={() => copy(`${d.id}-sms`, buildReviewInviteSms(d.name, d.slug), "SMS")}
                  >
                    Copy SMS
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-primary/30"
                    onClick={() => copy(`${d.id}-email`, buildReviewInviteEmailText(d.name, d.slug), "Email")}
                  >
                    Copy email
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5" asChild>
                    <Link href={print} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} /> Print card
                    </Link>
                  </Button>
                </div>
                <code className="block mt-2 text-[11px] text-muted-foreground truncate">{invite}</code>
              </div>
              <div className="shrink-0 flex flex-col items-center">
                <Image src={qr} alt="" width={96} height={96} unoptimized className="rounded-lg border border-border" />
                <a href={qr} download={`${d.slug}-qr.png`} className="text-[11px] text-primary mt-1 hover:underline">
                  QR PNG
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
