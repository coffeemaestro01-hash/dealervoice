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

## Email pipeline (Resend)

Each paid dealership gets a unique **ingest address**:

```
inbox-{dealership-slug}@mail.dealervoice.io
```

Shown in **Inbox → Settings** after first load.

### Outbound (agent replies)

When an agent sends a reply in Inbox, the app:

1. Saves the message to the ticket
2. Sends email via **Resend** from your verified domain, e.g. `{Dealership Name} via DealerVoice <noreply@send.dealervoice.io>`
3. Subject includes `[DV-000142]` for threading
4. Sets **Reply-To** to the dealer&apos;s support address from Settings (or `support@dealervoice.io`)

Uses `RESEND_API_KEY` and `EMAIL_FROM` (or defaults to `noreply@send.dealervoice.io`). Works on the **free Resend plan** — no second domain required.

### Inbound (customer email → ticket) — optional

Requires Resend **Enable Receiving** (MX records) or a paid second domain. Skip on free plan if ImprovMX handles `@dealervoice.io` mail.

### Environment variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key (already used site-wide) |
| `EMAIL_FROM` | Verified sender, e.g. `DealerVoice <noreply@send.dealervoice.io>` |
| `INBOX_SEND_FROM` | Optional override for inbox From address (default `noreply@send.dealervoice.io`) |
| `INBOX_REPLY_TO` | Optional fallback Reply-To if dealer has no support address in Settings |
| `INBOX_INBOUND_DOMAIN` | For future inbound (default `mail.dealervoice.io`) |
| `INBOX_INBOUND_WEBHOOK_SECRET` | Bearer secret for `/api/inbox/inbound` when inbound is enabled |

## Public web form

`POST /api/inbox/web-form` with `{ slug, name, email, subject, message }` creates a ticket for a paid dealership.

## Related docs

- Production deploy: `docs/DEPLOYMENT.md` §8
- Legacy tooling removal: `docs/DECOMMISSION_GUIDE.md`
