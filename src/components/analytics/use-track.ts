"use client";

import { useCallback } from "react";
import { trackEvent, trackPurchase } from "@/lib/analytics/client";
import type { TrackEvent, EventProperties, PurchaseData } from "@/lib/analytics/types";

export function useTrack() {
  const track = useCallback((event: TrackEvent, params?: EventProperties) => {
    trackEvent(event, params);
  }, []);

  const trackPurchaseEvent = useCallback((data: PurchaseData) => {
    trackPurchase(data);
  }, []);

  return { track, trackPurchase: trackPurchaseEvent };
}
