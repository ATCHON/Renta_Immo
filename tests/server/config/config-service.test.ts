// tests/server/config/config-service.test.ts — TU cache Redis ConfigService (ARCH-S03)
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks hoistés
const mockRedisGet = vi.hoisted(() => vi.fn());
const mockRedisSet = vi.hoisted(() => vi.fn());
const mockRedisDel = vi.hoisted(() => vi.fn());

vi.mock('@/lib/redis', () => ({
  redis: {
    get: mockRedisGet,
    set: mockRedisSet,
    del: mockRedisDel,
  },
}));

const mockSupabaseSelect = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(mockSupabaseSelect()),
      }),
    }),
  }),
}));

// Import après mocks
import { ConfigService } from '@/server/config/config-service';

// Réinitialiser le singleton entre chaque test
function freshConfigService(): ConfigService {
  // @ts-expect-error — reset singleton pour les tests
  ConfigService.instance = undefined;
  return ConfigService.getInstance();
}

const FALLBACK_CONFIG_YEAR = 2026;

describe('ConfigService.getConfig — cache Redis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cache HIT : retourne la config depuis Redis sans appel DB', async () => {
    const cachedConfig = { anneeFiscale: FALLBACK_CONFIG_YEAR, tauxPsFoncier: 0.172 };
    mockRedisGet.mockResolvedValueOnce(JSON.stringify(cachedConfig));

    const service = freshConfigService();
    const result = await service.getConfig(FALLBACK_CONFIG_YEAR);

    expect(result.anneeFiscale).toBe(FALLBACK_CONFIG_YEAR);
    expect(result.tauxPsFoncier).toBe(0.172);
    expect(mockRedisGet).toHaveBeenCalledWith(`config:fiscal:${FALLBACK_CONFIG_YEAR}`);
    // Pas d'appel à Supabase
    const { createAdminClient } = await import('@/lib/supabase/server');
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('cache MISS : charge depuis Supabase et stocke dans Redis', async () => {
    mockRedisGet.mockResolvedValueOnce(null); // cache MISS
    mockRedisSet.mockResolvedValueOnce('OK');

    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [],
            error: null,
          }),
        }),
      }),
    } as ReturnType<typeof createAdminClient> extends Promise<infer T> ? T : never);

    const service = freshConfigService();
    const result = await service.getConfig(FALLBACK_CONFIG_YEAR);

    // DB vide → fallback config
    expect(result.anneeFiscale).toBe(FALLBACK_CONFIG_YEAR);
    // Redis set doit être appelé avec le TTL
    expect(mockRedisSet).toHaveBeenCalledWith(
      `config:fiscal:${FALLBACK_CONFIG_YEAR}`,
      expect.any(String),
      { ex: expect.any(Number) }
    );
  });

  it('fail-open Redis : tombé sur DB si Redis.get lève une exception', async () => {
    mockRedisGet.mockRejectedValueOnce(new Error('Redis timeout'));
    mockRedisSet.mockResolvedValueOnce('OK');

    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [],
            error: null,
          }),
        }),
      }),
    } as ReturnType<typeof createAdminClient> extends Promise<infer T> ? T : never);

    const service = freshConfigService();
    const result = await service.getConfig(FALLBACK_CONFIG_YEAR);

    // Doit retourner une config valide malgré Redis down
    expect(result.anneeFiscale).toBe(FALLBACK_CONFIG_YEAR);
    expect(result.tauxPsFoncier).toBeGreaterThan(0);
  });

  it('double fail-open : fallback hardcodé si Redis ET Supabase sont down', async () => {
    mockRedisGet.mockRejectedValueOnce(new Error('Redis timeout'));

    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockRejectedValueOnce(new Error('Supabase timeout'));

    const service = freshConfigService();
    const result = await service.getConfig(FALLBACK_CONFIG_YEAR);

    // Doit retourner les valeurs hardcodées de getFallbackConfig
    expect(result.anneeFiscale).toBe(FALLBACK_CONFIG_YEAR);
    expect(result.tauxPsFoncier).toBe(0.172); // valeur hardcodée
    expect(result.flatTax).toBe(0.3); // valeur hardcodée
  });
});

describe('ConfigService.invalidateCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalide une année spécifique', async () => {
    mockRedisDel.mockResolvedValue(1);
    const service = freshConfigService();
    await service.invalidateCache(2026);
    expect(mockRedisDel).toHaveBeenCalledWith('config:fiscal:2026');
    expect(mockRedisDel).toHaveBeenCalledTimes(1);
  });

  it('invalide toutes les années connues si aucune année fournie', async () => {
    mockRedisDel.mockResolvedValue(1);
    const service = freshConfigService();
    await service.invalidateCache();
    // Doit appeler DEL pour 2024, 2025, 2026, 2027
    expect(mockRedisDel).toHaveBeenCalledTimes(4);
    expect(mockRedisDel).toHaveBeenCalledWith('config:fiscal:2024');
    expect(mockRedisDel).toHaveBeenCalledWith('config:fiscal:2025');
    expect(mockRedisDel).toHaveBeenCalledWith('config:fiscal:2026');
    expect(mockRedisDel).toHaveBeenCalledWith('config:fiscal:2027');
  });

  it('fail-open invalidation : ne plante pas si Redis est down', async () => {
    mockRedisDel.mockRejectedValue(new Error('Redis timeout'));
    const service = freshConfigService();
    // Ne doit pas lever d'exception
    await expect(service.invalidateCache(2026)).resolves.toBeUndefined();
  });
});
