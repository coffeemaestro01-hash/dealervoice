# DealerVoice — Paid Growth Playbook ($500–1,500/mo)

Highest-ROI paths for Chicago wedge + review liquidity. You run these in **your** ad accounts; the platform is already wired for landing pages and tracking.

---

## Budget split (recommended)

| Channel | Monthly | Why |
|---|---|---|
| **Google Search** | $400–800 | High intent — people searching for dealer reviews |
| **Meta retargeting** | $150–400 | Cheap clicks from warm visitors who didn't review |
| **Review gift cards** | $250 one-time (10 × $25) | Fastest way to get verified reviews on the board |
| **Reserve / test** | $100–150 | A/B headlines, new keywords |

At **$500/mo**: prioritize Google ($300) + gift cards ($250) + Meta ($150) once pixel has data.  
At **$1,500/mo**: scale Google first, then Meta retargeting.

---

## 1. Google Ads — “Chicago car dealer reviews”

**Goal:** Buyer writes a review or explores Chicagoland dealers.  
**Landing page:** `https://dealervoice.io/chicago/review`  
**Expected CPC:** $3–8 (automotive + local intent)

### Campaign setup (15 min)

1. **Google Ads** → New campaign → **Search** → Goal: Leads or Website traffic.
2. **Location:** Chicago DMA + 25 mi radius (or Cook + DuPage + Lake + Will counties).
3. **Languages:** English.
4. **Bidding:** Maximize conversions (after 15+ conversions) or **Maximize clicks** with max CPC $8 for first 2 weeks.
5. **Daily budget:** $15–25/day ($450–750/mo).

### Ad groups & keywords

**Ad group: Chicago reviews (exact + phrase)**

```
"chicago car dealer reviews"
"illinois dealership reviews"
"best car dealer chicago"
"honest car dealer reviews"
car dealer reviews chicago
dealership reviews near me
```

**Ad group: Dealer reputation (broader)**

```
dealer reputation chicago
car buying experience reviews
trustworthy car dealer illinois
```

**Negative keywords (add early):**

```
jobs, career, salary, lawsuit, lawyer, free vin, wholesale, auction, parts, service manual
```

### Ads (Responsive Search)

**Headlines (pin 1–2):**

- Write a Chicago Dealer Review
- Honest Car Dealer Reviews
- DealerVoice — Built in Chicago
- 2-Minute Verified Review
- Compare Illinois Dealers

**Descriptions:**

- Share your car-buying experience. Verified reviews help the next buyer. No paywall.
- DealerVoice maps Chicagoland dealerships with trust scores and real buyer reviews.

**Final URL:** `https://dealervoice.io/chicago/review`  
**Path:** `chicago` / `review`

### Conversion tracking

1. Google Ads → Tools → **Conversions** → New → Website.
2. Event: **Review submitted** — fire on thank-you page after review publish, or use Google Tag on `/chicago/review` form success.
3. Secondary: **Claim started** (`/claim`) if you add dealer campaigns later.

### Success metrics (30 days)

| Metric | Target |
|---|---|
| Clicks | 80–150 |
| CPC | ≤ $8 |
| Reviews from paid | 5–15 |
| Cost per review | $30–80 (gift cards can lower effective CAC) |

---

## 2. Meta (Facebook / Instagram) — Retargeting

**Goal:** Bring back visitors who viewed a dealership page but didn't write a review.  
**Audience:** Visited `/dealership/*` in last 30 days, excluded converters.

### Prerequisites

1. **Meta Business Suite** → Business settings → **Meta Pixel**.
2. Install pixel on `dealervoice.io` (Vercel: add `NEXT_PUBLIC_META_PIXEL_ID` + snippet in root layout, or use Google Tag Manager).
3. Events: `PageView`, custom `ViewContent` on dealer pages, `Lead` on review submit.

### Campaign setup

1. **Campaign objective:** Sales or Leads → **Website conversions**.
2. **Ad set — Retargeting:**
   - Custom audience: URL contains `dealervoice.io/dealership/` (last 30 days).
   - Exclude: URL contains `/review` success or users who completed review event.
   - Age: 25–65, US, Chicago + 50 mi.
   - Placements: Advantage+ (or Feed + Stories only).
   - Budget: $5–12/day.
3. **Creative:** Static image from `/api/social/linkedin-image?theme=reviews` or short 15s screen recording of writing a review.
4. **Copy:**

   > Bought or serviced a car recently? Your 2-minute review on DealerVoice helps the next Chicago buyer. Verified. Free. No account required.

   **CTA:** Learn More → `https://dealervoice.io/chicago/review`

### Cold prospecting (optional, lower priority)

Lookalike 1% of site visitors — only after 1,000+ pixel fires. Budget max $5/day until review count &gt; 20.

---

## 3. $25 gift card for verified reviews

**Fastest liquidity:** 10 verified reviews for ~$250 — often beats months of product-only work.

### Mechanics

1. **Offer:** “First 10 verified Chicagoland buyers: $25 Amazon or Chevron gift card after your review is published.”
2. **Landing:** `/chicago/review` with banner: “Limited: $25 gift card for verified reviews (10 spots).”
3. **Verification:** Review must include VIN last 6 or uploaded bill of sale / service invoice (moderate in Admin → Reviews).
4. **Fulfillment:** Tango Card, Tremendous, or Amazon bulk — ~$25 + small fee per card.
5. **Legal:** Add terms page — offer ends when 10 fulfilled, one per household, US only, 18+.

### Cost comparison

| Method | Cost for 10 reviews | Time |
|---|---|---|
| Gift cards | ~$250 + $30 fees | 1–2 weeks |
| Google Ads alone | $300–800+ | 4–8 weeks |
| Organic only | $0 | 2–6 months |

**Recommendation:** Run gift card offer **in parallel** with Google Ads. Use ad copy: “Write a review — limited $25 thank-you for first 10 verified Chicagoland buyers.”

### Admin workflow

1. Admin → **Review seeding** — QR cards for dealers.
2. Admin → **Reviews** — approve + tag `gift-card-eligible`.
3. Spreadsheet: name, email, review ID, card sent date (until automated).

---

## 4. LinkedIn (organic — already automated)

Company page: [linkedin.com/company/dealervoice](https://www.linkedin.com/company/dealervoice/)

- **Cron:** Every 3 hours via Vercel (`/api/cron/linkedin-post`).
- **Admin:** `/dashboard/admin/social` — preview, post now, recent log.
- **Env:** `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORGANIZATION_ID` (see below).

LinkedIn **paid** sponsored content is lower ROI at this stage ($8–15 CPC, B2B skew). Stay organic until 50+ reviews and 5+ Pro subs; then test $10/day promoting `/claim` to dealer GMs.

### LinkedIn API setup (one-time)

1. [LinkedIn Developers](https://www.linkedin.com/developers/) → Create app → associate with DealerVoice company page.
2. Request **Marketing Developer Platform** access (required for org posting).
3. Scopes: `w_organization_social`, `r_organization_social`.
4. Generate token (3-legged OAuth as org admin) or use Community Management API token.
5. **Organization ID:** Company page → Admin tools → Page info, or API `GET /organizations?q=vanityName&vanityName=dealervoice`.
6. Vercel env:
   ```
   LINKEDIN_ACCESS_TOKEN=...
   LINKEDIN_ORGANIZATION_ID=12345678
   ```
7. Run migration: `npm run db:migrate:social-post`
8. Test: Admin → LinkedIn autopilot → **Post now**.

**Note:** 8 posts/day is aggressive for LinkedIn. If engagement drops, change `vercel.json` cron to `0 14,18,22 * * *` (3× daily US business hours).

---

## 5. Week-by-week execution

| Week | Actions |
|---|---|
| **1** | Google campaign live, pixel + conversions, gift card banner on `/chicago/review`, LinkedIn token connected |
| **2** | Meta pixel live, retargeting ad set (needs ~100 dealer page views), approve first gift card reviews |
| **3** | Pause keywords with CPC &gt; $10 and no reviews; double budget on winners |
| **4** | Evaluate: cost/review, Pro claim rate from `/claim` traffic, scale or reallocate |

---

## 6. What not to spend on (yet)

- Broad display / YouTube awareness
- LinkedIn paid ads before review liquidity
- National keyword targets (stay Chicago/IL)
- Influencer packages without trackable review CTAs

---

## Quick links

| Asset | URL |
|---|---|
| Buyer review landing | `/chicago/review` |
| Chicago hub | `/chicago` |
| Dealer claim | `/claim` |
| Pricing | `/pricing` |
| Admin revenue | `/dashboard/admin/revenue` |
| Admin LinkedIn | `/dashboard/admin/social` |
| Review seeding | `/dashboard/admin/review-seeding` |
