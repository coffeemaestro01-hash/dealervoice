# ─────────────────────────────────────────────────────────────────────────────
# DealerVoice — Zero-Cost Indian Bootstrapper Stack
# Copy this entire file to .env.local and fill in values step by step.
# ─────────────────────────────────────────────────────────────────────────────

# ── App ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://YOUR-APP.vercel.app"
NODE_ENV="production"
NEXT_PUBLIC_AI_ENABLED="false"

# ── Auth ──────────────────────────────────────────────────────────────────────
# Run: openssl rand -base64 32  →  paste result here
NEXTAUTH_URL="https://YOUR-APP.vercel.app"
NEXTAUTH_SECRET="PASTE_32_CHAR_RANDOM_STRING_HERE"

# ── Database — Supabase Free Tier ─────────────────────────────────────────────
# supabase.com → Project → Settings → Database → Transaction pooler URI (port 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# ── Redis — Upstash Free Tier ─────────────────────────────────────────────────
# upstash.com → Redis DB → Details tab → copy Endpoint + Password
# Format: rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379
REDIS_URL="rediss://default:[password]@[endpoint].upstash.io:6379"

# ── File Storage — Cloudflare R2 Free Tier ────────────────────────────────────
# dash.cloudflare.com → R2 → bucket: dealervoice-media → API Tokens
AWS_ACCESS_KEY_ID="your-r2-access-key-id"
AWS_SECRET_ACCESS_KEY="your-r2-secret-access-key"
AWS_REGION="auto"
S3_BUCKET="dealervoice-media"
S3_ENDPOINT="https://[ACCOUNT_ID].r2.cloudflarestorage.com"
NEXT_PUBLIC_CDN_URL="https://pub-[TOKEN].r2.dev"
NEXT_PUBLIC_CDN_DOMAIN="pub-[TOKEN].r2.dev"

# ── Email — Resend Free Tier (3,000 emails/month) ─────────────────────────────
# resend.com → API Keys → Create key
RESEND_API_KEY="re_XXXXXXXXXXXXXXXXXXXX"
EMAIL_DOMAIN="yourdomain.com"

# ── Google OAuth (Free) ───────────────────────────────────────────────────────
# console.cloud.google.com → Credentials → OAuth 2.0
# Redirect URI: https://YOUR-APP.vercel.app/api/auth/callback/google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ── Payments — Razorpay (Indian Gateway, Free to set up) ─────────────────────
# razorpay.com → Settings → API Keys → Generate Key
RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXXXX"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXXXX"
# Create plans in Razorpay Dashboard → Subscriptions → Plans
RAZORPAY_PRO_MONTHLY_PLAN_ID=""
RAZORPAY_PRO_ANNUAL_PLAN_ID=""
RAZORPAY_ENTERPRISE_MONTHLY_PLAN_ID=""
RAZORPAY_ENTERPRISE_ANNUAL_PLAN_ID=""

# ── AI — Disabled (leave blank for now) ──────────────────────────────────────
# OPENAI_API_KEY=""
# Or use Google Gemini free tier later:
# GEMINI_API_KEY=""

# ── Search — Disabled (Prisma fallback active) ────────────────────────────────
# MEILISEARCH_HOST=""
# MEILISEARCH_API_KEY=""

# ── Vercel Cron Protection ────────────────────────────────────────────────────
# Run: openssl rand -base64 32
CRON_SECRET="PASTE_RANDOM_STRING_HERE"

# ── Analytics — Optional ─────────────────────────────────────────────────────
# NEXT_PUBLIC_POSTHOG_KEY=""
