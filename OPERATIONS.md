# DealerVoice Operations

Operational runbook for billing, email, and peripheral automation.

## Billing emails

- **Sender:** `DealerVoice Billing <billing@dealervoice.io>` (Resend)
- **Triggers:** Stripe `invoice.paid` (subscriptions + lead fees) and sponsorship checkout completion
- **Content:** Amount, description, Stripe PDF link (when available), link to `/dashboard/dealer/billing`
- **Do not** rely on Stripe’s built-in customer invoice emails — disable them in the Stripe Dashboard (see below)

## Stripe Dashboard (one-time)

1. **Settings → Customer emails** — turn off “Successful payments” / invoice emails to customers (DealerVoice sends its own from `billing@dealervoice.io`).
2. **Settings → Billing → Customer portal** — enable the portal so dealers can update payment methods and view Stripe-hosted invoices via **Manage billing** in the dealer dashboard.
3. Ensure webhook endpoint includes `invoice.paid` and `checkout.session.completed`.

## Database migrations

```bash
npm run db:migrate:billing-v2   # Invoice v2 columns + SupportTicket tables
npx prisma generate
```

## Support tickets

- Dealers: `/dashboard/dealer/support` — create and view tickets
- Staff: `/dashboard/admin/support` — reply, internal notes, status updates
- Categories: billing, technical, claim, reviews, other

## Automation (n8n only)

Use **n8n** for peripheral glue (Slack notifications, Notion sync, optional digest triggers) and **social posting** (your external workflow). **Do not use Make.com.**

Examples:

- New support ticket → Slack `#ops`
- Weekly revenue snapshot → Notion ops page

Core billing and ticket flows live in the Next.js app and Stripe webhooks — not in external workflow tools.

## Resend

Verify `dealervoice.io` domain in Resend. Required aliases: `billing@`, `noreply@`, `support@`.
