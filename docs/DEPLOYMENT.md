# DealerVoice – Production Deployment Guide

## Prerequisites

- Docker & Docker Compose v2
- Node.js 20+
- PostgreSQL 16 (or use Docker)
- A domain with DNS pointing to your server
- SSL certificate (Let's Encrypt recommended)

---

## 1. Environment Setup

```bash
cp .env.example .env.local
# Fill in ALL required values — see comments in .env.example
```

**Critical values to set:**
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | 32+ char random string (`openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | From Stripe dashboard → Webhooks |
| `OPENAI_API_KEY` | For AI features |
| `RESEND_API_KEY` | For transactional email |
| `AWS_ACCESS_KEY_ID` | For S3 file uploads |

---

## 2. Database Setup

```bash
# Push schema to database
npx prisma migrate deploy

# Seed initial data (countries, brands, admin user)
npm run db:seed

# Setup Meilisearch indexes
npx tsx scripts/setup-search.ts
```

---

## 3. Stripe Setup

1. Create products in Stripe Dashboard:
   - **Pro Monthly** → $49/month
   - **Pro Annual** → $479/year
   - **Enterprise Monthly** → $149/month
   - **Enterprise Annual** → $1,439/year

2. Add the price IDs to `.env.local`

3. Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`

---

## 4. Docker Deployment

```bash
# Build and start all services
docker compose up -d --build

# Run migrations inside container
docker compose exec app npx prisma migrate deploy

# View logs
docker compose logs -f app

# Scale the app (for load balancing)
docker compose up -d --scale app=3
```

---

## 5. SSL / Nginx

```bash
# Install certbot
apt install certbot

# Get certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to docker/certs/
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/certs/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/certs/

# Update nginx.conf with your domain, then restart nginx
docker compose restart nginx
```

---

## 6. Vercel Deployment (Alternative)

```bash
npm i -g vercel

# Link project
vercel

# Set environment variables
vercel env add DATABASE_URL production
# ... repeat for all env vars

# Deploy
vercel --prod
```

> **Note:** For Vercel, use a managed PostgreSQL (Supabase, Neon, or Vercel Postgres) and a Redis-compatible service (Upstash).

---

## 7. CI/CD (GitHub Actions)

Required repository secrets:
```
STAGING_HOST, STAGING_USER, STAGING_SSH_KEY
PROD_HOST, PROD_USER, PROD_SSH_KEY
```

The pipeline runs automatically on push to `main`:
1. Type check → Lint → Tests
2. Build & push Docker image to GHCR
3. Deploy to staging
4. Deploy to production (requires manual approval via GitHub Environments)

---

## 8. Post-Deployment Checklist

- [ ] Verify `/api/auth/register` works (create a test account)
- [ ] Verify Stripe webhook receives events
- [ ] Verify email sending via Resend
- [ ] Verify file uploads to S3
- [ ] Verify Meilisearch indexing
- [ ] Run `npm run db:seed` in production
- [ ] Set up monitoring (Sentry, Datadog, or similar)
- [ ] Configure Cloudflare CDN for the domain
- [ ] Set up database backups (daily `pg_dump`)

---

## 9. Maintenance

```bash
# Database backup
docker compose exec postgres pg_dump -U dealervoice dealervoice > backup_$(date +%Y%m%d).sql

# View application logs
docker compose logs -f app --tail=100

# Update to latest image
docker compose pull && docker compose up -d

# Run Prisma migrations after schema changes
docker compose exec app npx prisma migrate deploy
```

---

## 10. Performance Tuning

- Enable Redis caching (already wired in — ensure `REDIS_URL` is set)
- Configure Cloudflare caching rules for `/dealership/*` pages (cache for 5 minutes)
- Set PostgreSQL `shared_buffers = 256MB` and `work_mem = 16MB` for production
- Enable Next.js ISR for high-traffic dealership pages
- Use a CDN (Cloudflare or AWS CloudFront) for static assets and images
