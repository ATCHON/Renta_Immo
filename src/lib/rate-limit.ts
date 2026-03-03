// src/lib/rate-limit.ts — Rate limiting distribué via Upstash Redis (ARCH-S01)
//
// Utilise slidingWindow pour éviter le burst 2×limit du fixedWindow en renouvellement de fenêtre.
// Fail-open : si Redis est indisponible, la requête est laissée passer (logging warn).

import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

// Limites par endpoint (§ directives architecte ARCH-S01)
const LIMITERS = {
  calculate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    prefix: 'rl:calculate',
  }),
  'simulations:get': new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '60 s'),
    prefix: 'rl:simulations:get',
  }),
  'simulations:post': new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '60 s'),
    prefix: 'rl:simulations:post',
  }),
  pdf: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'rl:pdf',
  }),
  send: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '60 s'),
    prefix: 'rl:send',
  }),
  'simulations:write': new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '60 s'),
    prefix: 'rl:simulations:write',
  }),
} as const;

export type RateLimitEndpoint = keyof typeof LIMITERS;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // timestamp UNIX en secondes
}

/**
 * Vérifie et consomme un token de rate limit pour l'endpoint et la clé donnés.
 * Fail-open : si Redis est indisponible, retourne success=true avec un log warn.
 */
export async function rateLimit(endpoint: RateLimitEndpoint, ip: string): Promise<RateLimitResult> {
  const limiter = LIMITERS[endpoint];

  try {
    const result = await limiter.limit(ip);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetAt: Math.ceil(result.reset / 1000), // Upstash reset est en ms
    };
  } catch (err) {
    console.warn('[RateLimit] Redis indisponible — fail-open', { endpoint, err });
    return {
      success: true,
      limit: 0,
      remaining: 0,
      resetAt: Math.ceil(Date.now() / 1000) + 60,
    };
  }
}

/**
 * Construit les headers de réponse 429 standard (Retry-After + X-RateLimit-*).
 */
export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const retryAfter = Math.max(0, result.resetAt - Math.ceil(Date.now() / 1000));
  return {
    'Retry-After': String(retryAfter),
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
  };
}

/**
 * Extrait l'IP client depuis les headers de la requête (environnements Vercel/proxy).
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
