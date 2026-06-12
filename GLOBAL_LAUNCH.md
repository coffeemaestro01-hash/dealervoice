# DealerVoice — Global Launch Plan

Track progress in **Admin → Launch tracker** and money in **Admin → Platform income** (SUPER_ADMIN).

## Payment: Stripe (USD)

Dealer billing runs through **Stripe** (USD). Built in Chicago, available worldwide.

**Webhook URL:** `https://dealervoice.io/api/webhooks/stripe`

## Five phases

| Phase | Focus | Status | Where money shows |
|-------|--------|--------|-------------------|
| **1** | Affiliates, outreach drip, /chicago | Shipped | AFFILIATE_CLICK |
| **2** | Inventory + Enterprise API sync | Shipped | SEO + listing CTAs |
| **3** | Stripe Pro/Enterprise + promos | Live | SUBSCRIPTION |
| **4** | Lead fees + sponsorship checkout | Shipped | LEAD_FEE, SPONSORSHIP |
| **5** | Chicago wedge — reviews + 5 Pro dealers | In progress | All streams |

## Automated ops (no manual work)

| Cron | Schedule | What it does |
|------|----------|--------------|
| `/api/cron/outreach-drip` | Daily 10:00 UTC | Sends drip follow-ups; starts IL drips |
| `/api/cron/discover-emails` | Tue 6:00 UTC | Scrapes dealer websites for emails (Illinois) |

## Revenue streams

1. **Subscriptions** — Pro $199/mo, Enterprise $499/mo (Stripe). Per-dealer promo codes via outreach drip.
2. **Lead fees** — $49 when dealer marks quote **Converted** (Stripe invoice auto-charged).
3. **Sponsorship** — `/advertise` → Stripe checkout ($299 city / $499 homepage, 30 days). Auto-activates sponsor flag.
4. **Affiliate / AdSense** — Parked until external approvals.

## Commands

```bash
npm run db:migrate:monetization-v2
npm run outreach:discover-emails -- --state Illinois --limit 50
npm run resend:domain-setup
```

## Slack alerts

Set `SLACK_WEBHOOK_URL` in Vercel → Incoming Webhook from dealervoice.slack.com. Alerts auto-enable when URL is present.

## Chicago wedge (Phase 5)

- Landing: https://dealervoice.io/chicago
- Goal: 5+ Pro dealers, 50+ real reviews in Illinois
- WhatsApp Business: +1 (872) 347-0915
