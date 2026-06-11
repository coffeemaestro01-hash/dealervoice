# DealerVoice — Global Launch Plan

Track progress in **Admin → Launch tracker** and money in **Admin → Platform income** (SUPER_ADMIN).

## Payment: Cashfree only

All dealer billing runs through **Cashfree Payment Gateway** (INR). USD/GBP on the pricing page are reference amounts. Cashfree can accept UPI, cards, net banking, and some international cards depending on your merchant setup.

**Webhook URL:** `https://dealervoice.io/api/webhooks/cashfree`

## Five phases

| Phase | Focus | Status | Where money shows |
|-------|--------|--------|-------------------|
| **1** | Geo affiliate ads, AdSense, outreach | Shipped | Income → AFFILIATE_CLICK, ADSENSE (manual) |
| **2** | Global inventory MVP | Shipped | SEO traffic → affiliate; listing CTAs |
| **3** | Cashfree Pro/Enterprise | In progress | Income → SUBSCRIPTION on webhook |
| **4** | Worldwide content (US/UK blogs, global homepage) | Shipped | Organic → ads + affiliates |
| **5** | Sponsorship ledger, lead fees, payout imports | In progress | SPONSORSHIP, LEAD_FEE, AFFILIATE_PAYOUT |

## Revenue streams (your checklist)

1. **Affiliate** — Paste Admitad (IN) + US/UK program links in Admin → Ad revenue per country.
2. **AdSense** — After approval, record monthly payout in Admin → Platform income.
3. **Subscriptions** — Enable live Cashfree keys; dealers pay on billing page.
4. **Sponsorship** — Sell city slots; record payment in Platform income.
5. **Leads** — Quote form live; bill dealers when you enable lead fees (Phase 5).
6. **Inventory** — Pro dealers add listings; drives search + insurance CTAs.

## Commands

```bash
npm run seed:global          # India + global ads + all blog posts
node scripts/db-push-direct.mjs
```

## Your weekly ops

- [ ] Record AdSense / affiliate payouts in Platform income
- [ ] Outreach 20 dealers (Admin → Outreach queue)
- [x] Admitad adspace verified (meta tag on site)
- [ ] Join Admitad programs (PolicyBazaar, Acko, BankBazaar) and paste program IDs in Admin → Ad revenue (param: `admitad`)
- [ ] Get 5 dealers to upload inventory (Pro or manual seed)
