# DealerVoice — Product Roadmap

**Positioning:** Trustpilot × DealerRater for **franchised** automotive dealerships only.  
**Primary market:** USA → Canada, UK, AU, UAE, EU.  
**Bias:** SEO liquidity, review generation, dealer acquisition, speed.

---

## Current state (audit summary)

| Area | Status | Gap |
|------|--------|-----|
| Dealer profiles | 8,800+ OSM imports, `/dealership/{slug}` | Mixed independent + franchise; no `isFranchised` filter |
| URLs | `/dealers/{country}/…` + redirect alias | Spec wants `/dealers/{state}/{city}/{name}` canonical |
| Brands | `Brand` + `DealerBrand` | OSM import drops brand links |
| Reviews | Full model + moderation | Good; needs more review-gen loops |
| Claims | Auto-approve domain match | Good; no dealer groups |
| Search | Prisma + Redis | Meilisearch indexed but unused |
| SEO | Sitemap + JSON-LD on profile | No programmatic “best dealers in X” pages |
| Payments | Stripe USD + outreach crons | Good |

---

## Phase 1 — Foundation (Week 1) ← **IN PROGRESS**

- [x] Franchised brand allowlist + name matcher
- [x] Schema: `DealerGroup`, `isFranchised`, `isPublished`, `googleMapsUrl`
- [x] US canonical URLs `/dealers/{state}/{city}/{slug}`
- [x] `/dealership/{slug}` → 301 to canonical geo URL (US)
- [x] OSM importer: franchised-only + `DealerBrand` links
- [x] `publicDealerWhere` + geo pages use consistent filters
- [ ] Backfill script: tag existing dealers franchised + brand links
- [ ] Admin: franchised-only toggle on import CSV

**Exit:** US dealer pages rank at geo URLs; new imports are franchise-only.

---

## Phase 2 — SEO scale (Week 2)

- Programmatic pages: `/best-car-dealerships-in-{city}`, `/best-{brand}-dealers-in-{state}`
- Compare pages: `/compare/{brand-a}-vs-{brand-b}-dealers-{city}`
- Sitemap expansion + `AggregateRating` JSON-LD everywhere
- Internal linking mesh (city ↔ brand ↔ dealer)
- Meilisearch wired to public search API

**Exit:** 1,000+ indexable landing pages from existing data.

---

## Phase 3 — Review & trust loops (Week 3)

- “Be the first to review” premium empty states
- Shareable review cards + OG images
- Local rankings widgets (“#3 BMW dealer in Chicago”)
- Trending / most reviewed dealers
- Verified purchase flow polish

**Exit:** Review submission rate measurable; social shares live.

---

## Phase 4 — Dealer acquisition (Week 4)

- CRM table `crm_outreach` + admin pipeline (GM, Principal, Marketing Dir)
- Luxury / multi-rooftop prioritization scores
- Enhanced drip templates (franchise-specific)
- Claim → Pro upgrade funnel metrics

**Exit:** 5+ paying Pro dealers in Chicago metro.

---

## Phase 5 — Premium & groups (Week 5+)

- `DealerGroup` dashboards (multi-location)
- Embeddable review widget for dealer sites
- API for inventory sync (Enterprise)
- RLS policies if moving auth to Supabase client

---

## Architecture decisions

1. **Keep Prisma + Postgres** (Supabase-compatible URL) — no rewrite.
2. **Canonical dealer URL = geo path for US** — `/dealership/{slug}` redirects.
3. **Franchised-only is a data filter**, not a separate product — independents hidden via `isFranchised`.
4. **Meilisearch** for search at scale; Prisma until index warm.
5. **No manual publish** — `isPublished: true` on import default.

---

## Commands

```bash
npm run db:migrate:franchise-v1    # schema columns + DealerGroup
npm run seed:dealers:franchised    # US franchised OSM import (subset)
npm run backfill:franchised        # tag existing dealers (Phase 1 follow-up)
```
