type BruteForceEntry = {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number | null;
};

const store = new Map<string, BruteForceEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 30 * 60 * 1000;

export function checkBruteForce(key: string): { allowed: boolean; remaining: number; lockedUntil: number | null } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { attempts: 0, firstAttempt: now, lockedUntil: null });
    return { allowed: true, remaining: MAX_ATTEMPTS, lockedUntil: null };
  }

  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, remaining: 0, lockedUntil: entry.lockedUntil };
  }

  if (entry.lockedUntil && now >= entry.lockedUntil) {
    store.set(key, { attempts: 0, firstAttempt: now, lockedUntil: null });
    return { allowed: true, remaining: MAX_ATTEMPTS, lockedUntil: null };
  }

  return { allowed: true, remaining: Math.max(0, MAX_ATTEMPTS - entry.attempts), lockedUntil: null };
}

export function recordFailedAttempt(key: string): { locked: boolean; lockedUntil: number | null } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { attempts: 1, firstAttempt: now, lockedUntil: null });
    return { locked: false, lockedUntil: null };
  }

  entry.attempts++;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    return { locked: true, lockedUntil: entry.lockedUntil };
  }

  return { locked: false, lockedUntil: null };
}

export function resetBruteForce(key: string) {
  store.delete(key);
}

export function getBruteForceKey(identifier: string): string {
  return `brute:${identifier}`;
}
