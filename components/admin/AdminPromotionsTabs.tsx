"use client";

import { useState } from "react";
import { AdminPromotionsManager } from "@/components/admin/AdminPromotionsManager";
import { AdminCampaignPromotionsPanel } from "@/components/admin/AdminCampaignPromotionsPanel";
import { cn } from "@/lib/utils";

type Tab = "codes" | "campaigns";

export function AdminPromotionsTabs() {
  const [tab, setTab] = useState<Tab>("campaigns");

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-border/60">
        {(
          [
            ["campaigns", "Campaigns & Jackpot"],
            ["codes", "Discount codes"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "codes" ? <AdminPromotionsManager /> : <AdminCampaignPromotionsPanel />}
    </div>
  );
}
