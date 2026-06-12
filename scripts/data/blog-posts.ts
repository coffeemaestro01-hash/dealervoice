/**
 * DealerVoice blog library — U.S. buyer guides and dealer insights.
 * Seeded via scripts/seed-blog-content.ts
 */

export type BlogPostSeed = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  content: string;
  daysAgo?: number;
  authorName?: string;
};

export const BLOG_POSTS: BlogPostSeed[] = [
  {
    slug: "how-to-review-car-dealership-usa",
    title: "How to Review a Car Dealership in the United States",
    excerpt: "What to include in a DealerVoice review — doc fees, F&I, delivery, and service — so other buyers benefit.",
    category: "Guides",
    tags: ["usa", "reviews", "buyers"],
    daysAgo: 14,
    content: `<h2>Why your review matters</h2>
<p>Two Ford dealers on the same street can charge different doc fees, push different add-ons, and deliver on different timelines. Your review helps the next buyer compare <strong>outlets</strong>, not just brands.</p>
<ul><li>Note doc fee and add-ons on the contract</li><li>Sales vs service visit</li><li>Delivery timeline vs promise</li></ul>
<p><a href="/dealers/us">Browse U.S. dealerships</a> · <a href="/write-review">Write a review</a></p>`,
  },
  {
    slug: "chicago-car-dealer-doc-fees",
    title: "Chicago Car Dealer Doc Fees: What Illinois Buyers Should Know",
    excerpt: "Documentation fees, nitrogen fills, and market adjustments — a Chicago metro buyer checklist before you sign.",
    category: "Cities",
    tags: ["chicago", "illinois", "fees"],
    daysAgo: 12,
    content: `<h2>Illinois buyers face real variance</h2>
<p>Doc fees, add-ons, and F&amp;I products differ by rooftop — even within the Chicago metro. Ask for an itemized out-the-door price in writing and compare three dealers.</p>
<p><a href="/chicago">Explore Chicago dealers</a> · <a href="/write-review">Share your experience</a></p>`,
  },
  {
    slug: "dealer-red-flags-usa",
    title: "7 Red Flags When Buying from a U.S. Car Dealer",
    excerpt: "Warning signs at American dealerships — from yo-yo financing to mystery fees — and how to protect yourself.",
    category: "Buyer safety",
    tags: ["usa", "tips", "dealers"],
    daysAgo: 10,
    content: `<h2>Before you sign</h2>
<ol><li>Refusal to provide itemized OTD quote in writing</li><li>Pressure to buy add-ons in the F&amp;I office</li><li>No test drive or VIN verification for used cars</li><li>Verbal promises not on the contract</li><li>Negative patterns in recent buyer reviews</li><li>Spot delivery without final lender approval</li><li>Missing title or temp-tag paperwork at delivery</li></ol>
<p>Cross-check the dealer on <a href="/dealers/us">DealerVoice</a> before you leave a deposit.</p>`,
  },
  {
    slug: "fi-office-guide-us-buyers",
    title: "The F&I Office: A U.S. Car Buyer's Survival Guide",
    excerpt: "GAP, VSC, tire & wheel, and paint protection — what's optional, what's negotiable, and what to decline.",
    category: "Finance",
    tags: ["usa", "fi", "finance"],
    daysAgo: 9,
    content: `<h2>You can say no</h2>
<p>Most F&amp;I products are optional. Compare dealer-offered GAP and warranties against your insurer and credit union before signing.</p>
<p>Document what you were offered in a <a href="/write-review">DealerVoice review</a> — it helps the next buyer.</p>`,
  },
  {
    slug: "texas-car-dealer-fees-guide",
    title: "Texas Car Dealer Fees: What Buyers Should Question",
    excerpt: "Documentation fees, tint packages, and market adjustments — a Texas-specific buyer checklist.",
    category: "Cities",
    tags: ["texas", "usa", "fees"],
    daysAgo: 8,
    content: `<h2>Texas market</h2>
<p>Houston, DFW, Austin, and San Antonio markets are competitive — yet fee structures still vary dealer to dealer.</p>
<p><a href="/dealers/us">Find dealers in the U.S.</a></p>`,
  },
  {
    slug: "ev-dealership-buying-guide-usa",
    title: "Buying an EV from a U.S. Dealership: What to Ask First",
    excerpt: "Home charger install, battery warranty, tax credits, and service network — an EV checklist for American showrooms.",
    category: "Guides",
    tags: ["usa", "ev", "electric"],
    daysAgo: 7,
    content: `<h2>EV purchases add new variables</h2>
<ul><li>Included Level 2 charger and install responsibility</li><li>Battery warranty years and mileage cap</li><li>Nearest authorized service with HV-trained techs</li><li>Federal/state EV incentive documentation</li></ul>
<p><a href="/write-review">Review your EV dealer visit</a></p>`,
  },
  {
    slug: "used-car-dealer-checklist-usa",
    title: "Used Car Dealers in the U.S.: Inspection and Title Checklist",
    excerpt: "Carfax, pre-purchase inspection, title brands, and what to put in your DealerVoice review.",
    category: "Guides",
    tags: ["usa", "used-cars"],
    daysAgo: 6,
    content: `<h2>Used-car diligence</h2>
<ul><li>Run vehicle history (Carfax / AutoCheck)</li><li>Independent PPI before purchase</li><li>Confirm lien release and title status</li></ul>
<p><a href="/dealers/us">Browse U.S. dealers</a></p>`,
  },
  {
    slug: "claim-dealership-profile-guide",
    title: "How Dealers Claim Their Profile on DealerVoice",
    excerpt: "Free profile claim, review responses, and Pro tools — built for U.S. rooftops starting in Chicago.",
    category: "Dealers",
    tags: ["dealers", "claim", "usa"],
    daysAgo: 5,
    content: `<h2>Claim in minutes</h2>
<p>Search your rooftop, verify ownership, and respond to reviews publicly. Pro adds analytics, review invites, and inventory links — billed via Stripe.</p>
<p><a href="/claim">Start a claim →</a> or email <a href="mailto:dealers@dealervoice.io">dealers@dealervoice.io</a></p>`,
  },
  {
    slug: "online-reputation-management-us-dealers",
    title: "Online Reputation Management for U.S. Car Dealers",
    excerpt: "Why outlet-level reviews beat brand NPS — and how Chicago dealers are using public responses to win trust.",
    category: "Dealers",
    tags: ["dealers", "reputation", "usa"],
    daysAgo: 4,
    content: `<h2>Outlet beats brand</h2>
<p>Buyers compare individual rooftops. Responding to reviews, sharing invite links, and keeping inventory current compounds local trust.</p>
<p><a href="/pricing">View dealer plans</a></p>`,
  },
  {
    slug: "dealervoice-chicago-launch",
    title: "DealerVoice in Chicago: Building Outlet-Level Trust in Illinois",
    excerpt: "We're headquartered in Chicago — dealership reviews, inventory, and transparent scores for Illinois buyers.",
    category: "Press",
    tags: ["chicago", "launch", "press"],
    daysAgo: 3,
    content: `<p><em>Press brief · June 2026</em></p>
<h2>Built in Chicago</h2>
<p>DealerVoice is a U.S. automotive dealership review platform headquartered in Chicago, Illinois. Buyers compare rooftops, read structured reviews, and request quotes before visiting the lot.</p>
<p><a href="/chicago">Chicago dealers</a> · <a href="/methodology">Our methodology</a></p>`,
  },
  {
    slug: "methodology-transparency-us",
    title: "How DealerVoice Scores U.S. Dealerships",
    excerpt: "Reputation scoring, verification, and why paid plans never buy a higher rating.",
    category: "Platform",
    tags: ["methodology", "trust", "usa"],
    daysAgo: 2,
    content: `<h2>Transparent scoring</h2>
<p>Scores reflect published reviews — star average, volume, verification, recency, and dealer responses. Pro and Enterprise unlock tools, not ratings.</p>
<p><a href="/methodology">Full methodology →</a></p>`,
  },
  {
    slug: "first-review-chicago-buyer",
    title: "Be the First to Review a Chicago Dealership",
    excerpt: "Illinois review density is still growing — your experience helps the next buyer on DealerVoice.",
    category: "Guides",
    tags: ["chicago", "reviews"],
    daysAgo: 1,
    content: `<p>Visited a dealer in Chicago or the suburbs? A short, factual review — doc fees, delivery, service — builds the trust layer Illinois buyers need.</p>
<p><a href="/write-review">Write a review →</a> · <a href="/chicago">Browse Chicago dealers</a></p>`,
  },
];
