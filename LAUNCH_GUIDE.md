# DealerVoice — Launch Guide, Credentials & Next Steps

_Last updated: 2026-05-31_

---

## 🔑 1. CREDENTIALS YOU NEED

### App admin login (created by the seed)
| Field | Value |
|-------|-------|
| URL | https://dealervoice-psi.vercel.app/login |
| Email | `admin@dealervoice.com` |
| Password | `Admin@123!` |
| Role | SUPER_ADMIN (full platform access) |

> ⚠️ **Change this password** after first login (or create a new admin and delete this one).

### Supabase database (you created this)
| Field | Value |
|-------|-------|
| Project | `coffeemaestro01-hash's Org` → `dealervoice` |
| Host | `aws-1-ap-southeast-1.pooler.supabase.com:6543` |
| User | `postgres.hnzkheobcnutsuddgrpb` |
| Password | `Dms@27041995!!!` |
| Dashboard | https://supabase.com/dashboard |

> 🔴 **SECURITY:** This DB password was typed in plain text during setup. Rotate it:
> Supabase → Settings → Database → Reset password → then update `DATABASE_URL` in Vercel
> (Settings → Environment Variables) and your local `.env.local`.

### Accounts already in your name (you signed up, you know these passwords)
- **GitHub** — `coffeemaestro01-hash` (repo: `dealervoice`)
- **Vercel** — `coffeemaestro01-hash` (hosting)
- **Supabase** — same email

### Secrets set in Vercel that I cannot read (encrypted — verify they're real)
These 8 env vars exist in Vercel. Some may still be **placeholder values** from setup.
Check each: Vercel → dealervoice → Settings → Environment Variables.

| Variable | Should be | If it currently says... |
|----------|-----------|--------------------------|
| `NEXTAUTH_SECRET` | a long random string | `your_secret_here` → **regenerate** (see below) |
| `RESEND_API_KEY` | real Resend key | `your_resend_key` → email won't send |
| `CRON_SECRET` | random string | `your_cron_secret` → fine, just protects cron |
| `DATABASE_URL` | the Supabase URL | ✅ working (site loads data) |
| `NEXTAUTH_URL` | your live URL | should be `https://dealervoice-psi.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | your live URL | same as above |
| `EMAIL_DOMAIN` | `resend.dev` (or your domain) | ok for testing |
| `NEXT_PUBLIC_AI_ENABLED` | `false` | ok (AI off for now) |

Generate a strong `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## ✅ 2. WHAT WORKS RIGHT NOW (no signup needed)

- 🌐 Live site: **https://dealervoice-psi.vercel.app**
- Black & gold themed homepage with new logo
- 6 demo dealerships + 12 reviews visible
- Browse / search dealers, dealer detail pages, pricing page
- **Email + password** sign-up & login (NextAuth credentials)
- Admin dashboard, dealer dashboard, write-a-review flow
- Database: 10 countries, 5 cities, 30 brands, 6 dealers

---

## 🟡 3. SIGNUPS REQUIRED TO MAKE EVERYTHING FUNCTIONAL

Ordered by priority for a waitlist launch.

### Priority 1 — Email delivery (so signups/password-resets actually send)
- **Resend** → https://resend.com (free: 3,000 emails/mo)
  1. Sign up, verify your sending domain (or use `onboarding@resend.dev` for tests)
  2. Create an API key
  3. Put it in Vercel as `RESEND_API_KEY`, set `EMAIL_DOMAIN`
- Without this: users can still register/login, but verification & reset emails won't send.

### Priority 2 — Social login (optional but expected)
Currently the "Sign in with Google/Facebook/Apple" buttons need keys:
- **Google** → https://console.cloud.google.com → OAuth consent + credentials
  - Add env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Redirect URI: `https://dealervoice-psi.vercel.app/api/auth/callback/google`
- **Facebook** → https://developers.facebook.com → `FACEBOOK_CLIENT_ID/SECRET`
- **Apple** → https://developer.apple.com (paid, $99/yr — skip for launch)
> If you don't add these, just hide the social buttons — email login works fine.

### Priority 3 — Payments (only when you start charging)
- **Razorpay** → https://razorpay.com (Indian founder friendly)
  1. Sign up, complete KYC (PAN, bank account)
  2. Create subscription **Plans** for PRO and ENTERPRISE
  3. Add env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
     plan IDs (`RAZORPAY_PLAN_PRO_*`, `RAZORPAY_PLAN_ENTERPRISE_*`)
  4. Webhook URL: `https://dealervoice-psi.vercel.app/api/webhooks/razorpay`
- Without this: Free tier works; paid upgrade buttons won't complete checkout.

### Priority 4 — Nice-to-haves (all optional, app degrades gracefully)
| Service | Purpose | Signup |
|---------|---------|--------|
| Cloudflare R2 | Image/logo uploads (10 GB free) | https://dash.cloudflare.com |
| Upstash Redis | Caching (free tier) | https://upstash.com |
| Google Gemini | AI review insights (free tier) | https://aistudio.google.com |
| Custom domain | e.g. dealervoice.com | Vercel → Domains |

---

## 🚀 4. RECOMMENDED LAUNCH CHECKLIST

1. [ ] Log in as admin, change the admin password
2. [ ] Verify `NEXTAUTH_SECRET` is a real random value (not placeholder)
3. [ ] Sign up for **Resend**, add API key → test a real signup email
4. [ ] Rotate the Supabase DB password
5. [ ] (Optional) Add **Google OAuth** for one-click sign-in
6. [ ] Replace the 6 demo dealers with real ones (or keep as samples)
7. [ ] Add a custom domain (optional but more professional)
8. [ ] Invite a handful of waitlist users, watch Vercel logs for errors
9. [ ] Add **Razorpay** only when you're ready to take payments

---

## 🧪 5. TEST RESULTS (this session)

- Production build: ✅ 28 routes compiled, 0 errors
- Database integrity suite: ✅ 10/10 passed (read, write, relations, delete)
- Live HTTP checks: ✅ 200 on `/`, `/dealers`, `/pricing`, `/login`, `/register`, dealer detail pages
- Theme + logo: ✅ confirmed live (gold/black, new logo rendering)

---

## 📁 6. WHERE THINGS LIVE

- Logos: `public/logo/{svg,png,jpg}/` + `<Logo>` component in `components/common/Logo.tsx`
- Regenerate logos: `node scripts/gen-logos.js`
- Theme tokens: `app/globals.css` (gold/night utilities) + `tailwind.config.ts` (`gold`, `night` scales)
- Seed data: `prisma/seed.ts` — run with `npx tsx prisma/seed.ts` (needs `DATABASE_URL`)
- Platform tests: `node test-platform.js`
