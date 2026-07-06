"use client";

import Script from "next/script";
import { analyticsConfig } from "@/lib/analytics/config";

export function GoogleAnalytics() {
  if (!analyticsConfig.ga4.enabled) return null;

  const id = analyticsConfig.ga4.measurementId;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', {
            page_path: window.location.pathname,
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}
