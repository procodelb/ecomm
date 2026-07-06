# Post-Deployment Test Checklist — ECOMM Store

> Run these tests **after** deployment to Vercel production.

---

## 1. Core Pages — Smoke Test

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 1.1 | Visit `https://www.ecomm-store.com` | Homepage loads, hero section visible, GSAP animation plays | ☐ |
| 1.2 | Scroll homepage | Sections animate in, parallax effects work | ☐ |
| 1.3 | Click "Explore Collection" | Navigates to `/products` | ☐ |
| 1.4 | Visit `/products` | Products grid loads (or empty state if no DB) | ☐ |
| 1.5 | Click a product card | Navigates to `/products/[slug]` | ☐ |
| 1.6 | Product detail page | Gallery, info, tabs, FAQ, reviews all render | ☐ |
| 1.7 | Visit `/checkout` | Checkout form renders with progress steps | ☐ |
| 1.8 | Visit `/en-AU` | Homepage loads in Australian locale | ☐ |
| 1.9 | Visit `/ar-AE` | Homepage loads in Arabic locale | ☐ |
| 1.10 | Visit `/robots.txt` | Returns valid robots.txt | ☐ |
| 1.11 | Visit `/sitemap.xml` | Returns valid XML sitemap | ☐ |

## 2. Auth Flow

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 2.1 | Visit `/login` | Login form renders with Mail/Lock icons | ☐ |
| 2.2 | Visit `/register` | Register form renders with UserPlus icon | ☐ |
| 2.3 | Visit `/forgot-password` | Card pattern matches login/register | ☐ |
| 2.4 | Submit register form | POST to `/api/auth/register`, redirects or shows error | ☐ |
| 2.5 | Submit login form | POST to `/api/auth/login`, tracks event, redirects | ☐ |
| 2.6 | Visit `/reset-password?token=xxx` | Card pattern renders with Lock icon | ☐ |
| 2.7 | Visit `/auth-error?error=session_expired` | Card pattern renders with ShieldAlert icon | ☐ |
| 2.8 | Visit `/email-confirmation?token=xxx` | Card pattern renders with spinner/success/error | ☐ |

## 3. Navigation & Layout

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 3.1 | Header: scroll down | Header hides (if scrolled past 200px) | ☐ |
| 3.2 | Header: scroll up | Header reappears | ☐ |
| 3.3 | Header: locale switcher | Switches locale, page reloads in selected locale | ☐ |
| 3.4 | Header: cart icon | Opens cart drawer | ☐ |
| 3.5 | Mobile: toggle menu | Navigation overlay slides in | ☐ |
| 3.6 | Footer: all links | Navigate to correct pages | ☐ |
| 3.7 | Footer: social icons | Hover shows primary color glow | ☐ |

## 4. Cart & Checkout

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 4.1 | Add item to cart | Cart badge updates, drawer shows item | ☐ |
| 4.2 | Update quantity in cart | Total updates correctly | ☐ |
| 4.3 | Remove item from cart | Item removed, empty state renders | ☐ |
| 4.4 | Free shipping progress bar | Updates as items are added | ☐ |
| 4.5 | Visit `/checkout` with cart items | Order summary shows items, totals correct | ☐ |
| 4.6 | Submit checkout form | **Test mode**: creates order in DB directly. **Stripe**: redirects to Stripe Checkout | ☐ |
| 4.7 | BNPL buttons render | Tabby/Tamara (UAE) or AfterPay (AU) show | ☐ |
| 4.8 | Trust badges render | SSL Encrypted, PCI Compliant, 30-Day Returns | ☐ |

## 5. Account Area

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 5.1 | Visit `/account` (not logged in) | Redirects to `/login?redirect=/account` | ☐ |
| 5.2 | Visit `/account` (logged in) | Dashboard shows stat cards (Orders, Reviews, Wishlist, Support) | ☐ |
| 5.3 | Stat cards have Lucide icons | ShoppingBag, Star, Heart, MessageSquare icons visible | ☐ |
| 5.4 | Sidebar navigation | All 9 nav items render with correct Lucide icons | ☐ |
| 5.5 | Visit `/account/orders` | Order history renders with StatusBadge components | ☐ |
| 5.6 | Visit `/account/addresses` | Address management form renders | ☐ |
| 5.7 | Visit `/account/settings` | Profile form renders with label styling consistent with auth | ☐ |
| 5.8 | Mobile: sidebar | Hamburger menu toggles sidebar | ☐ |

## 6. Admin Area

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 6.1 | Visit `/admin` (not logged in) | Redirects to login | ☐ |
| 6.2 | Visit `/admin` (logged in as admin) | Dashboard renders with Lucide icon sidebar | ☐ |
| 6.3 | Admin sidebar | All 11 nav items render with correct Lucide icons | ☐ |
| 6.4 | Visit `/admin/products` | Products table renders with StatusBadge, CsvExport, Pagination | ☐ |
| 6.5 | Visit `/admin/orders` | Orders table renders with status badges | ☐ |
| 6.6 | Visit `/admin/customers` | Customers table renders | ☐ |
| 6.7 | Mobile: admin sidebar | Hamburger menu toggles sidebar | ☐ |

## 7. Design Token Consistency Audit

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 7.1 | Page background | `#0A0A0A` (`bg-dark`) everywhere | ☐ |
| 7.2 | Card backgrounds | `#0C0C0C` (`bg-card`) on all cards | ☐ |
| 7.3 | Borders | `rgba(255,255,255,0.04)` (`border-border`) everywhere | ☐ |
| 7.4 | Primary color | `#00D4FF` (`text-primary` / `bg-primary`) on all CTAs | ☐ |
| 7.5 | Buttons | `rounded-xl` (except `size="sm"` which is `rounded-lg`) | ☐ |
| 7.6 | All inputs | `rounded-xl` with hover/focus border transitions | ☐ |
| 7.7 | Spinners | `border-primary border-t-transparent` | ☐ |
| 7.8 | Status badges (success) | `bg-success/10 text-success` | ☐ |
| 7.9 | Status badges (destructive) | `bg-destructive/10 text-destructive` | ☐ |
| 7.10 | Status badges (warning) | `bg-warning/10 text-warning` | ☐ |
| 7.11 | No hardcoded hex colors remain | Spot-check 5 random components | ☐ |

## 8. Responsive Breakpoints

| # | Test Width | Expected Result | Pass |
|---|-----------|-----------------|------|
| 8.1 | 375px (Mobile) | No horizontal scroll, cards stack, header adaptive | ☐ |
| 8.2 | 768px (Tablet) | 2-column grids, sidebar hidden behind hamburger | ☐ |
| 8.3 | 1024px (Desktop) | 3-column grids, sidebar visible | ☐ |
| 8.4 | 1440px (Wide) | Content capped at container-luxury max-width | ☐ |

## 9. SEO Verification

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 9.1 | `<title>` on homepage | "ECOMM — Luxury Water Toys" | ☐ |
| 9.2 | `<meta name="description">` | Present on all pages | ☐ |
| 9.3 | `<link rel="canonical">` | Points to correct URL | ☐ |
| 9.4 | `hreflang` tags | `x-default`, `en-AU`, `ar-AE` present | ☐ |
| 9.5 | OG tags | `og:title`, `og:description`, `og:image` present | ☐ |
| 9.6 | Twitter tags | `twitter:card`, `twitter:title` present | ☐ |
| 9.7 | JSON-LD | Organization + LocalBusiness schema injected | ☐ |
| 9.8 | `/sitemap.xml` | Contains homepage, static pages, product URLs | ☐ |
| 9.9 | `/robots.txt` | Disallows `/api/`, `/admin/`, `/account/` | ☐ |

## 10. Security Verification (Browser)

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 10.1 | Network response headers | View in DevTools: HSTS, CSP, X-Frame-Options, etc. | ☐ |
| 10.2 | HTTPS enforced | Redirects HTTP→HTTPS | ☐ |
| 10.3 | CSP violations | No CSP errors in console | ☐ |

## 11. API Health Check

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 11.1 | `GET /api/health` | Returns `{ status: "ok" }` | ☐ |
| 11.2 | `POST /api/auth/login` with bad creds | Returns 401 with error message | ☐ |
| 11.3 | `POST /api/checkout` with empty cart | Returns error | ☐ |

## 12. AI Assistant

| # | Test | Expected Result | Pass |
|---|------|-----------------|------|
| 12.1 | Click AI chat widget | Chat window opens | ☐ |
| 12.2 | Send "hello" | **Live**: AI responds. **Fallback**: "Sorry, I'm currently unavailable." | ☐ |
| 12.3 | Send "talk to a human" | Handoff suggested response | ☐ |
| 12.4 | Arabic locale | Responses in Arabic | ☐ |

## 13. Performance (Quick)

| # | Metric | Expected | Actual |
|---|--------|----------|--------|
| 13.1 | Lighthouse Performance | ≥80 | ___ |
| 13.2 | Lighthouse Accessibility | ≥90 | ___ |
| 13.3 | Lighthouse Best Practices | ≥90 | ___ |
| 13.4 | Lighthouse SEO | ≥95 | ___ |
| 13.5 | First Contentful Paint | <2s | ___ |
| 13.6 | Largest Contentful Paint | <3s | ___ |

---

## Test Summary

| Section | Total Tests | Passed | Failed |
|---------|------------|--------|--------|
| Core Pages | 11 | ☐ | ☐ |
| Auth Flow | 8 | ☐ | ☐ |
| Navigation | 7 | ☐ | ☐ |
| Cart & Checkout | 8 | ☐ | ☐ |
| Account Area | 8 | ☐ | ☐ |
| Admin Area | 7 | ☐ | ☐ |
| Design Tokens | 11 | ☐ | ☐ |
| Responsive | 4 | ☐ | ☐ |
| SEO | 9 | ☐ | ☐ |
| Security | 3 | ☐ | ☐ |
| API | 3 | ☐ | ☐ |
| AI Assistant | 4 | ☐ | ☐ |
| Performance | 6 | ☐ | ☐ |
| **Total** | **89** | **☐** | **☐** |
