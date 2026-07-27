"use client";

function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getCsrfHeader(): Record<string, string> {
  const token = getCookieValue("csrf-token");
  if (!token) return {};
  return { "x-csrf-token": token };
}
