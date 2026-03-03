// tests/lib/rate-limit.test.ts — TU rate limiting distribué Upstash (ARCH-S01)
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted() garantit que mockLimit est initialisé avant le hoisting des vi.mock()
const mockLimit = vi.hoisted(() => vi.fn());

// Mock du module Redis avant l'import de rate-limit
vi.mock('@/lib/redis', () => ({
  redis: {},
}));

// Mock de @upstash/ratelimit
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn().mockReturnValue('slidingWindow-limiter');
    limit = mockLimit;
  },
}));

// Import après les mocks
import { rateLimit, getClientIp, buildRateLimitHeaders } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne success=true si la limite nest pas atteinte', async () => {
    mockLimit.mockResolvedValueOnce({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60_000,
    });

    const result = await rateLimit('calculate', '1.2.3.4');

    expect(result.success).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(9);
    expect(mockLimit).toHaveBeenCalledWith('1.2.3.4');
  });

  it('retourne success=false si la limite est atteinte (sliding window)', async () => {
    mockLimit.mockResolvedValueOnce({
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 30_000,
    });

    const result = await rateLimit('calculate', '1.2.3.4');

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('fail-open : retourne success=true si Redis est indisponible', async () => {
    mockLimit.mockRejectedValueOnce(new Error('Redis timeout'));

    const result = await rateLimit('calculate', '1.2.3.4');

    expect(result.success).toBe(true);
  });

  it('utilise le bon endpoint pour chaque limiter', async () => {
    mockLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60_000,
    });

    await rateLimit('pdf', '1.2.3.4');
    expect(mockLimit).toHaveBeenCalledWith('1.2.3.4');
  });
});

describe('buildRateLimitHeaders', () => {
  it('construit les headers X-RateLimit-* corrects', () => {
    const resetAt = Math.ceil(Date.now() / 1000) + 30;
    const headers = buildRateLimitHeaders({
      success: false,
      limit: 10,
      remaining: 0,
      resetAt,
    });

    expect(headers['X-RateLimit-Limit']).toBe('10');
    expect(headers['X-RateLimit-Remaining']).toBe('0');
    expect(headers['X-RateLimit-Reset']).toBe(String(resetAt));
    expect(Number(headers['Retry-After'])).toBeGreaterThanOrEqual(0);
    expect(Number(headers['Retry-After'])).toBeLessThanOrEqual(30);
  });

  it('Retry-After est au minimum 0 (jamais négatif)', () => {
    const resetAt = Math.ceil(Date.now() / 1000) - 10; // reset dans le passé
    const headers = buildRateLimitHeaders({
      success: false,
      limit: 10,
      remaining: 0,
      resetAt,
    });

    expect(Number(headers['Retry-After'])).toBe(0);
  });
});

describe('getClientIp', () => {
  it('extrait lIP depuis x-forwarded-for (Vercel)', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('extrait lIP depuis x-real-ip si pas de x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    expect(getClientIp(req)).toBe('9.9.9.9');
  });

  it('retourne "unknown" si aucun header dIP', () => {
    const req = new Request('http://localhost');
    expect(getClientIp(req)).toBe('unknown');
  });
});
