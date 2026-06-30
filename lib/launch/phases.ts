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
    summary: "Geo affiliate ads, outreach drip, Chicago landing page.",
    revenueStreams: ["Affiliate CPC/CPL", "AdSense (parked pending approval)"],
    deliverables: [
      "Country-aware ad placements (US, GB, AU, IN)",
      "Affiliate click → income ledger",
      "Automated 3-email outreach drip + email discovery cron",
      "/chicago dealer landing page",
    ],
    status: "completed",
  },
  {
    id: "phase-2",
    number: 2,
    title: "Global inventory MVP",
    summary: "VehicleListing schema, dealer UI, Enterprise API sync.",
    revenueStreams: ["Listing SEO traffic", "Insurance CTAs on inventory"],
    deliverables: [
      "VehicleListing model + dealer API",
      "POST /api/v1/inventory (Enterprise DMS sync)",
      "/dealers/{country}/inventory browse",
    ],
    status: "completed",
  },
  {
    id: "phase-3",
    number: 3,
    title: "Dealer B2B (Stripe USD)",
    summary: "Pro/Enterprise via Stripe; promo codes; welcome email; admin alerts.",
    revenueStreams: ["Pro $199/mo", "Pro+ $349/mo", "Enterprise $2,999.99/mo", "Per-dealer pilot codes"],
    deliverables: [
      "Stripe Checkout + webhooks",
      "Admin → Promotions (global + per-dealer)",
      "Post-payment welcome email",
      "Slack/email alert on new subscription",
    ],
    status: "completed",
  },
  {
    id: "phase-4",
    number: 4,
    title: "Lead & sponsorship monetization",
    summary: "Auto lead fees on conversion; Stripe sponsorship checkout.",
    revenueStreams: ["Lead fee $49/converted quote", "City sponsorship $299/30d"],
    deliverables: [
      "Dealer marks lead CONVERTED → Stripe invoice",
      "/advertise sponsorship checkout (no manual admin entry)",
      "Income ledger LEAD_FEE + SPONSORSHIP",
    ],
    status: "completed",
  },
  {
    id: "phase-5",
    number: 5,
    title: "Scale reviews & Chicago wedge",
    summary: "Review supply, 5+ Pro dealers in Illinois, drip pipeline full.",
    revenueStreams: ["Subscriptions", "Lead fees", "Sponsorships"],
    deliverables: [
      "Illinois email discovery cron (Tues 6:00 UTC)",
      "5+ paying Pro dealers in Chicago metro",
      "50+ verified reviews in wedge city",
      "Admitad/AdSense (optional — parked)",
    ],
    status: "in_progress",
  },
];

export const REVENUE_STREAM_GUIDE = [
  {
    stream: "Subscriptions (Stripe USD)",
    whoPays: "Dealers — Pro / Enterprise",
    howMuch: "$199–$2,999.99/mo",
    tracking: "IncomeRecord SUBSCRIPTION on webhook",
    yourAction: "Private promo codes for pilot dealers",
  },
  {
    stream: "Lead fees",
    whoPays: "Dealers when a quote converts",
    howMuch: "$49 default (Stripe invoice)",
    tracking: "LEAD_FEE on CONVERTED status",
    yourAction: "Dealers mark leads sold in dashboard",
  },
  {
    stream: "Sponsorship",
    whoPays: "Dealers — featured placement",
    howMuch: "$299 city / $499 homepage (30 days)",
    tracking: "SPONSORSHIP on Stripe checkout.session.completed",
    yourAction: "Share /advertise link with dealers",
  },
  {
    stream: "Affiliate commissions",
    whoPays: "Partner networks",
    howMuch: "Varies — parked until Admitad approvals",
    tracking: "AFFILIATE_CLICK",
    yourAction: "Optional — paste links when approved",
  },
  {
    stream: "Google AdSense",
    whoPays: "Google",
    howMuch: "RPM-based",
    tracking: "ADSENSE manual entry",
    yourAction: "Parked — waiting approval",
  },
];
