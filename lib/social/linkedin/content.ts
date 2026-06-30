/**
 * LinkedIn post templates — growth & product focus for DealerVoice company page.
 * Rotated every 3 hours; each template used at most once per 14 days.
 */

export type LinkedInPostTemplate = {
  key: string;
  category: "product" | "growth" | "dealers" | "buyers" | "chicago" | "milestone";
  body: (ctx: LinkedInContext) => string;
  hashtags: string[];
  imageTheme: "trust" | "pro" | "chicago" | "reviews" | "growth" | "badge";
  /** Optional public video URL (mp4) under /marketing/ or CDN */
  videoUrl?: string;
  link?: (ctx: LinkedInContext) => string;
};

export type LinkedInContext = {
  appUrl: string;
  dealerCount: number;
  ilDealerCount: number;
  reviewCount: number;
  chicagolandCount: number;
};

const BASE_TAGS = ["DealerVoice", "Automotive", "CarDealers", "CustomerExperience"];

export const LINKEDIN_TEMPLATES: LinkedInPostTemplate[] = [
  {
    key: "chicagoland-promotion",
    category: "dealers",
    imageTheme: "chicago",
    hashtags: [...BASE_TAGS, "Chicago", "Chicagoland", "AutoDealers", "Enterprise"],
    link: (c) => `${c.appUrl}/promotions`,
    body: () =>
      `Chicagoland Dealership Promotion — live on DealerVoice.\n\nClaim your profile, collect 25 verified buyer reviews, and the first 100 qualified rooftops earn 2 years of Enterprise access.\n\nPlus billing bonuses on every paid plan:\n→ Annual: 2 years of paid features\n→ 6-month: 1 year\n→ Monthly: 45 days (up to 3×)\n\nDetails: dealervoice.io/promotions`,
  },
  {
    key: "chicago-built",
    category: "chicago",
    imageTheme: "chicago",
    hashtags: [...BASE_TAGS, "Chicago", "Illinois", "StartupChicago", "BuiltInChicago"],
    link: (c) => `${c.appUrl}/chicago`,
    body: (c) =>
      `DealerVoice is built in Chicago for buyers who want transparency before they step on the lot.\n\nWe're mapping ${c.ilDealerCount.toLocaleString()}+ Illinois dealerships with verified reviews, trust scores, and direct quote requests — no pay-to-hide bad reviews.\n\nIf you bought or serviced a car in Chicagoland recently, your 2-minute review helps the next buyer.`,
  },
  {
    key: "review-liquidity",
    category: "buyers",
    imageTheme: "reviews",
    hashtags: [...BASE_TAGS, "CarBuying", "Reviews", "TrustMatters", "ChicagoCars"],
    link: (c) => `${c.appUrl}/chicago/review`,
    body: () =>
      `Hot take: the car industry doesn't have a technology problem — it has a trust problem.\n\nDealerVoice gives every buyer a neutral place to share what actually happened: pricing transparency, F&I pressure, service quality, delivery experience.\n\nVerified reviews. Public dealer responses. No anonymous hit jobs.`,
  },
  {
    key: "dealer-claim-free",
    category: "dealers",
    imageTheme: "pro",
    hashtags: [...BASE_TAGS, "DealerMarketing", "ReputationManagement", "AutoRetail"],
    link: (c) => `${c.appUrl}/claim`,
    body: (c) =>
      `Attention Illinois dealers: your store may already be listed on DealerVoice (${c.dealerCount.toLocaleString()}+ rooftops nationwide).\n\nClaiming is free. You get:\n→ Respond to reviews publicly\n→ Review invite links + QR for your sales team\n→ Profile analytics\n\nPro plans add competitor monitoring, featured badges, and website review backlinks.`,
  },
  {
    key: "pro-plus-badge",
    category: "product",
    imageTheme: "badge",
    hashtags: [...BASE_TAGS, "SaaS", "B2B", "DealerTech", "ProPlus"],
    link: (c) => `${c.appUrl}/pricing`,
    body: () =>
      `New on DealerVoice: Pro+ ($349/mo)\n\nFeatured badge on your profile + embeddable review backlink for your website. One click → buyer lands on your page ready to write a review.\n\nPro ($199) · Pro+ ($349) · Enterprise ($2,999.99)\n\nBuilt for dealers who treat reputation as revenue, not vanity.`,
  },
  {
    key: "growth-milestone",
    category: "milestone",
    imageTheme: "growth",
    hashtags: [...BASE_TAGS, "Growth", "Marketplace", "AutoIndustry"],
    link: (c) => `${c.appUrl}/dealers/us`,
    body: (c) =>
      `Platform update: ${c.dealerCount.toLocaleString()} dealerships indexed on DealerVoice.\n\nChicago / Illinois remains our launch wedge — ${c.chicagolandCount.toLocaleString()} Chicagoland listings and growing weekly via verified data imports.\n\nNext milestone: 10,000 published buyer reviews. Every review makes the marketplace more valuable for dealers and buyers alike.`,
  },
  {
    key: "buyer-journey",
    category: "buyers",
    imageTheme: "trust",
    hashtags: [...BASE_TAGS, "CarShopping", "EVs", "UsedCars", "NewCars"],
    link: (c) => `${c.appUrl}/write-review`,
    body: () =>
      `Your car-buying checklist probably includes price, trim, and color.\n\nAdd one more: dealer reputation.\n\nOn DealerVoice you can compare Illinois stores side-by-side — reviews, response rates, and trust scores — before you negotiate.\n\nBought recently? Write a review. Future you (and the next buyer) will thank you.`,
  },
  {
    key: "drip-outreach",
    category: "growth",
    imageTheme: "growth",
    hashtags: [...BASE_TAGS, "Outbound", "EmailMarketing", "DealerOutreach"],
    link: (c) => `${c.appUrl}/advertise`,
    body: () =>
      `We're onboarding Illinois dealers the old-fashioned way: email, phone, and WhatsApp — plus automated outreach to stores that haven't claimed yet.\n\nIf you're a GM who wants your rooftop on a buyer-trusted platform (not another pay-to-play directory), reply here or visit dealervoice.io/claim.`,
  },
  {
    key: "featured-badge-seo",
    category: "product",
    imageTheme: "badge",
    hashtags: [...BASE_TAGS, "SEO", "Backlinks", "LocalSEO", "DealerWebsite"],
    link: (c) => `${c.appUrl}/dashboard/dealer/billing`,
    body: () =>
      `Dealers: your website is your 24/7 salesperson.\n\nDealerVoice Pro+ includes a featured badge + review backlink embed — buyers click through directly to your profile with write-review intent.\n\nMore reviews → higher trust score → more qualified leads. That's the loop we're building in Chicago first.`,
  },
  {
    key: "transparent-f-and-i",
    category: "buyers",
    imageTheme: "reviews",
    hashtags: [...BASE_TAGS, "FandI", "CarBuyingTips", "ConsumerProtection"],
    link: (c) => `${c.appUrl}/chicago`,
    body: () =>
      `"What was your out-the-door price?" should not be a trick question.\n\nDealerVoice reviews capture the full purchase experience — including doc fees, add-ons, and whether the numbers matched what was advertised.\n\nIllinois buyers: compare dealers before you sign.`,
  },
  {
    key: "enterprise-api",
    category: "product",
    imageTheme: "pro",
    hashtags: [...BASE_TAGS, "Enterprise", "API", "DealerGroups", "MultiRooftop"],
    link: (c) => `${c.appUrl}/pricing`,
    body: () =>
      `Dealer groups on Enterprise get API access, white-label options, and up to 5 linked locations on DealerVoice.\n\nOne dashboard for reputation across rooftops. Public trust scores buyers can actually use.\n\n$2,999.99/mo — built for operator-scale, not single-lot experiments.`,
  },
  {
    key: "invite-qr",
    category: "dealers",
    imageTheme: "pro",
    hashtags: [...BASE_TAGS, "QRCode", "CustomerReviews", "SalesProcess"],
    link: (c) => `${c.appUrl}/claim`,
    body: () =>
      `Product tip for dealers: every claimed DealerVoice profile includes a review invite link + printable QR card.\n\nTrain your team to send it after delivery or service RO close. Stores with 10+ verified reviews convert more profile views into quote requests.\n\nClaim free → get your QR in the dealer dashboard.`,
  },
  {
    key: "chicago-wedge-strategy",
    category: "chicago",
    imageTheme: "chicago",
    hashtags: [...BASE_TAGS, "GoToMarket", "ChicagoTech", "WedgeStrategy"],
    link: (c) => `${c.appUrl}/chicago`,
    body: (c) =>
      `Why Chicago first?\n\nDense metro, competitive franchised market, and buyers who research online before visiting the lot. Perfect wedge for a trust layer between dealers and customers.\n\n${c.chicagolandCount.toLocaleString()}+ Chicagoland dealers listed. Reviews are the missing piece — we're fixing that.`,
  },
  {
    key: "lead-fees",
    category: "product",
    imageTheme: "growth",
    hashtags: [...BASE_TAGS, "LeadGen", "AutoLeads", "PerformanceMarketing"],
    link: (c) => `${c.appUrl}/advertise`,
    body: () =>
      `DealerVoice monetization is aligned with outcomes:\n\n• Pro subscriptions for reputation tools\n• Lead fees when a quote converts\n• City sponsorship for visibility\n\nNo hidden ranking payola. Dealers earn visibility through reviews and engagement.`,
  },
  {
    key: "sponsorship-city",
    category: "dealers",
    imageTheme: "chicago",
    hashtags: [...BASE_TAGS, "Sponsorship", "LocalAdvertising", "ChicagoBusiness"],
    link: (c) => `${c.appUrl}/advertise`,
    body: () =>
      `Chicago dealers: city spotlight sponsorship puts your store on the Illinois landing page for 30 days ($299).\n\nPair it with a claimed profile + review push for maximum impact.\n\nLimited slots — first independent stores in each suburb win the visibility.`,
  },
  {
    key: "review-count",
    category: "milestone",
    imageTheme: "reviews",
    hashtags: [...BASE_TAGS, "SocialProof", "UGC", "Community"],
    link: (c) => `${c.appUrl}/chicago/review`,
    body: (c) =>
      `Marketplace health metric we watch daily: published reviews.\n\nCurrent count: ${c.reviewCount.toLocaleString()}\nTarget: 10,000 verified buyer reviews\n\nEvery review strengthens the platform for dealers investing in reputation and buyers researching their next purchase.`,
  },
  {
    key: "whatsapp-dealers",
    category: "growth",
    imageTheme: "growth",
    hashtags: [...BASE_TAGS, "WhatsApp", "Sales", "DealerRelations"],
    link: (c) => `${c.appUrl}/claim`,
    body: () =>
      `Illinois GMs: we'd rather talk than spam.\n\nWhatsApp us for a 5-minute walkthrough of your DealerVoice listing, claim flow, and Pro pilot ($1/mo intro for early partners).\n\nBuilt in Chicago. Expanding nationwide from a trust-first wedge.`,
  },
];

/** Expand pool by generating variant intros so we never run dry */
export function expandLinkedInPool(): LinkedInPostTemplate[] {
  const extras: LinkedInPostTemplate[] = [];
  const hooks = [
    "Platform note:",
    "Building in public:",
    "DealerVoice update:",
    "For Chicago car buyers:",
    "For Illinois dealers:",
    "Product shipped:",
    "Why we're building this:",
    "Trust layer for auto retail:",
  ];
  hooks.forEach((hook, i) => {
    extras.push({
      key: `variant-hook-${i}`,
      category: "growth",
      imageTheme: i % 2 === 0 ? "growth" : "trust",
      hashtags: [...BASE_TAGS, "BuildInPublic", "Startup", "AutoTech"],
      link: (c) => `${c.appUrl}/chicago`,
      body: (c) =>
        `${hook} DealerVoice indexes ${c.dealerCount.toLocaleString()}+ dealerships with verified buyer reviews and dealer response tools. Illinois is live — Chicagoland dealers can claim free today.`,
    });
  });
  return [...LINKEDIN_TEMPLATES, ...extras];
}

export function renderPost(template: LinkedInPostTemplate, ctx: LinkedInContext) {
  const link = template.link?.(ctx);
  const tags = template.hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
  const body = template.body(ctx);
  const linkLine = link ? `\n\n→ ${link}` : "";
  return `${body}${linkLine}\n\n${tags}`.trim();
}
