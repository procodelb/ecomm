# Final Launch Checklist

## Phase 1: Pre-Launch 🎯

### Stripe Integration
- [ ] Create Stripe account (if not done)
- [ ] Get test API keys (`pk_test_...`, `sk_test_...`)
- [ ] Configure webhook endpoint for `checkout.session.completed` + `payment_intent.payment_failed`
- [ ] Test end-to-end checkout with `4242 4242 4242 4242`
- [ ] Verify order created in database after checkout
- [ ] Verify order confirmation email received
- [ ] Test BNPL options (AfterPay/Tabby) if enabled

### OpenAI
- [ ] Add payment method at https://platform.openai.com/settings/organization/billing
- [ ] Verify `429 insufficient_quota` error resolved
- [ ] Test AI Assistant with real responses
- [ ] Set usage alerts ($10, $50, $100 thresholds)

### Resend / Email
- [ ] Add `ecomm-store.com` domain in Resend
- [ ] Add DNS records (DKIM, verification, bounce)
- [ ] Verify domain in Resend
- [ ] Change `EMAIL_FROM` to `noreply@ecomm-store.com`
- [ ] Send test order confirmation email
- [ ] Send test support ticket email
- [ ] Verify emails not going to spam

### Vercel Deployment
- [ ] Push latest code to GitHub
- [ ] Import project in Vercel
- [ ] Configure all env vars in Vercel Dashboard (see `05-environment-audit.md`)
- [ ] Set up custom domain (`ecomm-store.com`)
- [ ] Configure SSL (auto-provisioned by Vercel)
- [ ] Deploy first build
- [ ] Run smoke tests (see `06-smoke-test-checklist.md`)
- [ ] Set `CRON_SECRET` in Vercel env vars
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production URL

## Phase 2: Configuration 🔧

### Analytics (Set up but can launch without)
- [ ] Create GA4 property → set `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] Create GA API secret → set `GA_API_SECRET`
- [ ] Create Meta Pixel → set `NEXT_PUBLIC_META_PIXEL_ID`
- [ ] Create Meta Conversions API token → set `META_CONVERSIONS_ACCESS_TOKEN`
- [ ] Create TikTok Pixel → set `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
- [ ] Create Microsoft Clarity project → set `NEXT_PUBLIC_CLARITY_PROJECT_ID`
- [ ] Create Hotjar site → set `NEXT_PUBLIC_HOTJAR_SITE_ID`

### Admin Configuration
- [ ] Create admin user in database (already seeded)
- [ ] Log in to admin dashboard
- [ ] Configure store settings (if admin settings page has configurable values)
- [ ] Review Sanity content — update homepage sections, products, FAQ

### Supplier Integration (for order fulfillment)
- [ ] Configure at least one supplier (see `07-supplier-configuration.md`)
- [ ] Set supplier API credentials in database
- [ ] Activate supplier in database
- [ ] Trigger manual sync → verify products imported
- [ ] Test order placement with supplier-stocked product

## Phase 3: Testing 🧪

### Automated
- [ ] Run `npm run build` — zero errors
- [ ] Run `npm run lint` — zero warnings
- [ ] Run TypeScript check — zero errors

### Manual Smoke Tests
- [ ] Full smoke test checklist (see `06-smoke-test-checklist.md`)
- [ ] Test all 3 locales: `en-ae`, `en-au`, `ar-ae`
- [ ] Test on mobile (responsive breakpoints)
- [ ] Test on tablet
- [ ] Test on desktop (1440px, 1920px)
- [ ] Test in Chrome, Firefox, Safari, Edge

### Performance
- [ ] Lighthouse score > 80 on mobile
- [ ] Lighthouse score > 90 on desktop
- [ ] Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Security
- [ ] SSL certificate valid
- [ ] CSP headers present
- [ ] No secrets in client-side bundle
- [ ] Admin routes protected
- [ ] CSRF protection working
- [ ] Rate limiting active

## Phase 4: Launch 🚀

### DNS
- [ ] Point `ecomm-store.com` to Vercel (CNAME/nameservers)
- [ ] Verify SSL certificate provisioned
- [ ] Test: `https://www.ecomm-store.com` loads

### Stripe Go Live
- [ ] Activate Stripe account
- [ ] Switch to live API keys (`sk_live_...`, `pk_live_...`)
- [ ] Update Stripe webhook endpoint URL to production
- [ ] Update webhook signing secret
- [ ] Test live checkout with real card (small amount, refund after)

### Final Checks
- [ ] Sitemap submitted to Google Search Console
- [ ] Robots.txt allows indexing
- [ ] Social media OG images set
- [ ] 404 page styled
- [ ] Favicon visible
- [ ] No placeholder text/emoji remaining
- [ ] Terms of Service page created
- [ ] Privacy Policy page created
- [ ] Contact page functional

### Launch Day
- [ ] Monitor Vercel logs for errors (first 24 hours)
- [ ] Monitor Stripe Dashboard for successful payments
- [ ] Check Resend Dashboard for email delivery
- [ ] Monitor Supabase for DB performance
- [ ] Check admin dashboard daily for new orders
- [ ] Test support ticket system end-to-end

### Post-Launch (First Week)
- [ ] Review analytics (GA4, Meta, etc.)
- [ ] Monitor AI Assistant usage/costs
- [ ] Check order fulfillment flow
- [ ] Review customer feedback/support tickets
- [ ] Fix any critical bugs
- [ ] Performance optimization based on real traffic

### Post-Launch (First Month)
- [ ] A/B test homepage sections
- [ ] Review conversion funnel (cart → checkout → purchase)
- [ ] Optimize product pages based on analytics
- [ ] Add more products to Sanity CMS
- [ ] Configure additional suppliers
- [ ] Enable cron sync
- [ ] Set up email marketing (optional)
- [ ] Set up retargeting pixels

## Rollback Plan
If critical issues arise after launch:
1. **DNS rollback**: Point domain to maintenance page or previous site
2. **Stripe rollback**: Revert to placeholder keys (test mode order creation)
3. **Code rollback**: Use Vercel Instant Rollback to previous deployment
4. **Database**: Supabase point-in-time recovery (if enabled)

## Emergency Contacts
| Service | Contact | Note |
|---------|---------|------|
| Vercel | https://vercel.com/support | 24/7 support available |
| Stripe | https://support.stripe.com | Email/callback |
| Supabase | https://supabase.com/support | Email |
| Resend | https://resend.com/support | Email |
| OpenAI | https://help.openai.com | Ticket-based |
