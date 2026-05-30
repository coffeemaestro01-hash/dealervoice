# DealerVoice — Zero-Cost Lean Launch Guide

Total monthly cost: **$0** (within free tier limits)

---

## Free Tier Stack

| Service | Free Limit | Purpose |
|---|---|---|
| **Vercel** | 100GB bandwidth, unlimited deploys | App hosting |
| **Supabase** | 500MB DB, 2 projects | PostgreSQL |
| **Upstash** | 10K commands/day | Redis cache |
| **Cloudflare R2** | 10GB storage, 1M reads/month | File uploads |
| **Resend** | 3,000 emails/month | Transactional email |
| **Google OAuth** | Unlimited | Social login |

---

## Step 1 — GitHub

```bash
cd /Users/dms/dealervoice
git init
git add .
git commit -m "Initial commit"
# Create repo at github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/dealervoice.git
git push -u origin main
```

---

## Step 2 — Supabase (Database)

1. Go to **[supabase.com](https://supabase.com)** → New project
2. Pick a region close to your users, set a strong password
3. Wait ~2 minutes for provisioning
4. Go to **Settings → Database → Connection string**
5. Select **Transaction** pooler, copy the URI (port 6543)
6. It looks like: `postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
7. Add `?pgbouncer=true&connection_limit=1` to the end (required for serverless)

> **Save this as** `DATABASE_URL` in your env.

---

## Step 3 — Upstash (Redis)

1. Go to **[upstash.com](https://upstash.com)** → Create Database
2. Type: **Redis**, Region: closest to Supabase region
3. Enable **TLS**, click Create
4. On the database page click **.env** tab
5. Copy the `UPSTASH_REDIS_REST_URL` — but you need the **ioredis format** instead:
   - Click **Details** tab → copy the **Endpoint** and **Password**
   - Format: `rediss://default:[password]@[endpoint]:6379`

> **Save this as** `REDIS_URL` in your env.

---

## Step 4 — Cloudflare R2 (Storage)

1. Go to **[dash.cloudflare.com](https://dash.cloudflare.com)** → R2 Object Storage
2. Create a bucket named `dealervoice-media`
3. Under bucket settings → enable **Public access** (for serving uploaded images)
4. Copy the **Public bucket URL** → that's your `NEXT_PUBLIC_CDN_URL`
5. Go to **R2 → API Tokens → Create API Token**
   - Permissions: Object Read & Write on `dealervoice-media`
   - Copy Access Key ID and Secret Access Key
6. Your S3 endpoint is: `https://[YOUR_ACCOUNT_ID].r2.cloudflarestorage.com`

> **Save** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_ENDPOINT`, `NEXT_PUBLIC_CDN_URL`.

---

## Step 5 — Resend (Email)

1. Go to **[resend.com](https://resend.com)** → Sign up free
2. **Add a domain** (even a subdomain like `mail.yourdomain.com` works)
   - Add the 3 DNS records they show you in your domain registrar
   - Wait for verification (usually < 5 minutes)
3. Go to **API Keys** → Create API Key → copy it

> **Save as** `RESEND_API_KEY` and set `EMAIL_DOMAIN` to your verified domain.

> **No domain yet?** Use `onboarding@resend.dev` for testing (Resend provides this by default).

---

## Step 6 — Google OAuth (Social Login)

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**
2. New project → Enable **Google+ API** (or "People API")
3. **Credentials → Create → OAuth 2.0 Client ID**
   - Application type: Web application
   - Authorised redirect URIs:
     ```
     https://YOUR-APP.vercel.app/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```
4. Copy Client ID and Client Secret

> **Save as** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## Step 7 — Vercel (Hosting)

1. Go to **[vercel.com](https://vercel.com)** → Import Git Repository
2. Select your GitHub repo → Framework: **Next.js** (auto-detected)
3. **Before deploying**, add Environment Variables:
   - Click **Environment Variables** in the deploy screen
   - Copy every line from `.env.lean`, fill in your values, add them one by one
   - **Required to start:** `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `EMAIL_DOMAIN`
4. Click **Deploy**

> After deploy, copy your `.vercel.app` URL and update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` in Vercel env settings, then **redeploy**.

---

## Step 8 — Run Database Migrations

After first deploy, run migrations using Vercel CLI or Supabase SQL editor:

**Option A — Vercel CLI:**
```bash
npm i -g vercel
vercel env pull .env.local    # pulls your production env locally
npx prisma migrate deploy
npx prisma db seed
```

**Option B — Supabase SQL Editor:**
```bash
# Generate migration SQL locally first:
npx prisma migrate dev --create-only --name init
# Then paste the SQL from prisma/migrations/*/migration.sql into Supabase SQL Editor
```

---

## Step 9 — Verify Everything Works

Open your Vercel URL and check:

- [ ] Home page loads
- [ ] Register a new account (`/register`)
- [ ] Google login works
- [ ] Search dealers (`/dealers`)
- [ ] Admin login: `admin@dealervoice.com` / `Admin@123!` → `/dashboard/admin`
- [ ] Check email arrives (register sends verification email)
- [ ] Upload an image in a review (tests R2)

---

## Step 10 — Custom Domain (Optional, Free)

1. In Vercel → Your project → **Domains**
2. Add your domain (e.g. `dealervoice.com`)
3. Add the CNAME/A records shown to your registrar
4. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` env vars to `https://dealervoice.com`
5. Update Google OAuth redirect URI to `https://dealervoice.com/api/auth/callback/google`
6. Redeploy

---

## When You Hit Free Tier Limits

| Service | Limit | Upgrade cost |
|---|---|---|
| Supabase | 500MB DB | $25/mo (Pro) |
| Upstash | 10K cmd/day | $0.20 per 100K after |
| R2 | 10GB | $0.015/GB after |
| Resend | 3K emails/mo | $20/mo (50K emails) |
| Vercel | 100GB bandwidth | $20/mo (Pro) |

At typical early-stage traffic (~1K users, ~5K reviews) you won't hit any of these.

---

## Enable AI Later (When Ready)

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Add credits ($5 minimum)
3. Create an API key
4. Add to Vercel env vars:
   ```
   OPENAI_API_KEY=sk-...
   NEXT_PUBLIC_AI_ENABLED=true
   ```
5. Redeploy — AI features activate automatically

At ~$0.15 per 1000 GPT-4o-mini tokens, typical usage costs **under $5/month** for a small platform.
