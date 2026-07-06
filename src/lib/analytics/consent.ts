"use client";

const CONSENT_KEY = "analytics-consent";

export type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) return { ...DEFAULT_CONSENT, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_CONSENT;
}

export function setConsent(state: Partial<ConsentState>) {
  if (typeof window === "undefined") return;
  const current = getConsent();
  const updated = { ...current, ...state };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("consent-updated", { detail: updated }));
  } catch { /* ignore */ }
}

export function acceptAllConsent() {
  setConsent({ analytics: true, marketing: true, functional: true });
}

export function rejectAllConsent() {
  setConsent({ analytics: false, marketing: false, functional: false });
}
