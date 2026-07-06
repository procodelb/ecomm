import type { NextResponse } from "next/server";

type SecurityHeaders = Record<string, string>;

const SELF = "'self'";
const NONE = "'none'";

export function getSecurityHeaders(): SecurityHeaders {
  const isProd = process.env.NODE_ENV === "production";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const domain = new URL(siteUrl).hostname;

  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
      "payment=(self)",
    ].join(", "),
    "Strict-Transport-Security": isProd ? "max-age=63072000; includeSubDomains; preload" : "max-age=31536000; includeSubDomains",
    ...getCspHeaders(domain, isProd),
  };
}

function getCspHeaders(domain: string, isProd: boolean): SecurityHeaders {
  const cspDirectives = [
    `default-src ${SELF}`,
    `base-uri ${SELF}`,
    `connect-src ${SELF} https://*.supabase.co https://*.stripe.com https://*.sanity.io https://*.google-analytics.com https://analytics.google.com https://*.googletagmanager.com https://*.facebook.com https://*.tiktok.com https://*.clarity.ms https://*.hotjar.com https://*.hotjar.io https://api.emailjs.com https://fonts.googleapis.com https://fonts.gstatic.com`,
    `font-src ${SELF} https://fonts.gstatic.com data:`,
    `form-action ${SELF} https://*.stripe.com`,
    `frame-ancestors ${NONE}`,
    `frame-src ${SELF} https://*.stripe.com https://*.sanity.io https://*.hotjar.com`,
    `img-src ${SELF} data: blob: https:`,
    `manifest-src ${SELF}`,
    `media-src ${SELF} https:`,
    `script-src ${SELF} 'unsafe-inline' 'unsafe-eval' https://*.stripe.com https://*.googletagmanager.com https://*.google-analytics.com https://*.facebook.net https://*.tiktok.com https://*.clarity.ms https://*.hotjar.com https://cdn.sanity.io`,
    `style-src ${SELF} 'unsafe-inline' https://fonts.googleapis.com`,
    `worker-src ${SELF} blob:`,
    `upgrade-insecure-requests`,
  ];

  const csp = cspDirectives.join("; ");

  return {
    "Content-Security-Policy": csp,
  };
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
