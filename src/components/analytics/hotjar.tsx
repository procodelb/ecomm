"use client";

import Script from "next/script";
import { analyticsConfig } from "@/lib/analytics/config";

export function Hotjar() {
  if (!analyticsConfig.hotjar.enabled) return null;

  const siteId = analyticsConfig.hotjar.siteId;
  const version = analyticsConfig.hotjar.version;

  return (
    <Script id="hotjar" strategy="afterInteractive">
      {`
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${siteId},hjsv:${version}};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  );
}
