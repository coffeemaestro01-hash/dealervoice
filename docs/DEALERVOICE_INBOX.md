# DealerVoice Inbox

Customer support ticketing for paid DealerVoice dealerships, hosted at **ticketing.dealervoice.io** (same app as dealervoice.io under `/ticketing/*`).

## Access

| Plan | Inbox | Team seats (DealerStaff, shared on Enterprise group) |
|------|-------|--------------------------------------------------------|
| Free | No — upgrade CTA | 0 |
| Pro | Yes | 5 |
| Pro+ | Yes | 10 |
| Enterprise | Yes (+ linked rooftops without separate sub) | 50 shared across primary + linked |

Subscription must be **ACTIVE**. Access continues until **period end** when cancelled.

## Setup

1. Run migration: `npm run db:migrate:inbox-v1` (also runs on Vercel build).
2. Add DNS: `ticketing.dealervoice.io` → Vercel project.
3. Paid dealer opens **Dashboard → Customer Inbox** or `/ticketing/inbox`.
4. Complete **Onboarding** (AI-guided email connect: Gmail, Microsoft, IMAP, forwarding).
5. Starter templates, automations, and SLA tiers seed on first access.

## Public web form

`POST /api/inbox/web-form` with `{ slug, name, email, subject, message }` creates a ticket for a paid dealership.

## Livehandbook

Goodfirms Livehandbook is **not** migrated. This module is a clean dealership-scoped inbox with generic auto-dealer templates only.
