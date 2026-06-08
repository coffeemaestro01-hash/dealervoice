/**
 * DealerVoice research library — editorial, photo-friendly long-form articles.
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
    slug: "india-outlet-level-dealer-trust-2026",
    title: "Why India Needs Outlet-Level Dealer Trust Infrastructure in 2026",
    excerpt:
      "Brand NPS is not dealership NPS. India's car buyers research online — but outlet-specific trust data remains fragmented. This research brief explains why 2026 is the inflection year for dealership reputation infrastructure.",
    coverImage: RESEARCH_COVER_IMAGES.showroom,
    tags: ["india", "trust", "dealerships", "2026"],
    daysAgo: 1,
    authorName: "DealerVoice Research",
    content: `<p><em>Research brief · India automotive retail · June 2026</em></p>

<h2>The gap buyers feel but cannot name</h2>
<p>Every major OEM in India publishes a dealer locator. Every buyer checks Google Maps for phone numbers and star ratings. Yet when a family in Pune compares two Hyundai outlets three kilometres apart, they still lack a <strong>structured, outlet-level trust record</strong> — separate scores for transparency, on-road pricing, delivery timelines, and after-sales service.</p>
<p>That gap is not a UX inconvenience. It is a market failure. Car purchase is among the largest discretionary spends in Indian households, and the <em>dealership</em> — not the brand alone — determines whether the experience feels fair.</p>

<h2>Why outlet-level matters more than brand-level</h2>
<p>Manufacturers measure brand satisfaction. Buyers live dealership satisfaction. Two realities coexist:</p>
<ul>
<li>The same Maruti Arena outlet that delivers on time in Indiranagar may face delivery complaints in Whitefield.</li>
<li>A premium German badge does not guarantee transparent accessory bundling at every authorized partner.</li>
<li>Used-car lots with identical inventory photos can differ radically on title clarity and refurbishment honesty.</li>
</ul>
<p>Aggregating sentiment at brand level hides the variance that actually drives buyer regret. <strong>Outlet-level infrastructure</strong> makes variance visible — and therefore fixable.</p>

<h2>What changed by 2026</h2>
<p>Three forces converged:</p>
<ol>
<li><strong>Mobile-first research</strong> — Buyers complete 60%+ of shortlisting on phones before the first showroom visit.</li>
<li><strong>AI-mediated discovery</strong> — Assistants answer "which dealer should I trust?" only when structured, citable data exists.</li>
<li><strong>Regulatory attention on data</strong> — DPDP-era privacy expectations mean verified reviews and transparent moderation are table stakes, not marketing fluff.</li>
</ol>
<p>Platforms that publish methodology, separate editorial from sponsorship, and tie reviews to specific dealership profiles become <em>infrastructure</em>. Platforms that treat dealers as generic local businesses do not.</p>

<h2>The infrastructure stack</h2>
<p>DealerVoice models outlet-level trust as four layers:</p>
<ul>
<li><strong>Directory coverage</strong> — Public dealership listings with state and district URLs matching how Indians search.</li>
<li><strong>Structured reviews</strong> — Automotive-specific rating dimensions, optional purchase/service verification.</li>
<li><strong>Dealer accountability</strong> — Claimed profiles, public responses, inventory links for premium partners.</li>
<li><strong>Machine-readable publishing</strong> — Schema.org, llms.txt, and consistent slugs so search and AI systems cite correct outlets.</li>
</ul>

<h2>Implications for dealers</h2>
<p>Dealers who treat reviews as threat will lose local SEO to competitors who respond publicly. Dealers who claim profiles early shape the narrative before review volume spikes. Enterprise groups need roll-up analytics — not a single averaged star on a map pin.</p>
<p>Premium subscriptions and clearly labelled sponsorship fund the platform; <a href="/methodology">scores are not for sale</a>. That separation is what makes the infrastructure credible to buyers.</p>

<h2>Conclusion</h2>
<p>India does not need another star rating widget. It needs <strong>outlet-level dealer trust infrastructure</strong> — auditable, structured, and independent of pay-to-win dynamics. 2026 is the year buyers, AI systems, and forward-looking dealer groups either adopt that layer or keep improvising with screenshots and WhatsApp forwards.</p>
<p><a href="/write-review">Share your dealership experience</a> · <a href="/claim">Claim your outlet</a></p>`,
  },
  {
    slug: "ceo-voices-premium-dealers-review-platform",
    title: "CEO Voices: What Premium Dealers Want From a Review Platform",
    excerpt:
      "Four Pro, Enterprise, and sponsored dealership leaders on transparency, public responses, inventory linking, and why honest scores beat manufactured perfection.",
    coverImage: RESEARCH_COVER_IMAGES.luxury,
    tags: ["dealers", "ceo", "premium", "interviews"],
    daysAgo: 3,
    authorName: "DealerVoice Editorial",
    content: `<p><em>Executive perspectives · Premium dealership partners · June 2026</em></p>

<h2>Introduction</h2>
<p>Generic review sites flatten automotive retail into "local business" ratings. Premium dealer groups — multi-outlet operators with enterprise CRM stacks and training academies — need something different: <strong>outlet-level accountability</strong>, public response tools, inventory discovery, and a bright line between sponsorship and score integrity.</p>
<p>We spoke with four DealerVoice premium partners across Bengaluru, Mumbai, Delhi NCR, and Chennai. Their quotes appear in the spotlight cards above; this article expands on the themes they raised.</p>

<h2>Theme 1: Transparency is a competitive moat</h2>
<p>Across interviews, CEOs repeated one idea: buyers already assume hidden charges exist. The dealer who itemises on-road quotes, publishes delivery timelines, and responds to negative reviews without deflection earns disproportionate trust.</p>
<p>Rajesh Menon (Prestige Motors Bengaluru) noted that luxury buyers compare outlets within the same brand — not just brands. Enterprise analytics let his team see which outlet drags group NPS before OEM audits do.</p>

<h2>Theme 2: Reviews plus inventory shortens the funnel</h2>
<p>Priya Shah (Horizon Auto Mumbai) linked Pro-tier inventory URLs to shorter research cycles. Buyers who confirm stock online arrive with intent; staff spend less time on cold qualification and more on delivery experience — the dimension that generates the next review.</p>

<h2>Theme 3: Group operators need roll-ups</h2>
<p>Vikram Oberoi (Capital Cars Delhi NCR) runs multiple rooftops. He wants reputation dashboards that mirror sales reporting: outlet, brand, and region. Outlet-level trust infrastructure is the missing half of his morning briefing.</p>

<h2>Theme 4: Sponsorship must stay labelled</h2>
<p>Anitha Krishnan (Coastal Hyundai Chennai) accepts sponsored visibility when buyers can see the label and when scores remain independent. "We are not buying five stars," she said. "We are buying discoverability once we have earned the rating."</p>

<h2>What premium dealers asked us to build next</h2>
<ul>
<li>Verified service reviews distinct from sales reviews</li>
<li>API exports for group BI tools</li>
<li>Faster moderation SLAs for flagged responses</li>
<li>Regional language review submission with human moderation</li>
</ul>

<h2>Conclusion</h2>
<p>Premium dealers do not fear reviews — they fear <em>unstructured</em> reviews on platforms that mix their outlet with unrelated businesses. DealerVoice's growth depends on earning that operator trust while keeping buyer-facing scores honest.</p>
<p><a href="/pricing">View dealer plans</a> · <a href="/claim">Claim your profile</a></p>`,
  },
  {
    slug: "case-for-rapid-growth-reviews-inventory-accountability",
    title: "The Case for Rapid Growth: Reviews, Inventory, and Dealer Accountability",
    excerpt:
      "Why DealerVoice must scale review density, dealer claims, and inventory linking quickly — before outlet-level SEO and AI citations consolidate around incumbents.",
    coverImage: RESEARCH_COVER_IMAGES.growth,
    tags: ["growth", "reviews", "inventory", "platform"],
    daysAgo: 5,
    authorName: "DealerVoice Research",
    content: `<p><em>Platform strategy · India + global · June 2026</em></p>

<h2>Speed is not vanity — it is defensibility</h2>
<p>Review marketplaces exhibit strong local network effects. The first platform to achieve <strong>review density</strong> in a metro owns long-tail search ("Hyundai dealer Whitefield reviews") and becomes the default citation for AI assistants. Second movers do not catch up on product quality alone — they need a data head start.</p>
<p>DealerVoice must grow rapidly across three vectors simultaneously: buyer reviews, claimed dealer profiles, and inventory-linked premium outlets.</p>

<h2>Vector 1: Review density</h2>
<p>Empty profiles are honest — but they do not rank. Each verified purchase or service review:</p>
<ul>
<li>Increases time-on-page and return visits from buyers comparing outlets</li>
<li>Feeds structured data for search and LLM retrieval</li>
<li>Gives dealers a reason to claim and respond</li>
</ul>
<p>Buyer outreach, post-service SMS prompts, and OEM-adjacent partnerships are all on the roadmap. The critical metric is <em>recent</em> reviews per outlet in launch metros — not lifetime totals.</p>

<h2>Vector 2: Dealer accountability</h2>
<p>Claimed profiles turn static directory rows into live reputations. Public responses signal operational maturity. Premium tiers add analytics, team seats, and inventory URLs without touching scores.</p>
<p>Dealer groups that centralize reputation management on DealerVoice reduce leakages to unstructured social complaints — the kind that cannot be addressed with facts.</p>

<h2>Vector 3: Inventory linking</h2>
<p>Reviews answer trust. Inventory answers availability. Combined on one profile, they reduce the typical buyer's research path from manufacturer site + classifieds + maps to a <strong>single outlet page</strong>.</p>
<p>Premium dealers with live stock feeds see higher-intent footfall; buyers see fewer wasted visits.</p>

<h2>Revenue follows density — not the reverse</h2>
<p>Subscriptions, labelled sponsorship, and contextual finance/insurance partners require traffic and trust. Cutting corners on score integrity would accelerate revenue briefly and destroy the flywheel permanently. Rapid growth must stay <a href="/methodology">methodology-aligned</a>.</p>

<h2>12-month growth scorecard</h2>
<ul>
<li>3+ recent reviews on top-decile outlets in Mumbai, Bengaluru, Delhi NCR, Chennai, Ahmedabad</li>
<li>500+ claimed profiles with public response activity</li>
<li>100+ premium outlets with inventory links</li>
<li>Organic ranking page-one for 50+ "dealership reviews + city" queries</li>
</ul>

<h2>Conclusion</h2>
<p>DealerVoice is building trust infrastructure, not a content farm. Rapid growth in reviews, claims, and inventory is how that infrastructure becomes the default citation layer for Indian automotive retail — and exportable to global markets already listed on the platform.</p>`,
  },
  {
    slug: "dealerceo-interview-trust-platform-india",
    title: "DealerCEO Interview: Building India's Dealership Trust Layer",
    excerpt:
      "An exclusive roundtable with premium dealer leaders on why they claimed early, how public reviews change operations, and what separates ethical platforms from pay-to-win directories.",
    coverImage: RESEARCH_COVER_IMAGES.trust,
    tags: ["interview", "ceo", "india", "trust"],
    daysAgo: 7,
    authorName: "DealerVoice Editorial",
    content: `<p><em>Exclusive executive roundtable · Recorded June 2026 · Edited for clarity</em></p>

<h2>Editor's note</h2>
<p>DealerVoice invited four premium dealership leaders — Enterprise, Pro, and sponsored partners — to discuss outlet-level trust, public accountability, and platform growth. Their full Q&amp;A responses appear in the interview section below. This article frames the conversation for buyers, operators, and investors watching India's automotive digitization.</p>

<h2>The land-grab for reputation URLs</h2>
<p>Every outlet will have a canonical reputation URL — the question is who defines it first. OEM locators list addresses; maps aggregate unstructured stars; neither offers moderated, automotive-specific review dimensions with dealer responses.</p>
<p>Early claimants shape data accuracy, respond while review volume is manageable, and capture long-tail SEO before competitors wake up.</p>

<h2>Operations change when reviews are public</h2>
<p>CEOs described weekly reputation stand-ups, delivery SLA tracking tied to review themes, and sales scripts that reference transparency commitments buyers can verify on the profile. Negative reviews became process fixes — not crises to bury.</p>

<h2>Global parallels, local urgency</h2>
<p>Markets like the US and UK consolidated dealership reputation years ago. India's volume growth, multi-brand outlet density, and mobile-first buyers compress that timeline. Operators who wait for "mature review culture" will read about it in competitors' case studies.</p>

<h2>Closing perspective</h2>
<p>The trust layer is coming. The only strategic choice is whether to participate in shaping it — with honest scores and labelled monetization — or to remain a pin on someone else's map.</p>
<p>Contact <a href="mailto:press@dealervoice.io">press@dealervoice.io</a> for research requests.</p>`,
  },
  {
    slug: "ai-automotive-dealership-review-platform-research",
    title: "Research: How AI and Review Data Will Drive India's Automotive Dealership Trust Layer",
    excerpt:
      "A DealerVoice research brief on why structured dealership reviews, machine-readable data, and AI-assisted discovery are becoming essential infrastructure for car buyers and dealers in India.",
    coverImage: RESEARCH_COVER_IMAGES.dealership,
    tags: ["ai", "research", "india", "platform"],
    daysAgo: 10,
    authorName: "DealerVoice Research",
    content: `<p><em>Research brief · India market · Updated June 2026</em></p>

<h2>Executive summary</h2>
<p>India's passenger vehicle market runs on trust gaps: on-road price opacity, delivery uncertainty, and uneven after-sales service. Buyers already research online — but dealership-specific, verified feedback is fragmented across social media, forums, and word of mouth.</p>
<p><strong>DealerVoice</strong> is building an India-first automotive dealership review and trust platform. This article explains the thesis: structured review data + open dealership listings + AI-readable publishing will compound into discovery traffic, buyer confidence, and B2B revenue — without pay-to-win scores.</p>

<h2>1. The trust problem in Indian auto retail</h2>
<p>Car purchase is a high-consideration decision. Unlike product e-commerce, the <em>dealer</em> — not just the brand — shapes price, delivery, accessories bundling, finance, insurance, and service quality. Two Maruti or Hyundai outlets in the same city can deliver radically different experiences.</p>
<p>Yet most buyers lack a neutral place to compare <strong>dealership reputation</strong> before visiting. OEM websites list authorized outlets; maps show phone numbers; neither surfaces verified buyer sentiment at the outlet level.</p>

<h2>2. What changes when reviews are structured</h2>
<p>General-purpose review sites treat a dealership like any local business. Automotive-specific structure matters: separate ratings for <strong>transparency</strong>, <strong>pricing fairness</strong>, <strong>sales staff</strong>, <strong>delivery</strong>, and <strong>after-sales service</strong> let buyers filter signal from noise.</p>

<h2>3. AI's role — discovery, not hype</h2>
<p>AI does not replace buyer judgment. On DealerVoice, AI-related value shows up in practical layers: machine-readable authority, moderation assistance, and dealer tooling — always with human final calls on published scores.</p>

<h2>4. The DealerVoice growth flywheel</h2>
<p>Coverage → content → reviews → traffic → ethical monetization. Review volume remains the critical bottleneck; the flywheel spins when real buyers contribute experiences.</p>

<h2>5. Why India first</h2>
<p>India combines massive new-car volume, rapid used-car digitization, and mobile-first research behavior. District- and state-level URL structure matches how buyers actually search.</p>

<h2>Conclusion</h2>
<p>The opportunity is not "another reviews website." It is a <strong>trust layer</strong> for automotive retail — structured data that buyers, search engines, and AI systems can all use.</p>
<p><strong>For buyers:</strong> <a href="/write-review">write a review</a> · <strong>For dealers:</strong> <a href="/claim">claim your profile</a></p>`,
  },
];
