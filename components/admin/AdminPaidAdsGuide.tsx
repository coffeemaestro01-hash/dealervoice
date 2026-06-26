"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Target, Gift, Search, Linkedin } from "lucide-react";

const BUDGET_ROWS = [
  { channel: "Google Search", budget: "$400–800", note: "Chicago dealer review keywords → /chicago/review" },
  { channel: "Meta retargeting", budget: "$150–400", note: "Visited /dealership/* but no review" },
  { channel: "Gift cards (10 reviews)", budget: "$250 one-time", note: "$25 Amazon/Chevron after verified publish" },
  { channel: "Test reserve", budget: "$100–150", note: "Headline/keyword experiments" },
] as const;

export function AdminPaidAdsGuide() {
  return (
    <div className="bg-card rounded-xl border border-primary/20 p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Target size={18} className="text-primary" />
          Paid growth — $500–1,500/mo (highest ROI)
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Run in your Google + Meta accounts. Full step-by-step:{" "}
          <code className="text-xs">docs/REVENUE-ADS-PLAYBOOK.md</code>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="pb-2 pr-4 font-medium">Channel</th>
              <th className="pb-2 pr-4 font-medium">Budget</th>
              <th className="pb-2 font-medium">Focus</th>
            </tr>
          </thead>
          <tbody>
            {BUDGET_ROWS.map((row) => (
              <tr key={row.channel} className="border-b border-border/50 last:border-0">
                <td className="py-2 pr-4 font-medium text-foreground">{row.channel}</td>
                <td className="py-2 pr-4 text-primary">{row.budget}</td>
                <td className="py-2 text-muted-foreground">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <GuideCard
          icon={Search}
          title="Google Ads"
          steps={[
            "Campaign: Search, Chicago DMA, $15–25/day",
            "Keywords: \"chicago car dealer reviews\", illinois dealership reviews",
            "Landing: dealervoice.io/chicago/review",
            "Target CPC ≤ $8 · conversion = review submitted",
          ]}
        />
        <GuideCard
          icon={Target}
          title="Meta retargeting"
          steps={[
            "Install Meta Pixel on site",
            "Audience: /dealership/* visitors, 30 days",
            "Exclude review completers",
            "$5–12/day · CTA to /chicago/review",
          ]}
        />
        <GuideCard
          icon={Gift}
          title="$25 gift cards"
          steps={[
            "First 10 verified Chicagoland reviews",
            "Banner on /chicago/review + ad copy mention",
            "~$250 total · faster than months of dev",
            "Fulfill via Tremendous / Tango / Amazon bulk",
          ]}
        />
        <GuideCard
          icon={Linkedin}
          title="LinkedIn (organic)"
          steps={[
            "Autopilot: every 3h on company page",
            <>
              Admin:{" "}
              <Link href="/dashboard/admin/social" className="text-primary hover:underline">
                LinkedIn autopilot
              </Link>
            </>,
            "Skip LinkedIn paid until 50+ reviews",
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <a
          href="https://ads.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Google Ads <ExternalLink size={12} />
        </a>
        <a
          href="https://business.facebook.com/adsmanager"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Meta Ads Manager <ExternalLink size={12} />
        </a>
        <Link href="/chicago/review" className="text-primary hover:underline">
          Preview landing page →
        </Link>
      </div>
    </div>
  );
}

function GuideCard({
  icon: Icon,
  title,
  steps,
}: {
  icon: typeof Search;
  title: string;
  steps: (string | ReactNode)[];
}) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <h3 className="font-medium text-foreground flex items-center gap-2 mb-2">
        <Icon size={14} className="text-primary" />
        {title}
      </h3>
      <ul className="text-muted-foreground space-y-1 list-disc list-inside text-xs">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
