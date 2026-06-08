/**
 * DealerVoice blog library — buyer guides, dealer insights, platform research.
 * Seeded via scripts/seed-blog-content.ts
 */

export type BlogPostSeed = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  content: string;
  /** Days ago from seed run — controls publishedAt ordering */
  daysAgo?: number;
  authorName?: string;
};

export const BLOG_POSTS: BlogPostSeed[] = [
  // ─── Flagship research ───────────────────────────────────────────────────
  {
    slug: "ai-automotive-dealership-review-platform-research",
    title: "Research: How AI and Review Data Will Drive India's Automotive Dealership Trust Layer",
    excerpt:
      "A DealerVoice research brief on why structured dealership reviews, machine-readable data, and AI-assisted discovery are becoming essential infrastructure for car buyers and dealers in India.",
    category: "Research",
    tags: ["ai", "research", "india", "platform", "automotive"],
    daysAgo: 2,
    authorName: "DealerVoice Research",
    content: `<p><em>Research brief · India market · Updated June 2026</em></p>

<h2>Executive summary</h2>
<p>India's passenger vehicle market runs on trust gaps: on-road price opacity, delivery uncertainty, and uneven after-sales service. Buyers already research online — but dealership-specific, verified feedback is fragmented across social media, forums, and word of mouth.</p>
<p><strong>DealerVoice</strong> is building an India-first automotive dealership review and trust platform. This article explains the thesis: structured review data + open dealership listings + AI-readable publishing will compound into discovery traffic, buyer confidence, and B2B revenue — without pay-to-win scores.</p>

<h2>1. The trust problem in Indian auto retail</h2>
<p>Car purchase is a high-consideration decision. Unlike product e-commerce, the <em>dealer</em> — not just the brand — shapes price, delivery, accessories bundling, finance, insurance, and service quality. Two Maruti or Hyundai outlets in the same city can deliver radically different experiences.</p>
<p>Yet most buyers lack a neutral place to compare <strong>dealership reputation</strong> before visiting. OEM websites list authorized outlets; maps show phone numbers; neither surfaces verified buyer sentiment at the outlet level.</p>
<ul>
<li><strong>Information asymmetry</strong> — dealers know margin structures; buyers often don't until late in negotiation.</li>
<li><strong>Review scatter</strong> — useful feedback lives on Instagram, YouTube, WhatsApp groups, and Google Maps with inconsistent moderation.</li>
<li><strong>No outlet-level score</strong> — brand NPS does not equal dealership NPS.</li>
</ul>

<h2>2. What changes when reviews are structured</h2>
<p>General-purpose review sites treat a dealership like any local business. Automotive-specific structure matters: separate ratings for <strong>transparency</strong>, <strong>pricing fairness</strong>, <strong>sales staff</strong>, <strong>delivery</strong>, and <strong>after-sales service</strong> let buyers filter signal from noise.</p>
<p>When reviews are:</p>
<ul>
<li>Published with clear moderation rules</li>
<li>Optionally verified (purchase or service proof)</li>
<li>Tied to a single dealership profile with location and brand context</li>
</ul>
<p>…the platform becomes citable infrastructure — for humans, search engines, and AI assistants answering "which dealer in Pune should I trust for Tata Nexon delivery?"</p>

<h2>3. AI's role — discovery, not hype</h2>
<p>AI does not replace buyer judgment. On DealerVoice, AI-related value shows up in practical layers:</p>
<h3>3.1 Machine-readable authority</h3>
<p>Structured <code>Schema.org</code> data on dealership pages, a public <a href="/llms.txt">llms.txt</a> file, and consistent URLs by state and district help LLMs and search systems retrieve accurate listings instead of hallucinating dealer names.</p>
<h3>3.2 Moderation assistance</h3>
<p>Spam and promotional fake reviews scale faster than human teams. AI-assisted moderation flags suspicious patterns; humans make final calls. Published <a href="/methodology">methodology</a> explains that negative reviews are not hidden for payment.</p>
<h3>3.3 Dealer tooling (roadmap)</h3>
<p>Claimed dealers can eventually use AI-suggested responses and profile improvements — always disclosed, always editable by the dealer. The score itself is not for sale.</p>

<h2>4. The DealerVoice growth flywheel</h2>
<p>The platform is designed around a simple loop:</p>
<ol>
<li><strong>Coverage</strong> — Directory of Indian dealerships (public OSM and business data, dealer claims for corrections).</li>
<li><strong>Content</strong> — Buyer guides, research, and blog articles that rank for long-tail automotive queries.</li>
<li><strong>Reviews</strong> — Each verified experience increases trust and differentiates profiles with thin data today.</li>
<li><strong>Traffic</strong> — Organic search + AI citations + social proof.</li>
<li><strong>Monetization</strong> — Ethical layers: dealer profile claims/subscriptions, sponsored listings, and contextual insurance/finance partners — not rating manipulation.</li>
</ol>
<p><strong>Honest state today:</strong> DealerVoice is live with thousands of India dealership listings and a growing content library. Review volume is still the critical bottleneck — the flywheel only spins fast when real buyers contribute experiences.</p>

<h2>5. Why India first</h2>
<p>India combines massive new-car volume, rapid used-car digitization, and mobile-first research behavior. District- and state-level URL structure matches how buyers actually search ("Hyundai dealer Whitefield", "used car dealer Lucknow").</p>
<p>Global listings exist on DealerVoice, but product, content, and outreach prioritize India until review density and revenue proof justify broader GTM spend.</p>

<h2>6. Revenue architecture (transparent)</h2>
<p>Sustainable review platforms do not charge buyers. DealerVoice revenue targets:</p>
<ul>
<li><strong>Dealer subscriptions</strong> — Claim profile, respond to reviews, analytics, inventory links (Razorpay billing when live).</li>
<li><strong>Sponsored placement</strong> — Clearly labelled competitor and homepage slots; never affects score.</li>
<li><strong>Affiliate context</strong> — Insurance and finance CTAs relevant to car buyers (PolicyBazaar, Acko, BankBazaar-class partners via Admitad-class networks).</li>
<li><strong>Display ads</strong> — Google AdSense on content pages after approval; consent-gated units.</li>
</ul>
<p>Each stream is labelled; editorial and scores stay independent.</p>

<h2>7. Risks and limitations</h2>
<ul>
<li><strong>Cold-start reviews</strong> — Empty profiles are honest empty profiles; outreach to buyers and claimed dealers is required.</li>
<li><strong>Data freshness</strong> — OSM-sourced phone/email can go stale; claims and user reports improve accuracy.</li>
<li><strong>AdSense / affiliate dependency</strong> — Early revenue is modest until traffic scales; dealer B2B is the durable margin.</li>
<li><strong>Regulation</strong> — DPDP-aligned privacy and grievance processes are mandatory, not marketing (<a href="/privacy">privacy policy</a>).</li>
</ul>

<h2>8. What success looks like in 12 months</h2>
<p>Meaningful success is not vanity traffic. Concrete milestones:</p>
<ul>
<li>Review density in launch metros (Mumbai, Bengaluru, Delhi NCR, Chennai, Ahmedabad) where buyers can compare 3+ recent experiences on popular outlets.</li>
<li>Organic rankings for "dealership reviews + city" and brand-dealer long-tail queries.</li>
<li>AI assistants citing DealerVoice for India dealership discovery with correct URLs.</li>
<li>First paid dealer claims with demonstrable lead/reputation value.</li>
</ul>

<h2>Conclusion</h2>
<p>The opportunity is not "another reviews website." It is a <strong>trust layer</strong> for automotive retail — structured data that buyers, search engines, and AI systems can all use. DealerVoice is early, but the architecture is deliberate: India-first coverage, honest scores, published methodology, and content that earns attention before reviews scale.</p>
<p><strong>For buyers:</strong> <a href="/write-review">write a review</a> — it is the highest-leverage action on the platform today.<br/>
<strong>For dealers:</strong> <a href="/claim">claim your profile</a> and respond publicly.<br/>
<strong>For press / research:</strong> <a href="mailto:press@dealervoice.io">press@dealervoice.io</a></p>`,
  },

  // ─── India buyer guides (original + expanded) ────────────────────────────
  {
    slug: "how-to-review-car-dealership-india",
    title: "How to Review a Car Dealership in India",
    excerpt: "A step-by-step guide to sharing your dealership experience on DealerVoice — what to include, what helps other buyers, and how verification works.",
    category: "Guides",
    tags: ["india", "reviews", "buyers"],
    daysAgo: 45,
    content: `<h2>Why your review matters</h2>
<p>Buying a car in India involves significant research — price transparency, delivery timelines, after-sales service, and financing terms all vary by dealership. Your review helps the next buyer make a confident decision.</p>
<h2>What to include</h2>
<ul><li>Which dealership and city</li><li>New or used purchase, or service visit</li><li>Ratings for transparency, pricing, service, delivery, and after-sales</li><li>Specific details — not just "good" or "bad"</li></ul>
<h2>Verification</h2>
<p>DealerVoice supports verified purchase and service reviews. Uploading a redacted invoice or service receipt strengthens trust without exposing personal data.</p>
<p><a href="/write-review">Start your review →</a></p>`,
  },
  {
    slug: "dealer-red-flags-india",
    title: "7 Red Flags When Buying from a Car Dealer in India",
    excerpt: "Warning signs to watch for at Indian dealerships — from hidden charges to pressure tactics — and how to protect yourself.",
    category: "Buyer safety",
    tags: ["india", "tips", "dealers"],
    daysAgo: 42,
    content: `<h2>Before you sign</h2>
<p>Indian car buyers face unique challenges: on-road price confusion, accessory bundling, extended warranty upsells, and delivery delays. Here are seven red flags.</p>
<ol><li>Refusal to provide itemised on-road quote in writing</li><li>Pressure to buy accessories or insurance on the spot</li><li>No test drive or VIN verification for used cars</li><li>Verbal promises not reflected in the agreement</li><li>Unregistered or unclaimed dealership profile online</li><li>Negative patterns in recent buyer reviews</li><li>Missing RTO or insurance documentation at delivery</li></ol>
<p>Cross-check the dealer on <a href="/dealers/in">DealerVoice India directory</a> before you pay a booking amount.</p>`,
  },
  {
    slug: "on-road-price-explained-india",
    title: "On-Road Price Explained: What Indian Car Dealers Must Disclose",
    excerpt: "Ex-showroom, RTO, insurance, FASTag, extended warranty, and accessories — how to read an on-road quote and spot inflated line items.",
    category: "Guides",
    tags: ["india", "pricing", "on-road"],
    daysAgo: 38,
    content: `<h2>Core components</h2>
<p><strong>Ex-showroom price</strong> is the factory gate price. <strong>On-road price</strong> adds registration, road tax, insurance, handling, and optional accessories. Legitimate dealers itemise each line.</p>
<h2>Common upsells</h2>
<ul><li>Paint protection and ceramic coating packages</li><li>Extended warranty beyond OEM offering</li><li>Dealer-fitted accessories (mats, sensors, infotainment upgrades)</li><li>Third-party insurance sold as mandatory (it is not — you may choose your insurer)</li></ul>
<h2>Practical tip</h2>
<p>Request a written quote and compare with another dealer in the same city. Share your experience on DealerVoice so pricing transparency improves for the community.</p>`,
  },
  {
    slug: "ev-dealership-buying-guide-india",
    title: "Buying an EV from a Dealership in India: What to Ask First",
    excerpt: "Charging kits, battery warranty, home installation timelines, and service network — an EV-specific checklist for Indian showrooms.",
    category: "Guides",
    tags: ["india", "ev", "electric"],
    daysAgo: 35,
    content: `<h2>EV purchases add new variables</h2>
<p>Beyond standard on-road pricing, EV buyers should confirm:</p>
<ul><li>Included AC charger type and installation responsibility</li><li>Battery warranty years and kilometre cap</li><li>Nearest authorised service bay with HV-trained technicians</li><li>Realistic delivery date (EV SKUs often queue longer)</li><li>State subsidies and documentation support</li></ul>
<h2>After delivery</h2>
<p>Document charging install delays or range/service issues in a DealerVoice review — it helps the next EV buyer in your city.</p>`,
  },
  {
    slug: "car-loan-emi-dealer-financing-india",
    title: "Dealer Finance vs Bank Loan: A Car Buyer's Guide in India",
    excerpt: "How DSA commissions, processing fees, and pre-closure clauses differ when you finance through the showroom versus your own bank.",
    category: "Finance",
    tags: ["india", "loan", "emi"],
    daysAgo: 32,
    content: `<h2>Two paths</h2>
<p><strong>Dealer-arranged finance</strong> is convenient — the outlet sends your application to partner banks/NBFCs. <strong>Direct bank loan</strong> may offer lower processing fees if you have an existing relationship.</p>
<h2>Compare on</h2>
<ul><li>Interest rate (fixed vs floating)</li><li>Processing fee and documentation charges</li><li>Pre-closure penalties</li><li>Insurance bundling in loan amount</li></ul>
<p>Never sign finance papers under time pressure on delivery day. Review the dealer's transparency rating on DealerVoice before you commit.</p>`,
  },
  {
    slug: "best-time-buy-car-india",
    title: "When Is the Best Time to Buy a Car in India?",
    excerpt: "Month-end targets, festive offers, new model year changeovers, and how to use timing without falling for fake urgency.",
    category: "Guides",
    tags: ["india", "timing", "deals"],
    daysAgo: 28,
    content: `<h2>Calendar patterns</h2>
<p>Dealers often have monthly and quarterly sales targets — the last week of March, June, September, and December can yield better negotiation room. Festive seasons (Diwali, year-end) bring OEM cashback and exchange bonuses.</p>
<h2>Caution</h2>
<p>"Today only" pressure is a tactic. Compare quotes, read recent reviews for the exact outlet, and walk away if the on-road breakup is unclear.</p>`,
  },
  {
    slug: "car-insurance-dealer-bundling-india",
    title: "Do You Have to Buy Insurance from the Car Dealer in India?",
    excerpt: "Third-party vs comprehensive, dealer bundles, and how to insure your new car without overpaying for convenience.",
    category: "Finance",
    tags: ["india", "insurance"],
    daysAgo: 25,
    content: `<h2>Short answer</h2>
<p>You need valid insurance before registration — but you are <strong>not</strong> required to buy from the dealer. Many buyers use the dealer for convenience; others compare policies online for better IDV and add-ons.</p>
<h2>Checklist</h2>
<ul><li>Compare comprehensive quotes (zero dep, engine protect, RSA)</li><li>Confirm policy start date matches delivery</li><li>Keep digital copy for RTO and future claims</li></ul>`,
  },
  {
    slug: "delivery-delay-car-dealer-india",
    title: "Car Delivery Delayed? Know Your Rights at Indian Dealerships",
    excerpt: "Booking amounts, indefinite waiting periods, and how to document problems so other buyers see accurate delivery track records.",
    category: "Buyer safety",
    tags: ["india", "delivery"],
    daysAgo: 22,
    content: `<h2>Get promises in writing</h2>
<p>Verbal delivery dates are meaningless. Your booking receipt or proforma should reference variant, colour, and expected timeline.</p>
<h2>If delays drag</h2>
<ul><li>Escalate to brand customer care with dealer code</li><li>Document every committed date vs actual</li><li>Leave a factual DealerVoice review citing dates (not rage — facts help everyone)</li></ul>`,
  },
  {
    slug: "service-centre-vs-showroom-reviews",
    title: "Why You Should Review the Service Centre Separately from the Showroom",
    excerpt: "Sales and after-sales are often different teams, buildings, and quality levels. How DealerVoice separates service feedback.",
    category: "Guides",
    tags: ["service", "reviews"],
    daysAgo: 20,
    content: `<h2>Same brand, different experience</h2>
<p>A five-star sales experience can sit beside a one-star service bay. DealerVoice lets you specify <strong>sales</strong> vs <strong>service</strong> visits so buyers see the full picture.</p>
<p>If you only visited for periodic service, say so — it prevents buyers from misreading your review as a purchase story.</p>`,
  },

  // ─── City / regional ─────────────────────────────────────────────────────
  {
    slug: "mumbai-car-dealership-reviews-guide",
    title: "How to Choose a Car Dealership in Mumbai: Reviews, RTO, and Reality",
    excerpt: "Western suburbs, Navi Mumbai, and Thane outlets differ in pricing and delivery. What to verify before you book.",
    category: "Cities",
    tags: ["mumbai", "maharashtra", "india"],
    daysAgo: 18,
    content: `<h2>Mumbai is multi-hub</h2>
<p>Buyers in Andheri may never visit a Navi Mumbai outlet — but exchange offers and RTO jurisdiction matter. Filter dealerships by locality on <a href="/dealers/in/state/maharashtra">Maharashtra listings</a>.</p>
<h2>Local checks</h2>
<ul><li>RTO agent included or DIY</li><li>Parking/delivery location for PDI</li><li>Monsoon-season delivery protection for outdoor stock</li></ul>`,
  },
  {
    slug: "bangalore-used-car-dealer-checklist",
    title: "Bangalore Used Car Dealers: Inspection Checklist Before You Pay",
    excerpt: "RC transfer, hypothecation closure, odometer fraud, and service history — Bengaluru-specific used-car diligence.",
    category: "Cities",
    tags: ["bangalore", "karnataka", "used-cars"],
    daysAgo: 15,
    content: `<h2>Documentation</h2>
<ul><li>RC match with seller ID and chassis number</li><li>NOC if financed; Form 35 closure proof</li><li>Karnataka road tax compliance for out-of-state cars</li></ul>
<h2>Physical inspection</h2>
<p>Use a trusted mechanic for underbody rust, CVT/DSG test drive, and ECU scan. Publish outcomes on DealerVoice — used-car transparency is still thin in India.</p>`,
  },
  {
    slug: "delhi-ncr-dealer-comparison-tips",
    title: "Delhi NCR Car Dealers: Comparing Outlets Across Gurgaon, Noida, and Delhi",
    excerpt: "Cross-border registration quirks, exchange values, and why you should compare three dealers before booking.",
    category: "Cities",
    tags: ["delhi", "ncr", "india"],
    daysAgo: 12,
    content: `<h2>NCR spreads wide</h2>
<p>Gurgaon premium outlets and Noida value deals serve different buyers. Compare on-road breakup for the same variant within 48 hours.</p>
<p>Read <a href="/dealers/in/state/delhi">Delhi</a> and nearby district listings; sort by recent reviews as volume grows.</p>`,
  },
  {
    slug: "chennai-car-dealership-reviews-guide",
    title: "Chennai Car Dealerships: OMR, GST Road, and What to Check Before Booking",
    excerpt: "Tamil Nadu buyers face long commutes between showroom clusters — how to compare outlets, RTO agents, and monsoon-ready delivery in Chennai.",
    category: "Cities",
    tags: ["chennai", "tamil-nadu", "india"],
    daysAgo: 11,
    content: `<h2>Chennai buys across corridors</h2>
<p>Outlets along OMR, GST Road, and Ambattur serve different catchments. A dealer near Siruseri may be irrelevant if you live in Anna Nagar — but <strong>on-road quotes and delivery dates</strong> still vary within the same brand.</p>
<h2>Local checklist</h2>
<ul><li>TN registration and temporary permit timeline in writing</li><li>PDI before monsoon — check underbody and lot storage if car was outdoor stock</li><li>Exchange valuation for older hatchbacks (strong used market in Chennai)</li><li>Service centre location vs showroom — they are often kilometres apart</li></ul>
<p>Browse <a href="/dealers/in/state/tamil-nadu">Tamil Nadu dealerships</a> on DealerVoice and read recent reviews before paying a booking amount.</p>`,
  },
  {
    slug: "pune-car-dealership-reviews-guide",
    title: "Pune Car Dealers: Hinjewadi, Pimpri-Chinchwad, and Comparison Tips",
    excerpt: "Maharashtra's second hub mixes IT-corridor showrooms with industrial-belt outlets. What Pune buyers should verify on price and delivery.",
    category: "Cities",
    tags: ["pune", "maharashtra", "india"],
    daysAgo: 10,
    content: `<h2>Pune is not one market</h2>
<p>Buyers near Hinjewadi often compare dealers in Pimpri-Chinchwad and Wagholi. Waiting periods for popular SUVs differ outlet to outlet even under the same OEM badge.</p>
<h2>Before you book</h2>
<ul><li>Get ex-showroom and on-road breakup from two Pune outlets + one Mumbai quote for leverage</li><li>Confirm who handles MH registration if you live near PCMC vs Pune RTO jurisdiction</li><li>Ask where PDI happens — some dealers use off-site yards</li></ul>
<p>Search <a href="/dealers/in/state/maharashtra">Maharashtra listings</a> and filter by locality. Leave a review after your visit — Pune's buyer community still needs more outlet-level data.</p>`,
  },
  {
    slug: "hyderabad-car-dealership-reviews-guide",
    title: "Hyderabad Car Dealerships: Financial District to Secunderabad — Buyer Guide",
    excerpt: "Telangana's split showroom map, fast EV uptake, and registration quirks — how to pick a trustworthy dealer in Hyderabad.",
    category: "Cities",
    tags: ["hyderabad", "telangana", "india"],
    daysAgo: 9,
    content: `<h2>Hyderabad sprawls fast</h2>
<p>Gachibowli, Kukatpally, and Uppal outlets serve different buyers. Telangana's growth means new showrooms open often — reputation data lags behind brand ads.</p>
<h2>Hyderabad-specific checks</h2>
<ul><li>TS registration timeline and temporary registration for out-of-district buyers</li><li>EV charger inclusion if you are buying electric — installation lead times vary</li><li>Exchange offer documentation for fleet upgrades in IT corridors</li><li>Service bay capacity before monsoon (long wait times at busy centres)</li></ul>
<p>Explore <a href="/dealers/in/state/telangana">Telangana dealerships</a> on DealerVoice. Factual reviews help the next buyer navigating Hyderabad's crowded dealer map.</p>`,
  },
  {
    slug: "ahmedabad-car-dealership-reviews-guide",
    title: "Ahmedabad Car Dealers: SG Highway, Navrangpura, and Gujarat On-Road Tips",
    excerpt: "Gujarat buyers benefit from competitive pricing — but accessory bundling and delivery promises still differ. What to verify in Ahmedabad.",
    category: "Cities",
    tags: ["ahmedabad", "gujarat", "india"],
    daysAgo: 8,
    content: `<h2>Gujarat's competitive retail</h2>
<p>Ahmedabad buyers often get strong ex-showroom deals — yet <strong>on-road inflation</strong> via accessories, insurance markup, and extended warranty packs is still common on SG Highway and Sarkhej corridors.</p>
<h2>Local diligence</h2>
<ul><li>Itemised quote with optional lines clearly marked</li><li>Festive-season delivery commitments in writing (high volume months)</li><li>GJ registration and insurance — compare dealer bundle vs online comprehensive</li><li>For used cars: verify RC and hypothecation closure before handover</li></ul>
<p>See <a href="/dealers/in/state/gujarat">Gujarat listings</a> and compare outlets before Diwali or year-end rush periods.</p>`,
  },
  {
    slug: "kolkata-car-dealership-reviews-guide",
    title: "Kolkata Car Dealerships: Salt Lake, EM Bypass, and Eastern India Buyer Tips",
    excerpt: "West Bengal humidity, used-car rust checks, and cross-state registration — a Kolkata-specific dealership checklist.",
    category: "Cities",
    tags: ["kolkata", "west-bengal", "india"],
    daysAgo: 7,
    content: `<h2>Eastern India's hub city</h2>
<p>Kolkata buyers often cross into Salt Lake, Rajarhat, and EM Bypass clusters. Out-of-state cars and humid storage make <strong>physical inspection</strong> especially important for used purchases.</p>
<h2>Kolkata checklist</h2>
<ul><li>Underbody rust and flood history on monsoon-season stock</li><li>WB registration vs neighbouring state transfers if you commute cross-border</li><li>Dealer-arranged insurance vs own policy before RTO submission</li><li>Service centre weekday capacity — long queues at popular Maruti/Hyundai bays</li></ul>
<p>Browse <a href="/dealers/in/state/west-bengal">West Bengal dealerships</a> on DealerVoice. Even a short "quote only" review helps build trust data for Kolkata buyers.</p>`,
  },

  // ─── Dealer / B2B ────────────────────────────────────────────────────────
  {
    slug: "why-dealers-should-claim-dealervoice-profile",
    title: "Why Car Dealers Should Claim Their DealerVoice Profile",
    excerpt: "Respond to reviews, fix contact details, remove competitor ads on your listing, and show buyers you stand behind your service.",
    category: "For dealers",
    tags: ["dealers", "claim", "b2b"],
    daysAgo: 10,
    content: `<h2>Unclaimed profiles are vulnerable</h2>
<p>Until claimed, competitor sponsored placements may appear on your profile. Claiming verifies ownership and unlocks the dealer dashboard.</p>
<h2>What you can do</h2>
<ul><li>Reply publicly to reviews (professional responses build trust)</li><li>Correct phone, website, and hours</li><li>Access analytics as review volume grows</li><li>Optional premium: inventory links and featured placement</li></ul>
<p><a href="/claim">Start a claim →</a> or email <a href="mailto:dealers@dealervoice.io">dealers@dealervoice.io</a></p>`,
  },
  {
    slug: "online-reputation-car-dealers-india",
    title: "Online Reputation Management for Car Dealers in India",
    excerpt: "How to respond to negative reviews, encourage verified feedback, and avoid fake review farms that backfire.",
    category: "For dealers",
    tags: ["dealers", "reputation"],
    daysAgo: 8,
    content: `<h2>Respond, don't rage</h2>
<p>Public replies show accountability. Acknowledge issues, offer a offline resolution path with a named manager, and never post customer PII.</p>
<h2>Never buy fake reviews</h2>
<p>Platforms and buyers detect patterns. Verified purchase flows and moderation protect ecosystem trust — including your legitimate happy customers.</p>`,
  },

  // ─── Trust / platform ────────────────────────────────────────────────────
  {
    slug: "authorized-vs-used-dealer-india",
    title: "Authorized Dealer vs Used Car Dealer: What to Trust in India",
    excerpt: "Understanding the difference between OEM-authorized showrooms, multi-brand outlets, and independent used car lots.",
    category: "Guides",
    tags: ["india", "used-cars", "authorized"],
    daysAgo: 40,
    content: `<h2>Authorized dealers</h2>
<p>OEM-authorized dealerships sell new vehicles with factory warranty, standardised pricing frameworks, and manufacturer-backed service.</p>
<h2>Used car dealers</h2>
<p>Independent lots offer flexibility but vary widely in inspection quality, title clarity, and after-sales support. Always verify RC, insurance history, and service records.</p>
<h2>How DealerVoice helps</h2>
<p>Search by city or state, compare reputation scores, and read category-specific reviews for sales vs service before you visit.</p>`,
  },
  {
    slug: "dpdp-rights-car-buyers-india",
    title: "Your Data Rights as a Car Buyer Under India's DPDP Act",
    excerpt: "What India's Digital Personal Data Protection Act means when you leave reviews, request quotes, or share documents with dealerships.",
    category: "Privacy",
    tags: ["india", "dpdp", "privacy"],
    daysAgo: 36,
    content: `<h2>Your rights</h2>
<p>Under the DPDP Act, you have the right to know how your data is used, request correction or erasure, and withdraw consent for marketing.</p>
<h2>On DealerVoice</h2>
<p>We collect only what's needed to publish and verify reviews. See our <a href="/privacy">Privacy Policy</a> and Grievance Officer contact for DSR requests.</p>`,
  },
  {
    slug: "maruti-hyundai-tata-dealer-tips",
    title: "Tips for Choosing Maruti, Hyundai, or Tata Dealers in India",
    excerpt: "Brand-specific advice for comparing authorized dealerships — waiting periods, service network, and exchange offers.",
    category: "Brands",
    tags: ["india", "maruti", "hyundai", "tata"],
    daysAgo: 30,
    content: `<h2>Compare within the brand</h2>
<p>Even within the same OEM, dealership experience varies by city. Compare delivery timelines, exchange valuations, and service centre proximity.</p>
<p>Use DealerVoice to read reviews filtered by brand and location before booking a test drive.</p>`,
  },
  {
    slug: "what-dealervoice-verified-reviews-mean",
    title: "What DealerVoice Verified Reviews Mean",
    excerpt: "How we verify purchase and service reviews, fight fake feedback, and calculate reputation scores.",
    category: "Trust",
    tags: ["methodology", "verification"],
    daysAgo: 26,
    content: `<h2>Verification levels</h2>
<p>Reviews can be unverified (still valuable), verified purchase, or verified service based on document review.</p>
<h2>Reputation scores</h2>
<p>Scores aggregate published reviews across transparency, pricing, service, delivery, and after-sales dimensions. Empty profiles show no score until real reviews exist.</p>
<p>Full methodology: <a href="/methodology">dealervoice.io/methodology</a></p>`,
  },
  {
    slug: "how-ai-assistants-use-dealervoice-data",
    title: "How AI Assistants Can Use DealerVoice for Dealership Questions",
    excerpt: "llms.txt, Schema.org, and structured India URLs — why citation-friendly design matters for car buyer Q&A.",
    category: "Research",
    tags: ["ai", "llms", "seo"],
    daysAgo: 6,
    content: `<h2>Problem</h2>
<p>When users ask ChatGPT, Gemini, or Perplexity "which dealer in Chennai is reliable?", models need authoritative URLs — not forum gossip.</p>
<h2>DealerVoice approach</h2>
<ul><li>Public <a href="/llms.txt">llms.txt</a> describing scope and citation rules</li><li>Structured dealer pages with location and brand context</li><li>Published methodology so models don't over-claim endorsements</li></ul>
<p>AI tools should cite specific profile URLs and note when review volume is still low — honesty beats hype.</p>`,
  },
  {
    slug: "state-of-dealership-trust-india-2026",
    title: "The State of Dealership Trust in India (2026 Snapshot)",
    excerpt: "Why outlet-level transparency still lags e-commerce, and what would change if buyers reviewed dealerships like they review products.",
    category: "Research",
    tags: ["research", "india", "trust"],
    daysAgo: 4,
    content: `<h2>Snapshot, not a survey</h2>
<p>This is an editorial snapshot — not a paid market research report. India's auto retail is growing, but <strong>dealership-level trust signals remain fragmented</strong>.</p>
<h2>Observed gaps</h2>
<ul><li>Buyers trust brands but distrust individual outlets</li><li>Social proof is hyper-local and non-portable</li><li>Dealers invest in ads, not public accountability</li></ul>
<h2>Path forward</h2>
<p>Structured reviews + claimed profiles + transparent scores create accountability loops. DealerVoice is building that layer — density of real reviews will determine impact.</p>`,
  },
  {
    slug: "dealervoice-ai-automotive-trust-press-brief",
    title: "Press Brief: DealerVoice — Building India's AI-Readable Dealership Trust Layer",
    excerpt:
      "Short press summary of our research on structured dealership reviews, India-first coverage, and AI citation — for media, partners, and LinkedIn.",
    category: "Press",
    tags: ["press", "research", "ai", "linkedin"],
    daysAgo: 0,
    authorName: "DealerVoice Research",
    content: `<p><em>Press brief · June 2026 · <a href="mailto:press@dealervoice.io">press@dealervoice.io</a></em></p>

<h2>One-line summary</h2>
<p><strong>DealerVoice</strong> is an India-first automotive dealership review platform combining structured buyer feedback, open directory data, and AI-readable publishing — so car buyers, search engines, and LLMs can cite outlet-level trust signals before purchase or service.</p>

<h2>The problem</h2>
<p>Indian car buyers trust brands but struggle to compare <em>individual dealerships</em>. On-road pricing, delivery timelines, and after-sales quality vary outlet to outlet. Useful feedback is scattered across social media and maps with inconsistent moderation.</p>

<h2>What DealerVoice does</h2>
<ul>
<li><strong>Directory</strong> — Dealership listings across Indian states and districts (<a href="/dealers/in">dealervoice.io/dealers/in</a>)</li>
<li><strong>Structured reviews</strong> — Ratings for transparency, pricing, sales staff, delivery, and after-sales</li>
<li><strong>Verification</strong> — Optional purchase/service proof; published <a href="/methodology">methodology</a>; scores are not pay-to-win</li>
<li><strong>AI authority</strong> — Schema.org markup, <a href="/llms.txt">llms.txt</a>, and research content for responsible citation</li>
</ul>

<h2>Stage (honest)</h2>
<p>Platform is live with thousands of India dealership listings and a growing editorial library. <strong>Review density remains the critical growth lever</strong> — the trust layer compounds when real buyers contribute experiences.</p>

<h2>Revenue (transparent)</h2>
<p>Dealer profile claims/subscriptions, clearly labelled sponsored placements, and contextual insurance/finance partners — never rating manipulation.</p>

<h2>Links</h2>
<ul>
<li>Full research: <a href="/blog/ai-automotive-dealership-review-platform-research">AI + automotive trust research</a></li>
<li>Write a review: <a href="/write-review">dealervoice.io/write-review</a></li>
<li>Dealer claims: <a href="mailto:dealers@dealervoice.io">dealers@dealervoice.io</a></li>
</ul>

<h2>Boilerplate</h2>
<p>DealerVoice operates at <a href="https://dealervoice.io">dealervoice.io</a>, publishing buyer guides and dealership reputation data for India with global listings in progress.</p>`,
  },
  {
    slug: "compare-dealerships-before-test-drive",
    title: "Compare Dealerships Before You Book a Test Drive",
    excerpt: "A 15-minute pre-visit checklist: reviews, on-road quote request, competitor outlets, and safety red flags.",
    category: "Guides",
    tags: ["buyers", "checklist"],
    daysAgo: 14,
    content: `<h2>15-minute checklist</h2>
<ol>
<li>Search the outlet on DealerVoice — read last 5 reviews</li>
<li>Call two rival dealers for ex-showroom + on-road estimate</li>
<li>Confirm test drive car is a customer vehicle or dedicated unit</li>
<li>Screenshot quotes for comparison</li>
<li>After visit, leave a review — even "quote only" helps others</li>
</ol>`,
  },
];
