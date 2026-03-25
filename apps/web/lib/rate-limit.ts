/**
 * In-memory sliding-window rate limiter for API routes.
 *
 * Uses a Map of timestamps per key. Each request appends the current time;
 * expired entries are pruned on every check. This works well for single-
 * instance and Vercel Edge deployments where the isolate stays warm for a
 * period. For multi-region or high-scale setups, swap to Upstash Redis.
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number;
}

interface RateLimitConfig {
  /** Maximum requests allowed inside the window. */
  max: number;
  /** Window duration in seconds. */
  windowSeconds: number;
}

const store = new Map<string, number[]>();

// Periodic cleanup to prevent memory leaks (every 60 s, drop stale keys)
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(now: number, windowMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, timestamps] of store) {
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      store.set(key, valid);
    }
  }
}

export function rateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  cleanup(now, windowMs);

  const timestamps = (store.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= config.max) {
    const oldestInWindow = timestamps[0];
    const retryAfterSeconds = Math.ceil(
      (oldestInWindow + windowMs - now) / 1000,
    );
    return {
      allowed: false,
      remaining: 0,
      limit: config.max,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  return {
    allowed: true,
    remaining: config.max - timestamps.length,
    limit: config.max,
    retryAfterSeconds: 0,
  };
}

// ── Pre-defined tiers ────────────────────────────────────────────────
/** Read operations (GET): 120 req / 60 s per IP */
export const READ_LIMIT: RateLimitConfig = { max: 120, windowSeconds: 60 };

/** Write operations (POST/PUT/DELETE): 40 req / 60 s per IP */
export const WRITE_LIMIT: RateLimitConfig = { max: 40, windowSeconds: 60 };

/** Expensive operations (exports, reports): 10 req / 60 s per IP */
export const EXPENSIVE_LIMIT: RateLimitConfig = { max: 10, windowSeconds: 60 };
