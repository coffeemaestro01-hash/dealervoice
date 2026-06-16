"use client";

import { useState } from "react";
import { Copy, Check, Code, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FeaturedPlanBadge } from "@/components/dealer/FeaturedPlanBadge";
import type { PaidPlan } from "@/lib/dealer/featured-badge";
import {
  buildFeaturedBadgeEmbedBlock,
  buildFeaturedBadgeEmbedHtml,
  buildFeaturedBadgeMarkdown,
  dealerBacklinkUrl,
} from "@/lib/reviews/backlink";

interface Props {
  slug: string;
  dealerName: string;
  plan: PaidPlan;
}

export function DealerFeaturedBadgeEmbed({ slug, dealerName, plan }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<"html" | "block" | "md" | "link" | null>(null);

  const reviewLink = dealerBacklinkUrl(slug);
  const embedHtml = buildFeaturedBadgeEmbedHtml(slug, dealerName, plan);
  const embedBlock = buildFeaturedBadgeEmbedBlock(slug, dealerName, plan);
  const markdown = buildFeaturedBadgeMarkdown(slug, dealerName);

  const copy = async (text: string, kind: typeof copied, label: string) => {
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
    <div className="rounded-xl border border-border bg-card p-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Link2 size={18} className="text-primary" />
            Featured badge & review backlink
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Embed on your website or email signature. Links land on your profile with write-review intent.
          </p>
        </div>
        <FeaturedPlanBadge plan={plan} size="md" />
      </div>

      <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 mb-4">
        <p className="text-xs text-muted-foreground mb-2">Preview</p>
        <div
          className="inline-block"
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <code className="flex-1 text-xs bg-muted border border-border rounded-lg px-3 py-2 truncate text-foreground">
            {reviewLink}
          </code>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => copy(reviewLink, "link", "Review link")}
            className="shrink-0 gap-1.5"
          >
            {copied === "link" ? <Check size={14} /> : <Copy size={14} />}
            Copy link
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => copy(embedHtml, "html", "HTML badge")}
          >
            <Code size={14} />
            {copied === "html" ? "Copied" : "Copy HTML badge"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => copy(embedBlock, "block", "HTML block")}
          >
            <Code size={14} />
            {copied === "block" ? "Copied" : "Copy HTML + attribution"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => copy(markdown, "md", "Markdown link")}
          >
            {copied === "md" ? "Copied" : "Copy Markdown"}
          </Button>
        </div>
      </div>
    </div>
  );
}
