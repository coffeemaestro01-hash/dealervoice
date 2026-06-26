# LinkedIn Autopilot — Setup Guide (DealerVoice)

Posts unique growth/product content to [linkedin.com/company/dealervoice](https://www.linkedin.com/company/dealervoice/) every 3 hours via Vercel cron.

**Your app (already created):** DealerVoice · Client ID `86bahxufjv8xl6` · OAuth redirect → n8n (`dksoni.app.n8n.cloud`)

---

## Architecture

```
Vercel cron (every 3h)
    → GET /api/cron/linkedin-post
        → pick template (14-day dedup)
        → render copy + hashtags from live DB stats
        → fetch PNG from /api/social/linkedin-image?theme=…
        → LinkedIn REST API: upload image + create post
        → log to SocialPostLog table
```

**Admin:** `/dashboard/admin/social` — preview next post, post now, view log.

---

## Prerequisites

| Requirement | Why |
|---|---|
| **Super admin** on DealerVoice LinkedIn company page | Only page admins can authorize org posting |
| **Super admin** on LinkedIn Developer app “DealerVoice” | Add products, scopes, team members |
| **Vercel env access** | `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORGANIZATION_ID`, `CRON_SECRET` |
| **Code deployed** | LinkedIn routes + cron must be on production |
| **DB migrated** | `SocialPostLog` table |

---

## Step 1 — Link app to company page

1. Open [LinkedIn Developers](https://www.linkedin.com/developers/) → **DealerVoice** app.
2. **Settings** tab → confirm app name/logo match DealerVoice.
3. Under **Company page association** (or “LinkedIn Page”), associate with **DealerVoice** company page.
   - You must be a **super admin** of that page.
   - If missing: Company page → **Admin tools** → **Manage admins** → ensure your personal account is super admin.

---

## Step 2 — Request API products

1. **Products** tab → **Add products**.
2. Request **Community Management API** (required for org feed posts).
3. Optionally request **Share on LinkedIn** if Community Management is unavailable in your region/tier.
4. Approval can be instant or take 1–5 business days. Until approved, posts will fail with `403` / product unauthorized.

> LinkedIn renamed/consolidated products over time. You need the product that grants **organization social actions** (`w_organization_social`).

---

## Step 3 — Configure OAuth scopes

1. **Auth** tab (you’re already here).
2. Under **OAuth 2.0 scopes**, ensure these are added:

| Scope | Purpose |
|---|---|
| `w_organization_social` | Create posts as the company page |
| `r_organization_social` | Read org posts (optional, for analytics) |
| `rw_organization_admin` | Manage org content / upload images |

3. **Authorized redirect URLs** — keep your n8n callback:
   ```
   https://dksoni.app.n8n.cloud/rest/oauth2-credential/callback
   ```
4. If you also want a manual browser test, add:
   ```
   https://dealervoice.io/api/auth/linkedin/callback
   ```
   (Only needed if you build a callback route; n8n alone is fine.)

5. **Token TTL:** 2 months (5,184,000 seconds) — plan refresh before expiry.

---

## Step 4 — Get Organization ID

You need the **numeric** ID (not the vanity name `dealervoice`).

### Option A — Admin UI (easiest)

1. Go to [linkedin.com/company/dealervoice/admin](https://www.linkedin.com/company/dealervoice/admin).
2. **Admin tools** → **Page info** — some accounts show the ID here.

### Option B — API (after you have any valid token)

```bash
curl -s 'https://api.linkedin.com/rest/organizations?q=vanityName&vanityName=dealervoice' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'LinkedIn-Version: 202401' \
  -H 'X-Restli-Protocol-Version: 2.0.0'
```

Look for `"id": 12345678` in the response. Use **only the number** in Vercel:

```
LINKEDIN_ORGANIZATION_ID=12345678
```

---

## Step 5 — Obtain access token

Two paths. **Path A (n8n)** matches your existing redirect URI.

### Path A — n8n OAuth (recommended for refresh)

1. **n8n** → **Credentials** → **OAuth2 API** (or LinkedIn-specific if available).
2. Configure:
   - **Grant Type:** Authorization Code
   - **Authorization URL:** `https://www.linkedin.com/oauth/v2/authorization`
   - **Access Token URL:** `https://www.linkedin.com/oauth/v2/accessToken`
   - **Client ID:** `86bahxufjv8xl6`
   - **Client Secret:** from LinkedIn **Auth** tab (Primary Client Secret)
   - **Scope:** `w_organization_social r_organization_social rw_organization_admin`
   - **Auth URI Query Parameters:** (none unless LinkedIn requires)
3. Click **Connect** → sign in as a **company page super admin** → authorize.
4. Copy the **access token** from the credential (n8n shows it after connect).
5. Paste into Vercel as `LINKEDIN_ACCESS_TOKEN`.

**Refresh workflow (set calendar reminder every ~7 weeks):**

- n8n scheduled workflow → refresh OAuth token → HTTP Request to update Vercel env via Vercel API, **or** manually paste new token into Vercel every 2 months.
- LinkedIn refresh tokens: use `grant_type=refresh_token` if your OAuth flow returned a refresh token.

### Path B — Manual OAuth (quick test)

1. Build authorize URL (replace `REDIRECT_URI` with your n8n callback or a local test URI registered in the app):

```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86bahxufjv8xl6&redirect_uri=REDIRECT_URI&scope=w_organization_social%20r_organization_social%20rw_organization_admin&state=dealervoice
```

2. Open in browser → approve → copy `code` from redirect URL.
3. Exchange code for token:

```bash
curl -X POST 'https://www.linkedin.com/oauth/v2/accessToken' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code' \
  -d 'code=AUTHORIZATION_CODE' \
  -d 'redirect_uri=REDIRECT_URI' \
  -d 'client_id=86bahxufjv8xl6' \
  -d 'client_secret=YOUR_CLIENT_SECRET'
```

4. Use `access_token` from JSON response.

---

## Step 6 — Vercel environment variables

In **Vercel → dealervoice → Settings → Environment Variables** (Production):

| Variable | Example | Notes |
|---|---|---|
| `LINKEDIN_ACCESS_TOKEN` | `AQV...` | From Step 5; rotate every ~2 months |
| `LINKEDIN_ORGANIZATION_ID` | `12345678` | Numeric only |
| `CRON_SECRET` | (existing) | Already used by other crons |
| `NEXT_PUBLIC_APP_URL` | `https://dealervoice.io` | Image fetch uses this URL |

**Redeploy** after adding env vars (env changes don’t apply to running instances until redeploy).

---

## Step 7 — Deploy code + migrate database

The LinkedIn feature must be on production before cron/admin work.

```bash
# After commit + push to main (auto-deploys on Vercel)
npm run db:migrate:social-post   # against production DATABASE_URL
```

Creates `SocialPostLog` table for deduplication and admin log.

---

## Step 8 — Test end-to-end

### 8a. Image API (no LinkedIn token needed)

Open in browser:

```
https://dealervoice.io/api/social/linkedin-image?theme=chicago
```

Should return a 1200×627 PNG. Themes: `trust`, `pro`, `chicago`, `reviews`, `growth`, `badge`.

### 8b. Admin preview

1. Log in as **SUPER_ADMIN** or **REVENUE**.
2. Go to **Admin → LinkedIn autopilot** (`/dashboard/admin/social`).
3. Confirm **API: Connected** (green stat).
4. Review **Next scheduled post preview** (copy + image).
5. Click **Post now** (SUPER_ADMIN only) — should toast success and appear on company feed within 1–2 minutes.

### 8c. Cron (manual trigger)

```bash
curl -s "https://dealervoice.io/api/cron/linkedin-post?key=YOUR_CRON_SECRET"
```

Expected JSON:

```json
{ "ok": true, "posted": true, "templateKey": "chicago-built", "externalId": "..." }
```

If not configured:

```json
{ "ok": true, "skipped": true, "reason": "not_configured" }
```

---

## Step 9 — n8n backup trigger (optional)

Your OPERATIONS.md allows n8n for social glue. Use it as **backup** if Vercel cron misses a slot:

**Workflow:** Schedule (every 3h) → HTTP Request

- **Method:** GET
- **URL:** `https://dealervoice.io/api/cron/linkedin-post?key={{ $env.CRON_SECRET }}`

Primary posting still runs in-app; n8n is optional redundancy.

---

## Content customization

### Templates

Edit `lib/social/linkedin/content.ts`:

- **16 base templates** + **8 variant hooks** = 24 unique posts before reuse.
- Each template: `key`, `body`, `hashtags`, `imageTheme`, optional `link()`, optional `videoUrl`.
- **14-day dedup:** same template won’t repeat within 14 days.
- Live stats injected: dealer count, IL count, Chicagoland count, review count.

### Auto-generated images

`/api/social/linkedin-image?theme=THEME` — no upload needed.

### Video posts (manual)

1. Add MP4 to `public/marketing/` (e.g. `public/marketing/chicago-demo.mp4`).
2. Set on a template:
   ```ts
   videoUrl: "https://dealervoice.io/marketing/chicago-demo.mp4",
   ```
3. **Note:** Current API path uploads **images** only. Native video posts require LinkedIn video upload API (not yet wired). For now, use video URLs in post copy or link to YouTube/Loom until video upload is added.

### Posting frequency

Current cron: **`0 */3 * * *`** = 8 posts/day UTC.

**Recommended for LinkedIn engagement:** 2–3 posts/day in US business hours.

Edit `vercel.json`:

```json
{ "path": "/api/cron/linkedin-post", "schedule": "0 14,18,22 * * *" }
```

(14:00, 18:00, 22:00 UTC ≈ 9am, 1pm, 5pm US Eastern during standard time.)

Redeploy after changing `vercel.json`.

---

## Troubleshooting

| Error | Fix |
|---|---|
| `LINKEDIN_ACCESS_TOKEN or LINKEDIN_ORGANIZATION_ID not set` | Add env vars + redeploy |
| `LinkedIn API 403` | Community Management API not approved, or token lacks org scopes |
| `LinkedIn API 401` | Token expired — re-auth via n8n (2-month TTL) |
| `LinkedIn API 422` on `/posts` | Wrong org ID, or author URN mismatch |
| Image upload failed | Token needs `rw_organization_admin`; check org association |
| Duplicate skipped | Normal — same body hash already posted |
| Post in log as `failed` | Admin → LinkedIn autopilot → Recent posts shows `error` column |
| Cron 401 | `CRON_SECRET` mismatch between Vercel env and request |

### Verify token can post

```bash
curl -s -X POST 'https://api.linkedin.com/rest/posts' \
  -H "Authorization: Bearer $LINKEDIN_ACCESS_TOKEN" \
  -H 'LinkedIn-Version: 202401' \
  -H 'X-Restli-Protocol-Version: 2.0.0' \
  -H 'Content-Type: application/json' \
  -d '{
    "author": "urn:li:organization:YOUR_ORG_ID",
    "commentary": "DealerVoice API test — delete me",
    "visibility": "PUBLIC",
    "lifecycleState": "PUBLISHED",
    "distribution": { "feedDistribution": "MAIN_FEED" }
  }'
```

Delete test post from company page admin if successful.

---

## Checklist

- [ ] App linked to DealerVoice company page
- [ ] **Community Management API** product approved
- [ ] Scopes: `w_organization_social`, `r_organization_social`, `rw_organization_admin`
- [ ] Organization ID in Vercel
- [ ] Access token in Vercel (via n8n OAuth)
- [ ] Code deployed to production
- [ ] `npm run db:migrate:social-post` on prod
- [ ] Admin → Post now → visible on LinkedIn
- [ ] Cron manual curl returns `posted: true`
- [ ] Calendar reminder: refresh token before 2-month expiry

---

## Related

- Paid ads (Google/Meta/gift cards): `docs/REVENUE-ADS-PLAYBOOK.md`
- Admin revenue hub: `/dashboard/admin/revenue`
- Deployment env reference: `docs/DEPLOYMENT.md`
