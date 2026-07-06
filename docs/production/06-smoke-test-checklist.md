# Production Smoke Test Checklist

Run these checks after every deployment to verify the platform is functioning correctly.

## Pre-Test Setup
- [ ] Dev server running: `npm run dev`
- [ ] Or: Production URL loaded in browser
- [ ] Clear cookies/localStorage before starting (fresh session)

## Homepage
- [ ] `/` redirects to `en-ae/` (or loads default locale)
- [ ] Hero section renders with Sanity content
- [ ] Featured Collections section renders
- [ ] Benefits section renders
- [ ] Reviews section renders
- [ ] FAQ section renders with accordion working
- [ ] CTA section renders
- [ ] Footer renders with all columns

## Locale Switching
- [ ] `/en-au` — AU locale loads, prices in AUD
- [ ] `/ar-ae` — Arabic RTL layout works
- [ ] `/en-ae` — Default locale, prices in AED
- [ ] Locale switcher in header works

## Navigation
- [ ] Header renders with logo, nav links, cart badge
- [ ] Cart badge shows correct count (update on add/remove)
- [ ] Mobile menu opens/closes correctly
- [ ] Search bar (if implemented) works
- [ ] Navigation links point to correct locale-prefixed URLs

## Product Pages
- [ ] `/en-ae/products/[slug]` — Product page loads
- [ ] Product title, price, description render
- [ ] Product images display
- [ ] Reviews section loads Sanity reviews
- [ ] Related products section loads
- [ ] Product FAQ accordion works
- [ ] Schema.org JSON-LD present in page source
- [ ] Meta tags set correctly (title, description, OG)

## Cart
- [ ] "Add to Cart" button works
- [ ] Cart badge counter updates
- [ ] Cart drawer opens with correct items
- [ ] Quantity increase/decrease works
- [ ] Remove item from cart works
- [ ] Cart subtotal/total calculates correctly
- [ ] Cart persists after page refresh (localStorage)

## Checkout
- [ ] `/en-ae/checkout` — Checkout page loads
- [ ] Cart items displayed in order summary
- [ ] Email input field works
- [ ] Place order button works
- [ ] Stripe Checkout Session created (redirects to Stripe)
- [ ] With placeholder keys: direct order creation works (dev only)

## Authentication
- [ ] `/en-ae/login` — Login page loads
- [ ] Login form submits correctly
- [ ] `/en-ae/register` — Registration page loads
- [ ] Registration form submits correctly
- [ ] After login, redirect to account dashboard
- [ ] Logout works
- [ ] Forgot password flow works
- [ ] Brute force protection triggers after 5 failed attempts

## Account Area
- [ ] `/en-ae/account` — Dashboard loads after login
- [ ] Order history loads
- [ ] Order tracking page loads
- [ ] Address management works (add/edit/delete)
- [ ] Wishlist works (add/remove items)
- [ ] Reviews page shows user reviews
- [ ] Returns page loads
- [ ] Support tickets: create ticket works
- [ ] Support tickets: reply to ticket works
- [ ] Settings page loads

## Admin Dashboard
- [ ] `/en-ae/admin` — Admin panel loads (admin login required)
- [ ] Dashboard stats load (orders, revenue, etc.)
- [ ] Orders table loads with pagination
- [ ] Products page loads
- [ ] Suppliers page loads
- [ ] Inventory page loads
- [ ] Customers page loads
- [ ] Reviews page loads (moderation)
- [ ] Webhook logs page loads
- [ ] Analytics page loads
- [ ] Settings page loads
- [ ] Sanity Studio loads (if embedded)

## Order Flow (End-to-End)
- [ ] Add product to cart → Go to checkout
- [ ] Enter email → Place order
- [ ] Complete Stripe checkout (test card: `4242 4242 4242 4242`)
- [ ] Redirect back to order confirmation page
- [ ] Order confirmation shows order details
- [ ] Order appears in account → order history
- [ ] Admin sees new order in admin → orders
- [ ] Admin can update order status

## AI Assistant
- [ ] AI chat widget visible on product pages
- [ ] AI chat widget visible on homepage
- [ ] AI chat widget hidden on admin/auth/checkout pages
- [ ] Send a message → response received
- [ ] "Talk to support" triggers handoff flow
- [ ] Product suggestions render in widget
- [ ] Arabic input handled correctly

## Security
- [ ] HTTPS enforced (production)
- [ ] CSP headers present in response
- [ ] `/api/admin/*` returns 401 without auth
- [ ] `/api/account/*` returns 401 without auth
- [ ] CSRF token required for POST/PUT/DELETE requests
- [ ] Rate limiting: rapid requests blocked
- [ ] No sensitive data in client-side source

## SEO
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Homepage has hreflang tags (3 locales)
- [ ] Product pages have canonical URLs
- [ ] Product pages have OG tags
- [ ] Product pages have JSON-LD structured data
- [ ] Pages render with proper `<title>` tag

## Performance
- [ ] Homepage loads < 3s on first visit
- [ ] Subsequent page loads < 1s
- [ ] Lighthouse score > 80 (performance)
- [ ] Lighthouse score > 90 (SEO)
- [ ] Images lazy-loaded
- [ ] No layout shift on page load

## Supplier Sync
- [ ] `GET /api/sync/suppliers` returns status
- [ ] `POST /api/sync/suppliers?secret=CRON_SECRET` runs sync
- [ ] Sync logs recorded in database

## Email
- [ ] Order confirmation email sent on checkout
- [ ] Admin notification email sent on order
- [ ] Support ticket confirmation email sent
- [ ] Support ticket admin alert email sent
- [ ] Reply notification email sent

## Error Pages
- [ ] 404 page renders for unknown routes
- [ ] 500 error page renders gracefully
- [ ] Network error handled gracefully on client
