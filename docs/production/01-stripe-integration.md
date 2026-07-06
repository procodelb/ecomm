# Stripe Integration — Production Setup Guide

## Overview
The platform uses Stripe Checkout Sessions (redirect flow) with dual-mode support:
- **Test Mode** (`STRIPE_SECRET_KEY` starts with `sk_test_`): Full Stripe Checkout with test card `4242 4242 4242 4242`
- **Placeholder Mode** (keys are `your_stripe_secret_key`/`PLACEHOLDER`): Creates orders directly in DB, bypassing Stripe entirely

## Setup Steps

### 1. Create Stripe Account
- Go to https://dashboard.stripe.com/register
- Complete onboarding (business details, banking)

### 2. Get API Keys
- Dashboard → Developers → API Keys
- Copy **Publishable key** (`pk_test_...`) → `.env` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Copy **Secret key** (`sk_test_...`) → `.env` as `STRIPE_SECRET_KEY`

### 3. Configure Webhook
- Dashboard → Developers → Webhooks → Add endpoint
- **Endpoint URL**: `https://[your-domain.com]/api/webhooks/stripe`
- **Events to listen for**:
  - `checkout.session.completed`
  - `payment_intent.payment_failed`
- After creation, copy the **Signing secret** (`whsec_...`) → `.env` as `STRIPE_WEBHOOK_SECRET`

### Local Webhook Testing (Optional)
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4. Configure Checkout Settings
- Dashboard → Settings → Checkout and payment methods
- Enable: Cards (Visa, Mastercard, Amex)
- Enable: AfterPay/Clearpay (AU), Tabby/Tamara (UAE) if desired as BNPL options
- Set statement descriptor to `ECOMM-STOR*`

### 5. Customize Checkout Appearance
- Dashboard → Settings → Branding
- Upload logo (800x800px max, square preferred)
- Set brand color: `#00D4FF`
- Set brand icon style: `rounded`

### 6. Verify End-to-End Flow
```bash
# 1. Start dev server
npm run dev

# 2. Add a product to cart
# 3. Go to /checkout
# 4. Complete Stripe Checkout with test card: 4242 4242 4242 4242
#    Any future date, any CVC

# 5. After redirect, verify in Supabase:
#    - orders table: new order with status = 'confirmed'
#    - stripe_payments table: payment record with status = 'completed'
```

### 7. Go Live
- Dashboard → Settings → Public account details → Activate account
- Stripe reviews and approves (typically 24-48 hours)
- After approval, switch to live keys (start with `sk_live_` / `pk_live_`)

## Webhook Architecture
- **Route**: `src/app/api/webhooks/stripe/route.ts`
- **Runtime**: `nodejs` (requires Stripe SDK synchronous verification)
- **Idempotency**: Uses `WebhookLog` table to deduplicate by Stripe event ID
- **Flow**: Signature verification → idempotency check → customer upsert → order creation → fire-and-forget side effects (email, analytics)
- **Test mode**: Skips signature verification; creates order directly from checkout session data

## Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Checkout returns 400 | `STRIPE_SECRET_KEY` is placeholder | Set real test key |
| Webhook returns 400 | Invalid signing secret | Re-copy `whsec_...` from Stripe Dashboard |
| Order not created after checkout | Webhook not reaching your server | Check Stripe Dashboard → Webhooks → Recent deliveries |
| `payment_intent.payment_failed` triggered | Card declined | Use `4242 4242 4242 4242` for testing |

## Relevant Files
- `src/app/api/checkout/route.ts` — Creates Stripe Checkout Session
- `src/app/api/webhooks/stripe/route.ts` — Processes Stripe webhooks
- `src/app/[locale]/checkout/page.tsx` — Checkout page UI
- `src/app/[locale]/order/confirmation/page.tsx` — Order confirmation page
- `src/app/[locale]/order/confirmation/[id]/page.tsx` — Direct order confirmation
