// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.resetModules(); // Reset le store in-memory entre les tests
  });

  it("la première requête d'une IP passe", async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = rateLimit('test-ip-1', { limit: 10, window: 60000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('retourne false après dépassement de la limite', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const key = 'test-ip-over';

    for (let i = 0; i < 3; i++) {
      rateLimit(key, { limit: 3, window: 60000 });
    }

    const result = rateLimit(key, { limit: 3, window: 60000 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('retourne resetAt dans le futur', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const before = Date.now();
    const result = rateLimit('test-ip-reset', { limit: 10, window: 60000 });
    expect(result.resetAt).toBeGreaterThan(before);
  });

  it('deux IPs différentes ont des compteurs indépendants', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');

    // IP A dépasse
    for (let i = 0; i < 3; i++) {
      rateLimit('ip-a', { limit: 3, window: 60000 });
    }
    const resultA = rateLimit('ip-a', { limit: 3, window: 60000 });
    expect(resultA.success).toBe(false);

    // IP B n'est pas affectée
    const resultB = rateLimit('ip-b', { limit: 3, window: 60000 });
    expect(resultB.success).toBe(true);
  });

  it('limit et remaining sont cohérents', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const r1 = rateLimit('test-ip-count', { limit: 5, window: 60000 });
    const r2 = rateLimit('test-ip-count', { limit: 5, window: 60000 });
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
