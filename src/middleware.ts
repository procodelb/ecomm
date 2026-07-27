import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/lib/locale/routing";
import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/security/rate-limit";
import { csrfProtection, setCsrfCookie } from "@/lib/security/csrf";

const intlMiddleware = createMiddleware(routing);

async function checkAuth(request: NextRequest, pathname: string, loginUrl: URL) {
  const supabaseResponse = NextResponse.next({ request });
  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  return applySecurityHeaders(response);
}

function handleApiRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    const key = getRateLimitKey(request, "auth");
    const result = checkRateLimit(key, RATE_LIMITS.auth);
    if (!result.allowed) {
      const response = NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      );
      response.headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
      return response;
    }
  }

  if (pathname.startsWith("/api/checkout")) {
    const key = getRateLimitKey(request, "checkout");
    const result = checkRateLimit(key, RATE_LIMITS.checkout);
    if (!result.allowed) {
      const response = NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      );
      response.headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
      return response;
    }
  }

  if (pathname.startsWith("/api/webhooks")) {
    const key = getRateLimitKey(request, "webhook");
    const result = checkRateLimit(key, RATE_LIMITS.webhook);
    if (!result.allowed) {
      const response = NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      );
      response.headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
      return response;
    }
  }

  if (pathname === "/api/contact") {
    const key = getRateLimitKey(request, "contact");
    const result = checkRateLimit(key, { windowMs: 60 * 1000, maxRequests: 5 });
    if (!result.allowed) {
      const response = NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
      response.headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
      return response;
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const rateLimitResponse = handleApiRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const csrfExempt = pathname.startsWith("/api/webhooks/") || pathname === "/api/sync/suppliers";
    if (!csrfExempt) {
      const csrfResponse = csrfProtection(request);
      if (csrfResponse) return addSecurityHeaders(csrfResponse);
    }

    const response = NextResponse.next();
    const withCsrf = setCsrfCookie(response);
    return addSecurityHeaders(withCsrf);
  }

  if (pathname.match(/\/[^/]+\/account(\/|$)/) || pathname.startsWith("/account")) {
    const authResponse = await checkAuth(request, pathname, new URL("/login", request.url));
    const withCsrf = setCsrfCookie(authResponse);
    return addSecurityHeaders(withCsrf);
  }

  const response = await intlMiddleware(request);
  const sessionResponse = await updateSession(request);
  for (const cookie of sessionResponse.cookies.getAll()) {
    response.cookies.set(cookie.name, cookie.value, { path: cookie.path, httpOnly: cookie.httpOnly, secure: cookie.secure, sameSite: cookie.sameSite, domain: cookie.domain, expires: cookie.expires });
  }
  const withCsrf = setCsrfCookie(response);
  return addSecurityHeaders(withCsrf);
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|favicon.ico|sitemap.xml|robots.txt|images|fonts|admin).*)",
  ],
};
