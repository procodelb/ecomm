export function sanitizeError(error: unknown): { error: string; status: number } {
  if (error instanceof SyntaxError) {
    return { error: "Invalid request format", status: 400 };
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes("not found") || msg.includes("not_exist")) {
      return { error: "Resource not found", status: 404 };
    }

    if (msg.includes("unique constraint") || msg.includes("duplicate")) {
      return { error: "Resource already exists", status: 409 };
    }

    if (msg.includes("foreign key") || msg.includes("constraint")) {
      return { error: "Invalid reference", status: 400 };
    }

    if (msg.includes("timeout") || msg.includes("timed out")) {
      return { error: "Request timed out", status: 504 };
    }

    if (msg.includes("unauthorized") || msg.includes("unauthenticated")) {
      return { error: "Unauthorized", status: 401 };
    }

    if (msg.includes("forbidden") || msg.includes("permission")) {
      return { error: "Forbidden", status: 403 };
    }

    if (msg.includes("rate limit") || msg.includes("too many")) {
      return { error: "Too many requests", status: 429 };
    }

    if (msg.includes("validation") || msg.includes("invalid")) {
      return { error: "Validation error", status: 400 };
    }

    if (process.env.NODE_ENV === "development") {
      return { error: msg, status: 500 };
    }
  }

  return { error: "Internal server error", status: 500 };
}

export function sanitizeResponseBody(data: unknown): unknown {
  if (typeof data !== "object" || data === null) return data;

  const sanitized = Array.isArray(data) ? [...data] : { ...data } as Record<string, unknown>;

  const sensitiveKeys = [
    "password", "passwordHash", "password_hash",
    "token", "secret", "apiKey", "api_key", "apiSecret", "api_secret",
    "accessToken", "refreshToken", "access_token", "refresh_token",
    "privateKey", "private_key", "secretKey", "secret_key",
    "creditCard", "cvv", "ssn", "sin",
  ];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      (sanitized as Record<string, unknown>)[key] = "[REDACTED]";
    } else if (typeof (sanitized as Record<string, unknown>)[key] === "object") {
      (sanitized as Record<string, unknown>)[key] = sanitizeResponseBody((sanitized as Record<string, unknown>)[key]);
    }
  }

  return sanitized;
}
