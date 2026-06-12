# DealerVoice — Production Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (Neon, Supabase, or Vercel Postgres)
- Domain with DNS pointing to Vercel (or Docker host)
- Stripe account (USD billing)

---

## 1. Environment Setup

```bash
cp .env.example .env.local
# Fill in ALL required values — see comments in .env.example
```

**Critical values:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | 32+ char random string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://dealervoice.io` |
| `STRIPE_SECRET_KEY` | Stripe secret key (live or test) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_PRICE_PRO_MONTHLY` | Price ID for Pro $199/mo |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Price ID for Enterprise $499/mo |
| `CRON_SECRET` | Random string for Vercel cron auth |
| `RESEND_API_KEY` | Transactional email |
| `EMAIL_FROM` | e.g. `DealerVoice <noreply@send.dealervoice.io>` |

Optional: `SLACK_WEBHOOK_URL`, `MEILISEARCH_*`, `SUPABASE_*` (file uploads), `OPENAI_API_KEY` / `GEMINI_API_KEY`.

---

## 2. Database Setup

```bash
npx prisma migrate deploy
npm run db:seed
npm run seed:blog
npm run seed:research
npm run db:migrate:monetization-v2   # if not yet applied
```

---

## 3. Stripe Setup

1. Create products/prices in Stripe Dashboard (Pro $199/mo, Enterprise $499/mo).
2. Add env vars above to Vercel.
3. Webhook endpoint: `https://dealervoice.io/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
4. Test with promo code `PRO1USD` (create in Admin → Promotions).

---

## 4. Vercel Deployment (recommended)

```bash
vercel env pull .env.local   # optional
git push origin main         # auto-deploys
```

Crons are defined in `vercel.json` (outreach drip, email discovery, digest, reputation).

---

## 5. Docker Deployment (optional)

```bash
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

Stripe webhook path: `/api/webhooks/stripe` (see `docker/nginx.conf`).

---

## 6. Post-Deployment Checklist

- [ ] `npm run smoke` → 22/22 against production URL
- [ ] Stripe webhook receives test event
- [ ] Resend domain verified; test welcome email
- [ ] Admin login works (`/dashboard/admin`)
- [ ] `/chicago` and `/dealers/us` load
- [ ] Cron jobs visible on Admin → Health

---

## 7. Maintenance

```bash
npm run smoke
npm run outreach:discover-emails -- --all-us --limit 50
npm run seed:blog    # re-upsert US content + unpublish legacy India slugs
```

Primary launch doc: **`GLOBAL_LAUNCH.md`** at repo root.
