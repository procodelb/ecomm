"use client";

import { useState, useEffect } from "react";
import { getConsent, acceptAllConsent, rejectAllConsent, setConsent } from "@/lib/analytics/consent";
import type { ConsentState } from "@/lib/analytics/consent";
import { Button } from "@/components/ui/button";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent.analytics && !consent.marketing) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Consent banner visibility must be set in effect after client mount
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-dark/95 backdrop-blur-xl p-6 shadow-2xl">
        <p className="mb-4 text-sm text-muted-foreground">
          We use cookies and similar technologies to enhance your experience, analyze traffic, and deliver personalised content. You can choose which categories to allow.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={acceptAllConsent}>
            Accept All
          </Button>
          <Button variant="outline" onClick={rejectAllConsent}>
            Reject All
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setConsent({ analytics: true, marketing: false } satisfies Partial<ConsentState>);
            }}
          >
            Only Necessary
          </Button>
        </div>
      </div>
    </div>
  );
}
