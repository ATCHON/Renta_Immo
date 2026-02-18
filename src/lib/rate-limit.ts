/**
 * In-memory rate limiter for API routes.
 *
 * Note: Each Vercel serverless instance has its own memory, so this is
 * approximate. For strict rate limiting, use an external store (e.g. Upstash Redis).
 * This provides a practical first line of defense against abuse.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries (every 60s)
if (typeof globalThis !== 'undefined') {
  const CLEANUP_INTERVAL = 60_000;
  const cleanup = () => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    });
  };
  // Use global to prevent duplicate intervals across hot reloads
  const globalWithCleanup = globalThis as typeof globalThis & {
    __rateLimitCleanup?: NodeJS.Timeout;
  };
  if (!globalWithCleanup.__rateLimitCleanup) {
    globalWithCleanup.__rateLimitCleanup = setInterval(cleanup, CLEANUP_INTERVAL);
  }
}

interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window duration in milliseconds */
  window: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check and consume a rate limit token.
 *
 * @param key - Unique identifier (e.g. `calculate:<ip>`)
 * @param config - Rate limit configuration
 * @returns Result with success flag and metadata
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + config.window });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: now + config.window,
    };
  }

  entry.count++;

  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Extract client IP from request headers (Vercel / proxied environments).
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
