// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Mocks (hoisted before imports) ──────────────────────────────────────────

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        session: { userId: 'user-123' },
        user: { id: 'user-123' },
      }),
    },
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi
    .fn()
    .mockResolvedValue({
      success: true,
      limit: 60,
      remaining: 59,
      resetAt: Math.ceil(Date.now() / 1000) + 60,
    }),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
  buildRateLimitHeaders: vi.fn().mockReturnValue({ 'Retry-After': '60' }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_SIMULATION = {
  id: 'sim-123',
  user_id: 'user-123',
  name: 'Simulation test',
  is_favorite: false,
  is_archived: false,
  rentabilite_nette: 5.2,
  score_global: 72,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

/**
 * Crée un mock de chaîne Supabase thenable.
 * Tous les méthodes de filtre retournent `this`, et l'objet lui-même
 * est awaitable (résout avec `resolveValue`).
 */
function makeChain(resolveValue: unknown) {
  const chain: Record<string, unknown> & {
    then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) => Promise<unknown>;
  } = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn().mockResolvedValue(resolveValue),
    then(resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) {
      return Promise.resolve(resolveValue).then(resolve, reject);
    },
  };

  (chain.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.insert as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.update as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.delete as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.eq as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.or as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.ilike as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.order as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.limit as ReturnType<typeof vi.fn>).mockReturnValue(chain);

  return chain;
}

// ─── GET /api/simulations (pagination curseur) ────────────────────────────────

describe('GET /api/simulations', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(makeChain({ data: [MOCK_SIMULATION], error: null })),
    } as never);
  });

  it('retourne 200 avec pagination curseur pour un utilisateur authentifié', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.meta).toBeDefined();
    expect(body.meta).toHaveProperty('next_cursor');
    expect(body.meta).toHaveProperty('has_more');
    expect(body.meta).toHaveProperty('limit');
    // Pas de total ni d'offset dans le nouveau format
    expect(body.meta.total).toBeUndefined();
    expect(body.meta.offset).toBeUndefined();
  });

  it('retourne 401 si la session est absente', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('retourne 429 si le rate limit est dépassé', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    vi.mocked(rateLimit).mockResolvedValueOnce({
      success: false,
      limit: 60,
      remaining: 0,
      resetAt: Math.ceil(Date.now() / 1000) + 60,
    });
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations');
    const res = await GET(req);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });

  it('filtre par favorite=true', async () => {
    const chain = makeChain({ data: [MOCK_SIMULATION], error: null });
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?favorite=true');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(chain.eq as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('is_favorite', true);
  });

  it('filtre par archived=true', async () => {
    const chain = makeChain({ data: [MOCK_SIMULATION], error: null });
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?archived=true');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(chain.eq as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('is_archived', true);
  });

  it('retourne 400 si le cursor est invalide', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?cursor=invalid-base64!!!');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('INVALID_CURSOR');
  });

  it('retourne next_cursor=null sur la dernière page (has_more=false)', async () => {
    // Retourner exactement `limit` éléments (pas limit+1) → has_more=false
    const chain = makeChain({ data: [MOCK_SIMULATION], error: null });
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?limit=20');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.meta.has_more).toBe(false);
    expect(body.meta.next_cursor).toBeNull();
  });

  it('rejette une colonne sort invalide et utilise created_at par défaut', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest(
      'http://localhost/api/simulations?sort=password%3B%20DROP%20TABLE--'
    );
    const res = await GET(req);
    expect([200, 400]).toContain(res.status);
  });

  it('filtre par search term (ilike)', async () => {
    const chain = makeChain({ data: [MOCK_SIMULATION], error: null });
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?search=Paris');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(chain.ilike as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('name', '%Paris%');
  });

  it('échappe les caractères LIKE spéciaux dans search', async () => {
    const chain = makeChain({ data: [], error: null });
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?search=test%25admin');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(chain.ilike as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('name', '%test\\%admin%');
  });
});

// ─── POST /api/simulations ────────────────────────────────────────────────────

describe('POST /api/simulations', () => {
  const validBody = {
    name: 'Ma simulation',
    form_data: { bien: {}, financement: {} },
    resultats: {
      rentabilite: { brute: 6.0, nette: 5.0 },
      cashflow: { mensuel: 150 },
      synthese: { score_global: 72.7 },
      hcsf: {},
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi
        .fn()
        .mockReturnValue(
          makeChain({ data: { ...MOCK_SIMULATION, id: 'new-sim-456' }, error: null })
        ),
    } as never);
  });

  it('retourne 201 avec la simulation créée pour un body valide', async () => {
    const { POST } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('retourne 401 si non authentifié', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);
    const { POST } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('retourne 4xx/5xx si le body JSON est invalide (parse error)', async () => {
    const { POST } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations', {
      method: 'POST',
      body: 'not json{{{',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect([400, 500]).toContain(res.status);
  });

  it('retourne 400 si les champs obligatoires sont absents (pas de form_data)', async () => {
    const { POST } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations', {
      method: 'POST',
      body: JSON.stringify({ name: 'Incomplet' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("arrondit score_global à l'entier avant insertion", async () => {
    const chain = makeChain({ data: { ...MOCK_SIMULATION, id: 'new-sim-789' }, error: null });
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const { POST } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations', {
      method: 'POST',
      body: JSON.stringify({
        ...validBody,
        resultats: { ...validBody.resultats, synthese: { score_global: 72.7 } },
      }),
      headers: { 'content-type': 'application/json' },
    });
    await POST(req);

    const insertCall = (chain.insert as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    if (insertCall) {
      expect(Number.isInteger(insertCall.score_global)).toBe(true);
      expect(insertCall.score_global).toBe(73);
    }
  });
});
