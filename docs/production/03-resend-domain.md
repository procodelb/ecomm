# Resend Domain Verification — Setup Guide

## Current Status
- **Resend API key**: Working ✅ (4 test emails delivered successfully)
- **Sender**: `onboarding@resend.dev` (Resend default — limited to 100 emails/day, no custom domain)
- **Goal**: Switch to `noreply@ecomm-store.com` (branded, unlimited, higher delivery rate)

## Steps

### 1. Log In to Resend
- Go to https://resend.com
- Use the account associated with API key `re_gtWLBS7m_2JsDcckda4VJytRxmcQMPE8d`

### 2. Add Domain
- Dashboard → **Domains** → **Add Domain**
- Enter: `ecomm-store.com`
- Select region: **US East** (closest to Vercel deployment)

### 3. Add DNS Records
Resend will provide 3 DNS records to add to your domain provider (e.g., Cloudflare, Namecheap, GoDaddy):

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | `resend._domainkey.ecomm-store.com` | `p=MIGfMA0GCSqGSIb3...` | DKIM — signs emails |
| TXT | `ecomm-store.com` | `resend-verification-code=...` | Domain ownership |
| CNAME | `bounce.ecomm-store.com` | `bounce.resend.com` | Bounce handling |

### 4. Verify DNS Propagation
```powershell
# Check DKIM
Resolve-DnsName -Name "resend._domainkey.ecomm-store.com" -Type TXT

# Check verification
Resolve-DnsName -Name "ecomm-store.com" -Type TXT | Where-Object {$_ -like "*resend*"}
```

### 5. Confirm in Resend
- After DNS records propagate (5 min–48 hours), click **Verify** in Resend Dashboard
- Status changes to **Verified**

### 6. Update Environment Variables
```bash
# Change EMAIL_FROM from onboarding@resend.dev to:
EMAIL_FROM=noreply@ecomm-store.com
```

### 7. Verify Email Delivery
```bash
# Use the test endpoint or trigger a test email:
curl -X POST https://[your-domain.com]/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# Or trigger an order confirmation via checkout
```

## Why This Matters
| Aspect | `onboarding@resend.dev` | `noreply@ecomm-store.com` |
|--------|------------------------|--------------------------|
| Daily limit | 100 emails | Unlimited |
| Sender name | Resend default | Your brand |
| Deliverability | Lower (shared domain) | Higher (own domain) |
| SPF/DKIM | Not configurable | Full control |
| Professionalism | ❌ | ✅ |

## Relevant Files
- `src/lib/email/send.ts` — Email sending function
- `src/lib/email/templates/order-confirmation.ts` — Order receipt template
- `src/lib/email/templates/admin-notification.ts` — Admin alert template
- `src/lib/email/templates/support.ts` — Support ticket templates
- `.env` — `EMAIL_FROM` variable

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Emails not sending | API key invalid or domain unverified | Check Resend Dashboard → API Keys |
| Emails going to spam | No DKIM/DMARC | Verify DNS records are correct |
| "Sender not allowed" | EMAIL_FROM domain not verified | Use `onboarding@resend.dev` temporarily |
| Rate limited | >100 emails/day on dev sender | Switch to verified domain |
