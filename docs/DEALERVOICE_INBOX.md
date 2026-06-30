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
2. Sends email via **Resend** from `{Dealership Name} <inbox-{slug}@mail.dealervoice.io>`
3. Subject includes `[DV-000142]` for threading
4. Sets `Reply-To` to the ingest address

Requires `RESEND_API_KEY` and verified sending domain (`mail.dealervoice.io` or your configured domain).

### Inbound (customer email → ticket)

1. Enable **Inbound** on your Resend domain (`INBOX_INBOUND_DOMAIN`, default `mail.dealervoice.io`)
2. Add DNS MX records Resend provides for that subdomain
3. Point Resend inbound webhook to:

   ```
   POST https://dealervoice.io/api/inbox/inbound
   Authorization: Bearer <INBOX_INBOUND_WEBHOOK_SECRET>
   ```

   Or header: `x-inbox-webhook-secret: <secret>`

4. Dealers **forward** their support mailbox to their ingest address, or receive mail directly on that address

**Threading:** Replies with `[DV-XXXXXX]` in the subject attach to the existing ticket. New mail creates a new ticket.

### Environment variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key (already used site-wide) |
| `INBOX_INBOUND_DOMAIN` | Default `mail.dealervoice.io` |
| `INBOX_INBOUND_WEBHOOK_SECRET` | Bearer secret for `/api/inbox/inbound` |

## Public web form

`POST /api/inbox/web-form` with `{ slug, name, email, subject, message }` creates a ticket for a paid dealership.

## Related docs

- Production deploy: `docs/DEPLOYMENT.md` §8
- Legacy tooling removal: `docs/DECOMMISSION_GUIDE.md`
