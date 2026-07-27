"use client";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

type ApiError = {
  status: number;
  message: string;
  detail?: string;
};

type ApiFetchOptions = Omit<RequestInit, "method" | "body"> & {
  method?: string;
  body?: unknown;
};

function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function ensureCsrfCookie(): Record<string, string> {
  const token = getCookieValue("csrf-token");
  if (token) return { "x-csrf-token": token };
  return {};
}

export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, headers: userHeaders, ...rest } = options;
  const isMutation = MUTATION_METHODS.has(method.toUpperCase());

  const headers = new Headers();

  if (userHeaders) {
    if (userHeaders instanceof Headers) {
      userHeaders.forEach((value, key) => headers.set(key, value));
    } else {
      Object.entries(userHeaders).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          headers.set(key, value);
        }
      });
    }
  }

  if (isMutation) {
    const csrfHeaders = ensureCsrfCookie();
    Object.entries(csrfHeaders).forEach(([key, value]) => {
      if (!headers.has(key)) headers.set(key, value);
    });
  }

  let serializedBody: string | FormData | undefined;
  if (body !== undefined) {
    if (body instanceof FormData) {
      serializedBody = body;
    } else {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      serializedBody = JSON.stringify(body);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: serializedBody,
    credentials: "same-origin",
    ...rest,
  });

  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const errData = data as Record<string, unknown> | null;
    const error: ApiError = {
      status: response.status,
      message:
        (errData?.error as string) ||
        (errData?.message as string) ||
        `Request failed (${response.status})`,
      detail: errData?.detail as string | undefined,
    };
    throw error;
  }

  return data as T;
}
