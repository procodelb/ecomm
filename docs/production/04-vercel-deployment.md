# Vercel Deployment — Preparation Guide

## Prerequisites
- [ ] Vercel account connected to GitHub
- [ ] GitHub repo pushed with latest code
- [ ] All `.env` variables documented (see `05-environment-audit.md`)
- [ ] Stripe test keys configured (see `01-stripe-integration.md`)
- [ ] Domain: `ecomm-store.com` (or your custom domain)

## Deployment Steps

### 1. Import Project in Vercel
- Go to https://vercel.com/new
- Import your GitHub repository
- Framework preset: **Next.js** (auto-detected from `vercel.json`)

### 2. Configure Environment Variables
In Vercel Dashboard → Project → Settings → Environment Variables:

**Add each variable as a Secret** (the `@variable_name` syntax in `vercel.json`)

For each `@variable_name`, create a secret:
1. Go to Project Settings → Environment Variables
2. For each `@xxx` in `vercel.json`, create a variable named `xxx`
3. Mark sensitive vars as **Secret** (encrypted)

**Required Secrets:**

| Secret Name | Value Source | Example |
|-------------|-------------|--------|
| `database_url` | Supabase → Project Settings → Database → Connection string | `postgresql://...` |
| `next_public_supabase_url` | Supabase → Project Settings → API → Project URL | `https://xxx.supabase.co` |
| `next_public_supabase_publishable_key` | Supabase → Project Settings → API → anon public | `sb_publishable_...` |
| `supabase_service_role_key` | Supabase → Project Settings → API → service_role | `eyJhbGci...` |
| `next_public_sanity_project_id` | Sanity Dashboard → Settings | `wrl9moj5` |
| `next_public_sanity_dataset` | Sanity Dashboard → Settings | `production` |
| `next_public_sanity_api_version` | Hardcoded | `2024-01-01` |
| `sanity_api_token` | Sanity Dashboard → API → Tokens | `sk...` |
| `next_public_stripe_publishable_key` | Stripe Dashboard → API Keys | `pk_test_...` |
| `stripe_secret_key` | Stripe Dashboard → API Keys (secret) | `sk_test_...` |
| `stripe_webhook_secret` | Stripe Dashboard → Webhooks → signing secret | `whsec_...` |
| `resend_api_key` | Resend Dashboard → API Keys | `re_...` |
| `email_from` | Your verified domain | `noreply@ecomm-store.com` |
| `admin_notification_email` | Your admin email | `admin@ecomm-store.com` |
| `supplier_orders_email` | Supplier forwarding email | `suppliers@ecomm-store.com` |
| `openai_api_key` | OpenAI Platform → API Keys | `sk-proj-...` |
| `ai_model` | Hardcoded | `gpt-4o-mini` |
| `ai_assistant_enabled` | Feature toggle | `true` |
| `next_public_ga_measurement_id` | Google Analytics → Admin | `G-XXXXXXXXXX` |
| `ga_api_secret` | Google Analytics → Measurement Protocol API secret | `...` |
| `next_public_meta_pixel_id` | Meta Ads Manager → Pixels | `...` |
| `meta_conversions_access_token` | Meta → Conversions API → Access Token | `...` |
| `next_public_tiktok_pixel_id` | TikTok Ads Manager → Pixel | `...` |
| `next_public_clarity_project_id` | Microsoft Clarity → Project Settings | `...` |
| `next_public_hotjar_site_id` | Hotjar → Sites → Site ID | `...` |
| `cron_secret` | Generate random string | `openssl rand -hex 32` |
| `next_public_site_url` | Your production URL | `https://www.ecomm-store.com` |

### 3. Configure Custom Domain
- Project Settings → Domains
- Add: `ecomm-store.com`
- Add Vercel DNS records on your domain provider:
  - CNAME `www` → `cname.vercel-dns.com`
  - A record `@` → `76.76.21.21` (or use Vercel nameservers)
- Wait for SSL certificate provisioning (~5 min)
- Set **Redirect `ecomm-store.com` → `www.ecomm-store.com`** (recommended)

### 4. Configure Region
`vercel.json` specifies 3 regions:
- `iad1` (US East) — primary
- `sin1` (Singapore) — APAC
- `syd1` (Sydney) — Australia

For a UAE/AU focused store, consider:
- `cdg1` (Paris) — closest to UAE
- `syd1` (Sydney) — closest to Australia

### 5. Set Up Cron Jobs
The `/api/sync/suppliers` cron is configured in `vercel.json` to run every 30 minutes.
No additional setup needed — Vercel automatically runs crons from the configuration.

### 6. Deploy
```bash
# Push to main branch (auto-deploys if Vercel is connected)
git push origin main

# Or deploy manually via Vercel CLI
npx vercel --prod
```

### 7. Post-Deployment Verification
- [ ] Visit `https://www.ecomm-store.com` — loads homepage
- [ ] Visit `/en-au` — switches to AU locale
- [ ] Visit `/ar-ae` — Arabic RTL layout works
- [ ] Visit `/products/[slug]` — product page loads
- [ ] Visit `/checkout` — checkout page loads
- [ ] Complete a test checkout with Stripe test card
- [ ] Verify webhook creates order in DB
- [ ] Check admin panel at `/en-ae/admin`
- [ ] Test AI chat widget on product page
- [ ] Run Vercel cron manually: `POST /api/sync/suppliers?secret=CRON_SECRET`
- [ ] Check Vercel Logs for errors

### 8. Configure Error Monitoring
- Vercel Analytics → Enable (free tier available)
- Consider: Sentry, Datadog, or LogRocket for error tracking

### 9. Configure Preview Deployments
- Vercel auto-creates preview deployments for PR branches
- Disable if not needed: Settings → Git → Automatic Preview Deployments

## Files
- `vercel.json` — Vercel configuration
- `docs/production/05-environment-audit.md` — Full env var reference
- `docs/production/06-smoke-test-checklist.md` — Post-deployment verification
- `docs/production/08-launch-checklist.md` — Final launch checklist
