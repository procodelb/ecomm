# Environment Variables — Full Audit

## Legend
| Status | Meaning |
|--------|---------|
| ✅ Set | Configured with real value |
| ⚠️ Placeholder | Using test/dev value — needs real value before production |
| ❌ Missing | Not set — must be configured |

## Environment Variables

| Variable | Status | Current Value | Source | Vercel Secret Name |
|----------|--------|---------------|--------|-------------------|
| `DATABASE_URL` | ✅ Set | Supabase pooler connection string | Supabase Dashboard → Database | `database_url` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set | `https://pwgadikpldbsxsyijxav.supabase.co` | Supabase Dashboard → API | `next_public_supabase_url` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ Set | `sb_publishable_...` | Supabase Dashboard → API | `next_public_supabase_publishable_key` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set | Service role JWT | Supabase Dashboard → API | `supabase_service_role_key` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ Set | `wrl9moj5` | Sanity Dashboard | `next_public_sanity_project_id` |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ Set | `production` | Sanity Dashboard | `next_public_sanity_dataset` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | ✅ Set | `2024-01-01` | Hardcoded | `next_public_sanity_api_version` |
| `NEXT_PUBLIC_SANITY_STEGA` | ✅ Set | `false` | Hardcoded | (not needed in Vercel — default) |
| `SANITY_API_TOKEN` | ✅ Set | New write token | Sanity Dashboard → API → Tokens | `sanity_api_token` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ⚠️ Placeholder | `your_stripe_publishable_key` | Stripe Dashboard | `next_public_stripe_publishable_key` |
| `STRIPE_SECRET_KEY` | ⚠️ Placeholder | `your_stripe_secret_key` | Stripe Dashboard (secret) | `stripe_secret_key` |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ Placeholder | `your_stripe_webhook_secret` | Stripe Dashboard → Webhooks | `stripe_webhook_secret` |
| `RESEND_API_KEY` | ✅ Set | `re_gtWLBS7m_...` | Resend Dashboard | `resend_api_key` |
| `EMAIL_FROM` | ⚠️ Placeholder | `onboarding@resend.dev` | Change to `noreply@ecomm-store.com` after domain verification | `email_from` |
| `ADMIN_NOTIFICATION_EMAIL` | ⚠️ Placeholder | `admin@ecomm-store.com` | Set to your real email | `admin_notification_email` |
| `SUPPLIER_ORDERS_EMAIL` | ⚠️ Placeholder | `suppliers@ecomm-store.com` | Set to real supplier forwarding email | `supplier_orders_email` |
| `OPENAI_API_KEY` | ✅ Set | `sk-proj-...` | OpenAI Platform | `openai_api_key` |
| `AI_MODEL` | ✅ Set | `gpt-4o-mini` | Hardcoded | `ai_model` |
| `AI_ASSISTANT_ENABLED` | ✅ Set | `true` | Feature toggle | `ai_assistant_enabled` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ❌ Missing | — | Google Analytics Admin | `next_public_ga_measurement_id` |
| `GA_API_SECRET` | ❌ Missing | — | Google Analytics → Measurement Protocol | `ga_api_secret` |
| `NEXT_PUBLIC_META_PIXEL_ID` | ❌ Missing | — | Meta Ads Manager | `next_public_meta_pixel_id` |
| `META_CONVERSIONS_ACCESS_TOKEN` | ❌ Missing | — | Meta → Conversions API | `meta_conversions_access_token` |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | ❌ Missing | — | TikTok Ads Manager | `next_public_tiktok_pixel_id` |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | ❌ Missing | — | Microsoft Clarity | `next_public_clarity_project_id` |
| `NEXT_PUBLIC_HOTJAR_SITE_ID` | ❌ Missing | — | Hotjar | `next_public_hotjar_site_id` |
| `CRON_SECRET` | ❌ Missing | — | Generate with `openssl rand -hex 32` | `cron_secret` |
| `NEXT_PUBLIC_SITE_URL` | ❌ Missing | — | Your production URL | `next_public_site_url` |

## Summary
- **✅ Set**: 12 variables
- **⚠️ Placeholder**: 5 variables (need real values)
- **❌ Missing**: 8 variables (analytics + cron + site URL)

## Pre-Launch Action Items

### High Priority (Blocks Launch)
1. Get Stripe test keys from Stripe Dashboard
2. Set `NEXT_PUBLIC_SITE_URL` to production URL
3. Set `CRON_SECRET` (run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Medium Priority (Before Public Launch)
4. Set analytics vars (GA4 + Meta + TikTok + Clarity + Hotjar)
5. Verify `ecomm-store.com` domain in Resend
6. Set `EMAIL_FROM` to `noreply@ecomm-store.com`
7. Set `ADMIN_NOTIFICATION_EMAIL` to your actual email
8. Switch from test to live Stripe keys

### Low Priority (After Launch)
9. Set `SUPPLIER_ORDERS_EMAIL` when suppliers are configured
