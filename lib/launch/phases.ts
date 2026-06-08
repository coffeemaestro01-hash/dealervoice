/** Global launch phases — track progress in Admin → Launch tracker. */

export type PhaseStatus = "pending" | "in_progress" | "completed";

export interface LaunchPhase {
  id: string;
  number: number;
  title: string;
  summary: string;
  revenueStreams: string[];
  deliverables: string[];
  status: PhaseStatus;
}

export const GLOBAL_LAUNCH_PHASES: LaunchPhase[] = [
  {
    id: "phase-1",
    number: 1,
    title: "Commission foundation",
    summary: "Geo-targeted affiliate ads, Admitad/global partners, outreach queue active.",
    revenueStreams: ["Affiliate CPC/CPL (insurance, finance)", "Google AdSense (auto ads)"],
    deliverables: [
      "Country-aware ad placements (IN, US, GB, AU)",
      "Affiliate click → income ledger",
      "AdSense verification live",
      "Outreach queue for unclaimed dealers",
    ],
    status: "completed",
  },
  {
    id: "phase-2",
    number: 2,
    title: "Global inventory MVP",
    summary: "VehicleListing schema, dealer listings, country browse, affiliate wrap on listings.",
    revenueStreams: ["Listing SEO traffic", "Insurance CTA on inventory pages", "Marketplace affiliate feeds"],
    deliverables: [
      "VehicleListing model + dealer API",
      "Profile inventory tab",
      "/dealers/{country}/inventory browse",
      "Affiliate domains allowlist (global)",
    ],
    status: "completed",
  },
  {
    id: "phase-3",
    number: 3,
    title: "Dealer B2B (Razorpay)",
    summary: "Pro/Enterprise via Razorpay INR; subscriptions flow to income ledger.",
    revenueStreams: ["Pro subscription ₹16,999/mo", "Enterprise ₹41,999/mo", "Lead fees (roadmap)"],
    deliverables: [
      "Razorpay checkout + webhooks",
      "Invoice → IncomeRecord on payment",
      "Premium inventory link + no competitor ads",
      "Global pricing display (INR settlement)",
    ],
    status: "in_progress",
  },
  {
    id: "phase-4",
    number: 4,
    title: "Worldwide content & SEO",
    summary: "US/UK blog guides, global homepage, sitemap, llms.txt, city guides per market.",
    revenueStreams: ["Organic traffic → affiliates", "AdSense on content pages"],
    deliverables: [
      "US + UK buyer guides seeded",
      "Global homepage hero + coverage section",
      "Blog + dealer pages in sitemap",
      "LinkedIn / press brief live",
    ],
    status: "in_progress",
  },
  {
    id: "phase-5",
    number: 5,
    title: "Enterprise & feeds",
    summary: "Sponsorship billing, DMS/API inventory sync, lead monetization, payout reconciliation.",
    revenueStreams: ["Sponsored city slots", "Pay-per-lead", "Affiliate payout imports", "AdSense manual reconcile"],
    deliverables: [
      "Sponsorship → income ledger",
      "Manual AdSense / affiliate payout entry (admin)",
      "Lead fee config per market",
      "DMS sync placeholder (Enterprise)",
    ],
    status: "in_progress",
  },
];

export const REVENUE_STREAM_GUIDE = [
  {
    stream: "Subscriptions (Razorpay)",
    whoPays: "Dealers — Pro / Enterprise",
    howMuch: "₹16,999–₹41,999/mo INR",
    tracking: "IncomeRecord SUBSCRIPTION · CONFIRMED on webhook",
    yourAction: "Enable Razorpay live keys; dealers upgrade from billing page",
  },
  {
    stream: "Affiliate commissions",
    whoPays: "Insurers / finance networks (Admitad, Impact, etc.)",
    howMuch: "₹150–800+ per insurance lead (IN); varies by US/UK program",
    tracking: "AFFILIATE_CLICK estimated on click; AFFILIATE_PAYOUT when you import actuals",
    yourAction: "Paste tracking links in Admin → Ad revenue per country",
  },
  {
    stream: "Google AdSense",
    whoPays: "Google",
    howMuch: "RPM-based; modest until traffic scales",
    tracking: "ADSENSE — enter monthly payout in Admin → Income",
    yourAction: "Wait for approval; paste monthly earnings",
  },
  {
    stream: "Sponsorship",
    whoPays: "Dealers — featured / city sponsor",
    howMuch: "₹15k+/month manual deals",
    tracking: "SPONSORSHIP when admin records payment",
    yourAction: "Sell slots; record in Admin → Income",
  },
  {
    stream: "Lead fees",
    whoPays: "Dealers per qualified quote",
    howMuch: "₹199–499 IN (configurable)",
    tracking: "LEAD_FEE when lead marked CONVERTED + billed",
    yourAction: "Enable after 10+ claimed dealers",
  },
  {
    stream: "Inventory",
    whoPays: "SEO + affiliate on listing pages",
    howMuch: "Indirect — traffic to insurance/finance CTAs",
    tracking: "Traffic in Site analytics; affiliate on listing CTA clicks",
    yourAction: "Get dealers to upload 5–10 vehicles each",
  },
];
