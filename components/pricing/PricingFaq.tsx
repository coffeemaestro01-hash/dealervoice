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
    q: "What does Pro remove from my profile?",
    answer:
      "Free profiles may show sponsored competitor placements to buyers. Pro removes those ads on your listing, adds a live inventory link, analytics, AI reply suggestions, and support for up to five locations.",
  },
  {
    q: "Who should choose Enterprise?",
    answer:
      "Dealer groups and multi-city chains that need unlimited locations, API access, white-label reporting, and a dedicated account manager. Contact us for a tailored quote.",
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
    <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {FAQS.map((item, i) => (
        <div key={item.q}>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-semibold text-gray-900 text-sm md:text-base">{item.q}</span>
            <ChevronDown size={18} className={cn("shrink-0 text-gray-400 transition-transform", open === i && "rotate-180")} />
          </button>
          {open === i && (
            <div className="px-6 pb-5 -mt-1 text-sm text-gray-600 leading-relaxed">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
