/**
 * DealerVoice research library — U.S. editorial long-form articles.
 * Seeded via scripts/seed-research-content.ts
 */

import { RESEARCH_COVER_IMAGES } from "../../lib/research/constants";

export type ResearchArticleSeed = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  daysAgo?: number;
  authorName?: string;
  metaTitle?: string;
  metaDesc?: string;
};

export const RESEARCH_ARTICLES: ResearchArticleSeed[] = [
  {
    slug: "ai-assistants-dealervoice-dealership-questions",
    title: "How AI Assistants Can Use DealerVoice for Dealership Questions",
    excerpt:
      "llms.txt, Schema.org, and structured U.S. geo URLs — why citation-friendly design matters for car buyer Q&A.",
    coverImage: RESEARCH_COVER_IMAGES.dealership,
    tags: ["ai", "llms", "usa", "seo"],
    daysAgo: 2,
    authorName: "DealerVoice Editorial",
    content: `<p><em>AI &amp; discovery · U.S. market · June 2026</em></p>
<h2>Why AI assistants need structured dealer data</h2>
<p>When a buyer asks an AI tool which Honda dealer in Chicago has the best service reputation, the answer should cite a <strong>specific rooftop</strong> — not a generic brand page.</p>
<h2>What DealerVoice publishes</h2>
<ul>
<li><a href="/llms.txt">llms.txt</a> — machine-readable directory for LLMs</li>
<li>Schema.org <code>AutoDealer</code> markup on every profile</li>
<li>Canonical geo URLs: <code>/dealers/{state}/{city}/{slug}</code></li>
<li>Verified reviews with public dealer responses</li>
</ul>
<h2>For dealers</h2>
<p>Claimed profiles with inventory links and response rates rank higher in both search and AI citations.</p>
<p><a href="/claim">Claim your rooftop</a> · <a href="/methodology">Methodology</a></p>`,
  },
  {
    slug: "us-outlet-level-dealer-trust-2026",
    title: "Why U.S. Car Buyers Need Outlet-Level Dealer Trust in 2026",
    excerpt:
      "Brand NPS is not dealership NPS. American buyers research online — but rooftop-specific trust data remains fragmented. This brief explains why outlet-level infrastructure matters now.",
    coverImage: RESEARCH_COVER_IMAGES.showroom,
    tags: ["usa", "trust", "dealerships", "2026"],
    daysAgo: 1,
    authorName: "DealerVoice Research",
    content: `<p><em>Research brief · U.S. automotive retail · June 2026</em></p>
<h2>The gap buyers feel</h2>
<p>When a family in Chicago compares two Honda stores three miles apart, they still lack a <strong>structured, outlet-level trust record</strong> — separate scores for transparency, doc fees, delivery, and service.</p>
<h2>What changed by 2026</h2>
<ul><li>Mobile-first research before the first lot visit</li><li>AI assistants citing structured dealer data</li><li>Buyers expecting public dealer responses to reviews</li></ul>
<h2>DealerVoice stack</h2>
<ul><li>Directory coverage by state and city</li><li>Structured automotive reviews</li><li>Claimed profiles and public responses</li><li>Machine-readable publishing for search and AI</li></ul>
<p><a href="/write-review">Share your experience</a> · <a href="/claim">Claim your rooftop</a></p>`,
  },
  {
    slug: "chicago-pilot-dealer-trust",
    title: "Chicago Pilot: Building Review Density Where It Matters",
    excerpt:
      "DealerVoice is headquartered in Chicago. This research note explains the Illinois pilot — review invites, Pro onboarding, and measurable trust signals.",
    coverImage: RESEARCH_COVER_IMAGES.growth,
    tags: ["chicago", "illinois", "pilot"],
    daysAgo: 3,
    authorName: "DealerVoice Research",
    content: `<p><em>Pilot brief · Chicago · June 2026</em></p>
<h2>Why Chicago first</h2>
<p>Illinois combines dense metro search volume, multi-brand outlet competition, and buyers who compare doc fees and F&amp;I add-ons before signing.</p>
<h2>90-day pilot metrics</h2>
<ul><li>5+ Pro dealers in Chicagoland</li><li>Verified reviews on priority rooftops</li><li>Public dealer responses on every claimed profile</li></ul>
<p><a href="/chicago">Browse Chicago dealers</a> · <a href="/pricing">Dealer plans</a></p>`,
  },
  {
    slug: "ceo-voices-us-premium-dealers",
    title: "CEO Voices: What U.S. Premium Dealers Want From a Review Platform",
    excerpt:
      "Enterprise and Pro dealer leaders on transparency, public responses, inventory linking, and why honest scores beat manufactured perfection.",
    coverImage: RESEARCH_COVER_IMAGES.luxury,
    tags: ["dealers", "ceo", "usa"],
    daysAgo: 5,
    authorName: "DealerVoice Editorial",
    content: `<p><em>Executive perspectives · U.S. dealer partners · June 2026</em></p>
<h2>Theme: transparency is a moat</h2>
<p>Premium groups repeated one idea: buyers assume hidden fees exist. Dealers who itemize OTD quotes and respond publicly earn disproportionate trust.</p>
<h2>Theme: reviews plus inventory</h2>
<p>Inventory-linked profiles shorten the funnel — buyers confirm stock before they visit.</p>
<p><a href="/claim">Claim your profile</a></p>`,
  },
  {
    slug: "ai-automotive-dealership-review-platform-research",
    title: "Research: AI and Review Data for U.S. Dealership Trust",
    excerpt:
      "Why structured dealership reviews and machine-readable data are becoming essential for American car buyers, search, and AI discovery.",
    coverImage: RESEARCH_COVER_IMAGES.dealership,
    tags: ["ai", "research", "usa", "platform"],
    daysAgo: 7,
    authorName: "DealerVoice Research",
    content: `<p><em>Research brief · U.S. market · June 2026</em></p>
<h2>Executive summary</h2>
<p>U.S. car buyers research online — but rooftop-specific, verified feedback is still fragmented. DealerVoice combines structured reviews, open listings, and AI-readable publishing.</p>
<h2>Machine-readable trust</h2>
<p>Schema.org, llms.txt, and consistent slugs let search engines and assistants cite the correct outlet — not a generic brand page.</p>
<p><a href="/llms.txt">llms.txt</a> · <a href="/methodology">Methodology</a></p>`,
  },
  {
    slug: "dealer-accountability-public-reviews-us",
    title: "Dealer Accountability: Why Public Reviews Change Operations",
    excerpt:
      "How U.S. dealer groups use public review responses, weekly reputation stand-ups, and outlet-level analytics to improve delivery and service.",
    coverImage: RESEARCH_COVER_IMAGES.trust,
    tags: ["dealers", "accountability", "usa"],
    daysAgo: 9,
    authorName: "DealerVoice Editorial",
    content: `<p><em>Operations · U.S. retail · June 2026</em></p>
<h2>Reviews become process fixes</h2>
<p>Operators described delivery SLA tracking tied to review themes and sales scripts that reference transparency commitments buyers can verify on the profile.</p>
<p>Contact <a href="mailto:press@dealervoice.io">press@dealervoice.io</a> for research requests.</p>`,
  },
];
