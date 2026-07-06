"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { GoogleAnalytics } from "./ga4";
import { MetaPixel } from "./meta-pixel";
import { TikTokPixel } from "./tiktok-pixel";
import { MicrosoftClarity } from "./clarity";
import { Hotjar } from "./hotjar";
import { trackPageView } from "@/lib/analytics/client";
import { getConsent } from "@/lib/analytics/consent";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const consent = getConsent();
    if (!consent.analytics && !consent.necessary) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider() {
  return (
    <>
      <GoogleAnalytics />
      <MetaPixel />
      <TikTokPixel />
      <MicrosoftClarity />
      <Hotjar />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
