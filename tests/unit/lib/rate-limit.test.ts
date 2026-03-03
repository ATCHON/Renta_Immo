// @vitest-environment node
// tests/unit/lib/rate-limit.test.ts — Mis à jour pour rate limiting Upstash (ARCH-S01)
// L'ancienne API synchrone (in-memory) a été remplacée par une API async (Upstash Redis)
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock hoistés
const mockUpstashLimit = vi.hoisted(() => vi.fn());

vi.mock('@/lib/redis', () => ({
  redis: {},
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn().mockReturnValue('slidingWindow-limiter');
    limit = mockUpstashLimit;
  },
}));

describe('rateLimit (Upstash distributed)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("la première requête d'une IP passe (success=true)", async () => {
    mockUpstashLimit.mockResolvedValueOnce({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60_000,
    });
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = await rateLimit('calculate', '1.2.3.4');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('retourne success=false après dépassement de la limite', async () => {
    mockUpstashLimit.mockResolvedValueOnce({
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 30_000,
    });
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = await rateLimit('calculate', '1.2.3.4');
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('retourne resetAt en secondes UNIX dans le futur', async () => {
    const futureMs = Date.now() + 60_000;
    mockUpstashLimit.mockResolvedValueOnce({
      success: true,
      limit: 10,
      remaining: 9,
      reset: futureMs,
    });
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = await rateLimit('calculate', '1.2.3.4');
    const nowSec = Math.ceil(Date.now() / 1000);
    expect(result.resetAt).toBeGreaterThan(nowSec);
  });

  it('fail-open : retourne success=true si Redis est indisponible', async () => {
    mockUpstashLimit.mockRejectedValueOnce(new Error('Redis timeout'));
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = await rateLimit('calculate', 'fail-open-ip');
    expect(result.success).toBe(true);
  });

  it('limit et remaining sont exposés correctement', async () => {
    mockUpstashLimit
      .mockResolvedValueOnce({ success: true, limit: 5, remaining: 4, reset: Date.now() + 60_000 })
      .mockResolvedValueOnce({ success: true, limit: 5, remaining: 3, reset: Date.now() + 60_000 });
    const { rateLimit } = await import('@/lib/rate-limit');
    const r1 = await rateLimit('pdf', '1.2.3.4');
    const r2 = await rateLimit('pdf', '1.2.3.4');
    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
  });
});

describe('getClientIp', () => {
  it("extrait l'IP depuis x-forwarded-for", async () => {
    const { getClientIp } = await import('@/lib/rate-limit');
    const req = new Request('http://localhost/api', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it("extrait l'IP depuis x-real-ip si x-forwarded-for absent", async () => {
    const { getClientIp } = await import('@/lib/rate-limit');
    const req = new Request('http://localhost/api', {
      headers: { 'x-real-ip': '9.10.11.12' },
    });
    expect(getClientIp(req)).toBe('9.10.11.12');
  });

  it('retourne "unknown" si aucun header IP n\'est présent', async () => {
    const { getClientIp } = await import('@/lib/rate-limit');
    const req = new Request('http://localhost/api');
    expect(getClientIp(req)).toBe('unknown');
  });
});
