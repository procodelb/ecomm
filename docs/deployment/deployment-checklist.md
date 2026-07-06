# Deployment Checklist — ECOMM Store

> **Build status**: ✅ 91 routes, 0 errors, TypeScript clean
> **Target**: Vercel (Production)

---

## Phase 1: Pre-Deployment Verification

### 1.1 Environment Variables — Vercel Secrets

Set each as a **Secret** in Vercel Project Settings → Environment Variables → Production.

| # | Variable | Status | Notes |
|---|----------|--------|-------|
| 1 | `DATABASE_URL` | ✅ `.env.local` | Supabase pooler: `aws-1-us-west-1.pooler.supabase.com:6543` |
| 2 | `NEXT_PUBLIC_SUPABASE_URL` | ✅ `.env.local` | `https://pwgadikpldbsxsyijxav.supabase.co` |
| 3 | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ `.env.local` | Anon key present |
| 4 | `SUPABASE_SERVICE_ROLE_KEY` | ✅ `.env.local` | Service role key present |
| 5 | `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ `wrl9moj5` | |
| 6 | `NEXT_PUBLIC_SANITY_DATASET` | ✅ `production` | |
| 7 | `NEXT_PUBLIC_SANITY_API_VERSION` | ✅ `2024-01-01` | |
| 8 | `SANITY_API_TOKEN` | ✅ `.env.local` | Write token present |
| 9 | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ⛔ **PLACEHOLDER** | Needs `pk_test_...` or `pk_live_...` |
| 10 | `STRIPE_SECRET_KEY` | ⛔ **PLACEHOLDER** | Needs `sk_test_...` or `sk_live_...` |
| 11 | `STRIPE_WEBHOOK_SECRET` | ⛔ **PLACEHOLDER** | Needs `whsec_...` |
| 12 | `RESEND_API_KEY` | ✅ `re_gtWLBS7m_...` | Valid key present |
| 13 | `EMAIL_FROM` | ✅ `onboarding@resend.dev` | ⚠ Change to `noreply@ecomm-store.com` after domain verification |
| 14 | `ADMIN_NOTIFICATION_EMAIL` | ✅ `admin@ecomm-store.com` | Verify this inbox |
| 15 | `SUPPLIER_ORDERS_EMAIL` | ✅ `suppliers@ecomm-store.com` | Verify this inbox |
| 16 | `OPENAI_API_KEY` | ✅ Present | Key is valid but **429 insufficient_quota** — needs billing |
| 17 | `AI_MODEL` | ✅ `gpt-4o-mini` | |
| 18 | `AI_ASSISTANT_ENABLED` | ⛔ **Missing** | Set to `true` |
| 19 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⛔ **Missing** | Set G-XXXXXXXXXX |
| 20 | `GA_API_SECRET` | ⛔ **Missing** | |
| 21 | `NEXT_PUBLIC_META_PIXEL_ID` | ⛔ **Missing** | |
| 22 | `META_CONVERSIONS_ACCESS_TOKEN` | ⛔ **Missing** | |
| 23 | `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | ⛔ **Missing** | |
| 24 | `NEXT_PUBLIC_CLARITY_PROJECT_ID` | ⛔ **Missing** | |
| 25 | `NEXT_PUBLIC_HOTJAR_SITE_ID` | ⛔ **Missing** | |
| 26 | `CRON_SECRET` | ⛔ **Missing** | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| 27 | `NEXT_PUBLIC_SITE_URL` | ⛔ **Missing** | Set to production URL |

**Total**: 10✅ / 1⚠️ / 16⛔

### 1.2 `vercel.json` Env Mapping

The file maps 25 env vars via `@secret_name` references. Every secret above must exist as a Vercel Secret with the matching name:

- `@next_public_supabase_url`
- `@next_public_supabase_publishable_key`
- `@supabase_service_role_key`
- `@next_public_sanity_project_id`
- `@next_public_sanity_dataset`
- `@next_public_sanity_api_version`
- `@sanity_api_token`
- `@next_public_stripe_publishable_key`
- `@stripe_secret_key`
- `@stripe_webhook_secret`
- `@resend_api_key`
- `@email_from`
- `@admin_notification_email`
- `@supplier_orders_email`
- `@openai_api_key`
- `@ai_model`
- `@ai_assistant_enabled`
- `@next_public_ga_measurement_id`
- `@ga_api_secret`
- `@next_public_meta_pixel_id`
- `@meta_conversions_access_token`
- `@next_public_tiktok_pixel_id`
- `@next_public_clarity_project_id`
- `@next_public_hotjar_site_id`
- `@cron_secret`
- `@next_public_site_url`
- `@database_url`

### 1.3 Build Verification

| Check | Status |
|-------|--------|
| `npm run build` passes | ✅ 91 routes, 0 errors |
| TypeScript clean | ✅ 25.7s, 0 errors |
| All pages generate | ✅ 51 static pages |
| No server runtime errors | ✅ |

### 1.4 Route Verification

| Category | Count | Status |
|----------|-------|--------|
| Public pages (home, products, product details) | 4+ | ✅ |
| Auth pages (login, register, forgot-password, reset-password, auth-error, email-confirmation) | 6 | ✅ |
| Account pages (dashboard, orders, order-detail, addresses, wishlist, reviews, returns, support, support-detail, tracking, settings) | 11 | ✅ |
| Admin pages (dashboard, analytics, customers, customer-detail, inventory, orders, order-detail, products, product-new, product-detail, reviews, settings, studio, suppliers, supplier-new, supplier-detail, webhooks, webhook-detail) | 18 | ✅ |
| Cart/checkout (checkout, order-confirmation, order-confirmation-id) | 3 | ✅ |
| Info/slug | 1 | ✅ |
| SEO routes (robots.txt, sitemap.xml) | 2 | ✅ |
| API routes (auth, admin, account, checkout, webhooks, ai, sync, health, setup) | 42 | ✅ |
| **Total** | **91** | **✅** |

---

## Phase 2: Deployment

### 2.1 Vercel Project Setup

- [ ] Create Vercel project from GitHub repo
- [ ] Set **Framework Preset**: Next.js
- [ ] Configure **Build Command**: `npm run build`
- [ ] Configure **Output Directory**: `.next`
- [ ] Set **Node.js Version**: 20.x (matching local)
- [ ] Add all 27 Secrets (see 1.2)
- [ ] Set all secrets as **Production** environment only
- [ ] Configure **Domain**: `www.ecomm-store.com`
- [ ] Add `ecomm-store.com` (apex) redirect to `www`

### 2.2 Domain Configuration

- [ ] **CNAME** `www` → `cname.vercel-dns.com`
- [ ] **A record** `@` → `76.76.21.21`
- [ ] Wait for DNS propagation (5–30 mins)
- [ ] Verify in Vercel: Domain status = "Valid Configuration"

### 2.3 Deploy

- [ ] Push to `main` branch (or merge PR)
- [ ] Vercel auto-deploys via GitHub integration
- [ ] Monitor build logs for any issues
- [ ] Verify deployment URL: `https://www.ecomm-store.com`

### 2.4 Post-Deploy Vercel Config

- [ ] Enable **Vercel Cron Jobs** (for supplier sync every 30 min)
- [ ] Verify **Edge Functions** region: `iad1`, `sin1`, `syd1`
- [ ] Verify **Serverless Function** max duration: default (10s for hobby, 60s for pro)
- [ ] Enable **Automatic HTTPS** (default on)
- [ ] Set **Custom Cache Headers** for static assets (immutable: 1 year)

---

## Phase 3: External Service Configuration

### 3.1 Stripe (⚠ BLOCKED)

Requires user to provide keys before payment works.

- [ ] Create Stripe account or use existing
- [ ] Retrieve `pk_live_...` and `sk_live_...` from Stripe Dashboard → Developers → API Keys
- [ ] Create webhook endpoint: `https://www.ecomm-store.com/api/webhooks/stripe`
- [ ] Select events: `checkout.session.completed`, `checkout.session.expired`
- [ ] Retrieve `whsec_...` webhook signing secret
- [ ] Set all 3 Stripe secrets in Vercel

### 3.2 Supabase Database

| Check | Status | Notes |
|-------|--------|-------|
| Connection string valid | ✅ | Tested via local `prisma db push` |
| Pooler accessible | ✅ | `aws-1-us-west-1.pooler.supabase.com:6543` |
| `pgbouncer=true` set | ✅ | In `DATABASE_URL` |
| Prisma client generated | ✅ | `prisma generate` runs on `postinstall` |
| Tables exist | ✅ | Via `prisma db push` |
| RLS policies active | ⚠ | Verify after deploy |
| Auth configured | ✅ | Supabase Auth with email/password |

### 3.3 Sanity CMS

| Check | Status | Notes |
|-------|--------|-------|
| Project ID valid | ✅ `wrl9moj5` | |
| Dataset: `production` | ✅ | |
| API token valid | ✅ | Write token present in `.env.local` |
| 37 documents seeded | ✅ | Products, pages, etc. |
| CORS origins | ⚠ | Add `https://www.ecomm-store.com` to Sanity CORS settings |

### 3.4 Resend (Email)

| Check | Status | Notes |
|-------|--------|-------|
| API key valid | ✅ `re_gtWLBS7m_...` | |
| Domain verified | ⛔ | Must add DNS records for `ecomm-store.com` |
| Current from: | ⚠ | `onboarding@resend.dev` (100/day limit) |
| Target from: | | `noreply@ecomm-store.com` |

**Action**: Go to https://resend.com → Domains → Add `ecomm-store.com`, add DNS TXT record, verify. Then update `EMAIL_FROM` in Vercel secrets.

### 3.5 OpenAI

| Check | Status | Notes |
|-------|--------|-------|
| API key valid | ✅ | Key is structurally valid |
| Billing added | ⛔ | **429 insufficient_quota** — add payment method |
| Fallback works | ✅ | Graceful replies for all 5 assistant types |
| Assistant enabled | ✅ | `AI_ASSISTANT_ENABLED` not set → defaults to enabled |

**Action**: Go to https://platform.openai.com/settings/organization/billing → Add payment method.

---

## Phase 4: Cron Jobs

### 4.1 Supplier Sync

| Check | Status |
|-------|--------|
| Vercel Cron configured in `vercel.json` | ✅ `*/30 * * * *` |
| Path: `/api/sync/suppliers` | ✅ |
| Secret auth in route handler | ✅ `x-vercel-cron` header (Vercel) / `x-cron-secret` header (Supabase) |
| Supplier adapter system registered | ✅ 7 adapters |
| Action logging | ✅ `supplier_logs` table |

### 4.2 Supabase pg_cron (Optional Fallback)

If needed, send `x-cron-secret` header via Supabase SQL (requires `pg_net` v0.8+ for headers):
```sql
SELECT cron.schedule(
  'supplier-sync',
  '*/30 * * * *',
  $$SELECT net.http_post(
    url:='https://www.ecomm-store.com/api/sync/suppliers',
    headers:='{"x-cron-secret":"your_cron_secret"}'::jsonb
  )$$
);
```

---

## Phase 5: Security Verification

### 5.1 Security Headers

All applied via middleware (see `src/lib/security/headers.ts`):

| Header | Value | Status |
|--------|-------|--------|
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `X-Frame-Options` | `DENY` | ✅ |
| `X-XSS-Protection` | `1; mode=block` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | Restricted (camera=(), microphone=(), etc.) | ✅ |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (prod) | ✅ |
| `Content-Security-Policy` | Full CSP (see headers.ts) | ✅ |

### 5.2 Additional Security

| Check | Status |
|-------|--------|
| Rate limiting on auth endpoints | ✅ (in-memory Map) |
| Rate limiting on checkout endpoint | ✅ |
| Rate limiting on webhook endpoint | ✅ |
| CSRF protection | ✅ (double-submit cookie pattern) |
| Brute-force protection | ✅ (email-based) |
| Auth guards on admin routes | ✅ (`withAdminGuard()`) |
| Auth guards on account routes | ✅ (`requireAuth()`) |
| Input sanitization | ✅ (`errorSanitizer`) |
| Env validation | ⚠ Runtime check only |

---

## Phase 6: SEO

### 6.1 SEO Routes

| Route | Status | Notes |
|-------|--------|-------|
| `/robots.txt` | ✅ | Auto-generated, disallows `/api/`, `/admin/`, `/account/` |
| `/sitemap.xml` | ✅ | Auto-generated, includes all locales + product slugs |
| `<head>` metadata | ✅ | `generateMetadata` on all pages |
| `hreflang` tags | ✅ | `x-default`, `en-AU`, `ar-AE` |
| Canonical URLs | ✅ | Via `seoMetadata()` factory |
| JSON-LD schemas | ✅ | Organization, LocalBusiness, FAQ |
| OG tags | ✅ | Title, description, image |
| Twitter cards | ✅ | `summary_large_image` |

### 6.2 Finalize SEO

- [ ] Set `NEXT_PUBLIC_SITE_URL` to `https://www.ecomm-store.com`
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools

---

## Summary: Blocked Items

| Item | Blocker | Action Needed |
|------|---------|---------------|
| Stripe Checkout | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` are PLACEHOLDER | User provides live/test keys |
| OpenAI Live AI | `429 insufficient_quota` | User adds billing at OpenAI |
| Branded Email | Domain `ecomm-store.com` not verified in Resend | User adds DNS records |
| Vercel Deploy | Missing 16 env vars | User provides keys |
| Analytics | All 7 analytics IDs missing | User provides IDs |

---

## Quick Deploy Command Reference

```bash
# Generate CRON_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Verify prisma client (runs via postinstall)
npx prisma generate

# Local production build
npm run build

# Start production server (local test)
npm start
```
