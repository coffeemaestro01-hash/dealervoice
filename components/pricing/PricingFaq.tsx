"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Can I start with a free profile?",
    answer:
      "Yes. Claim your dealership for free, respond to reviews, and manage one location. Upgrade when you want to remove competitor ads, list inventory, and unlock analytics.",
  },
  {
    q: "How does billing work?",
    answer:
      "All paid plans are billed in USD through Stripe. You can pay with major credit and debit cards. Annual billing saves approximately 17% compared to monthly.",
  },
  {
    q: "What are service areas?",
    answer:
      "Every dealership can list cities and towns they serve beyond their physical address. Free plans include 5 service areas, Pro 15, Pro+ 35, and Enterprise 50 — with Enterprise dealers pinned to the top of applicable location directories.",
  },
  {
    q: "What does Pro remove from my profile?",
    answer:
      "Free profiles may show sponsored competitor placements to buyers. Pro removes those ads on your listing, adds a live inventory link, analytics, AI reply suggestions, and up to 15 service areas.",
  },
  {
    q: "Who should choose Enterprise?",
    answer:
      "Dealer groups that need 50 service areas, top directory placement, CEO research interviews, highest lead priority, API access, and the ability to link 5 same-owner locations under one account — $2,999.99/month.",
  },
  {
    q: "Can I switch plans later?",
    answer:
      "You can upgrade or change billing cycle from your dealer dashboard billing page. Downgrades take effect at the end of the current billing period.",
  },
  {
    q: "Do buyers pay anything?",
    answer:
      "No. Reading reviews, browsing dealers, and writing reviews are free for car buyers. Only dealerships pay for premium visibility and tools.",
  },
];

export function PricingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
      {FAQS.map((item, i) => (
        <div key={item.q}>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-semibold text-foreground text-sm md:text-base">{item.q}</span>
            <ChevronDown size={18} className={cn("shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")} />
          </button>
          {open === i && (
            <div className="px-6 pb-5 -mt-1 text-sm text-muted-foreground leading-relaxed">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
