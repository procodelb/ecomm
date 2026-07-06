import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";
const CSRF_LENGTH = 32;

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(CSRF_LENGTH);
  crypto.getRandomValues(array);
  for (let i = 0; i < CSRF_LENGTH; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(request: NextRequest): NextResponse | null {
  if (SAFE_METHODS.has(request.method)) return null;

  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json(
      { error: "CSRF validation failed" },
      { status: 403 },
    );
  }

  return null;
}

export function setCsrfCookie(response: NextResponse): NextResponse {
  const token = generateToken();
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}

export function getCsrfToken(): string {
  return generateToken();
}
