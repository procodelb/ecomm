# Security Checklist

## Implemented Protections

### 1. OWASP Top 10 Coverage
| OWASP Category | Protection | Status |
|---|---|---|
| A01: Broken Access Control | RBAC enforcement on all admin API routes | ✅ |
| A02: Cryptographic Failures | Secure cookie config (httpOnly, secure, sameSite) | ✅ |
| A03: Injection | Prisma parameterized queries (safe by design) | ✅ |
| A04: Insecure Design | CSRF double-submit cookie pattern (state-changing mutations) | ✅ |
| A05: Security Misconfiguration | CSP + security headers via middleware | ✅ |
| A06: Vulnerable Components | Dependencies managed via package.json | ⚠️ (manual audit needed) |
| A07: Auth Failures | Brute-force lockout (5 attempts / 15min window, 30min lockout) | ✅ |
| A08: Data Integrity Failures | Stripe webhook signature verification (production keys) | ✅ |
| A09: Logging Failures | Admin audit log table | ✅ |
| A10: SSRF | External URLs whitelisted in CSP | ⚠️ (manual review needed) |

### 2. RBAC — Role-Based Access Control
- **Location**: `src/lib/security/rbac.ts`
- **Roles**: `super_admin`, `admin`, `manager`, `support`, `analyst`
- **Permissions**: 25 granular permissions covering products, orders, customers, suppliers, reviews, inventory, analytics, settings, webhooks, admins, sync, audit
- **Enforcement**: `withAdminGuard()` wrapper applied to all 16 admin API routes, requiring specific permission per endpoint
- **Database**: `AdminUser` model has `role` enum + `permissions` JSON field for override
- **Middleware**: Admin pages are auth-gated in `middleware.ts`

### 3. Zod Validation
- **Location**: `src/lib/security/validation.ts`
- **Schemas**: `paginationSchema`, `emailSchema`, `uuidSchema` — composable for route handlers
- **Helpers**: `validateBody<T>()` returns typed data or 400 error response
- **Usage**: Available for any API route to validate request body/query

### 4. Rate Limiting
- **Location**: `src/lib/security/rate-limit.ts`
- **Limits**:
  | Route Group | Window | Max Requests |
  |---|---|---|
  | `/api/auth/*` | 15 min | 10 |
  | `/api/checkout` | 1 min | 30 |
  | `/api/admin/*` | 1 min | 100 |
  | `/api/webhooks/*` | 1 min | 60 |
  | `/api/sync/*` | 5 min | 10 |
  | `/api/account/*` | 1 min | 60 |
- **Storage**: In-memory Map (non-persistent, resets on server restart)
- **Production Recommendation**: Replace with Redis (Upstash or Vercel KV)

### 5. CSRF Protection
- **Location**: `src/lib/security/csrf.ts`
- **Pattern**: Double-submit cookie — random token set as non-httpOnly cookie, must match `x-csrf-token` header on unsafe methods (POST/PUT/PATCH/DELETE)
- **Middleware**: Enforced for all `/api/*` routes
- **Cookie config**: `httpOnly: false` (read by JS), `sameSite: strict`, `secure` in production

### 6. Security Headers
- **Location**: `src/lib/security/headers.ts`
- **Headers set on every response via middleware**:
  - `Content-Security-Policy` — restrictive: no `frame-ancestors`, `upgrade-insecure-requests`, whitelisted CDNs
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — disabled camera, mic, geolocation, FLoC; payment allowed
  - `Strict-Transport-Security` — 2 years (`preload` in production)

### 7. Brute-Force Protection
- **Location**: `src/lib/security/brute-force.ts`
- **Triggers**: Login, registration, password reset endpoints
- **Threshold**: 5 failed attempts per email in 15-minute sliding window → 30-minute lockout
- **Enforcement**: Login + register + forgot-password routes check `checkBruteForce()` before processing
- **Storage**: In-memory Map

### 8. Audit Logging
- **Location**: `src/lib/security/audit.ts`
- **Database**: New `AuditLog` model in Prisma schema (table: `audit_logs`)
- **Fields**: action, entity, entityId, adminId, adminEmail, ipAddress, userAgent, changes (JSON), metadata (JSON), createdAt
- **Helper**: `logAuditAction()` — fire-and-forget (non-blocking)
- **Admin Route Enforcement**: `withAdminAudit()` wrapper available for audit-worthy mutations

### 9. Admin MFA-Ready Structure
- **Location**: `src/lib/security/mfa.ts`
- **Database**: `AdminUser.mfaEnabled` boolean field already exists
- **Functions**: `generateMfaSecret()`, `verifyMfaToken()`, `getMfaStatus()`
- **Status**: Stub implementation — ready for TOTP integration when UI is built

### 10. Error Sanitization
- **Location**: `src/lib/security/sanitize.ts`
- **Public errors**: Generic messages in production (no stack traces, no internal details)
- **Sensitive data**: `sanitizeResponseBody()` redacts password, token, secret, apiKey, creditCard fields
- **Error classification**: Detects not-found (404), duplicate (409), foreign-key (400), timeout (504), auth (401), forbidden (403), rate-limit (429)

### 11. Production Env Validation
- **Location**: `src/lib/security/env.ts`
- **Check**: `validateProductionEnv()` — verifies all required vars exist, detects placeholder values
- **Secrets scanner**: `checkForSecretsInCode()` — regex patterns for live Stripe keys, GitHub tokens, Slack tokens, private keys

### 12. Webhook Security
- **Stripe**: Signature verification via `stripe.webhooks.constructEvent()` when `STRIPE_SECRET_KEY` is not `PLACEHOLDER`
- **Idempotency**: Duplicate event detection via `WebhookLog` table (provider + eventId unique check)
- **Rate limiting**: 60 requests/min via middleware

---

## What Needs Production Configuration

### Immediately Required
| Item | Action | Priority |
|---|---|---|
| Real Stripe keys | Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 🔴 High |
| Real Resend key | Set `RESEND_API_KEY` for email delivery | 🔴 High |
| `SUPABASE_SERVICE_ROLE_KEY` | Needed for admin operations, cron auth | 🔴 High |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Content fetching | 🔴 High |
| `CRON_SECRET` | Set in Vercel Dashboard for cron jobs | 🔴 High |
| `NEXT_PUBLIC_SITE_URL` | Must be `https://yourdomain.com` | 🔴 High |

### Strongly Recommended
| Item | Action | Priority |
|---|---|---|
| Rate limiting storage | Migrate from in-memory Map to Redis (Upstash / Vercel KV) | 🟡 Medium |
| MFA UI | Build TOTP setup/verification UI for admin users | 🟡 Medium |
| Session management | Configure Supabase session timeouts and refresh policies | 🟡 Medium |
| Admin 2FA | Enforce MFA for all admin accounts in production | 🟡 Medium |
| CSP report-uri | Add `report-uri` or `report-to` directive to monitor violations | 🟡 Medium |
| Vulnerability scanning | Run `npm audit` and fix any critical/high issues before deploying | 🟡 Medium |
| Dependency updates | Review outdated packages, especially Next.js and Prisma | 🟡 Medium |

### Future Considerations
| Item | Action | Priority |
|---|---|---|
| WAF | Consider Cloudflare or AWS WAF for DDoS protection | 🟢 Low |
| IP allowlisting | Restrict admin pages to office/VPN IP ranges | 🟢 Low |
| Audit log retention | Add TTL/index on `createdAt` for automatic log cleanup | 🟢 Low |
| Database encryption | Enable Supabase Postgres encryption at rest (if not default) | 🟢 Low |
| Penetration testing | Third-party security audit before major launch | 🟢 Low |
| Security.txt | Create `/.well-known/security.txt` for vulnerability disclosure | 🟢 Low |

---

## Key Architecture Decisions

- **Rate limiting**: In-memory is sufficient for initial deployment on a single Vercel instance. Migrate to Redis before scaling to multiple instances.
- **CSRF**: Double-submit cookie pattern chosen over SameSite-only because API routes serve both browser and non-browser clients.
- **CSP**: `'unsafe-inline'` and `'unsafe-eval'` required for Next.js hydration, Sanity preview, and analytics scripts. Review if `strict-dynamic` or nonce-based CSP is feasible after deployment.
- **Audit logs**: Fire-and-forget pattern — audit failures never block the primary operation.
- **Brute force**: Email-based (not IP-based) to avoid blocking shared IPs (office, ISP NAT). IP is tracked as secondary identifier.
- **MFA**: TOTP-ready infrastructure (RFC 6238). SMS/email MFA requires integration with Twilio/Resend.

---

## File Reference

| File | Purpose |
|---|---|
| `src/lib/security/rbac.ts` | Role definitions, permission checks, `requireAdmin()` |
| `src/lib/security/rate-limit.ts` | Sliding window rate limiter |
| `src/lib/security/csrf.ts` | CSRF token generation and validation |
| `src/lib/security/headers.ts` | CSP + security headers |
| `src/lib/security/audit.ts` | Admin audit log helpers |
| `src/lib/security/sanitize.ts` | Error sanitization + sensitive data redaction |
| `src/lib/security/brute-force.ts` | Brute force lockout |
| `src/lib/security/mfa.ts` | MFA setup and verification stubs |
| `src/lib/security/env.ts` | Production env validation + secrets scanner |
| `src/lib/security/validation.ts` | Zod schema helpers |
| `src/lib/security/admin-guard.ts` | `withAdminGuard()` wrapper for admin routes |
| `src/middleware.ts` | Security headers, rate limiting, CSRF, auth guards |
| `prisma/schema.prisma` | `AuditLog` model |
