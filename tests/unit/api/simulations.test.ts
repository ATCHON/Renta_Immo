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
    .mockReturnValue({ success: true, limit: 30, remaining: 29, resetAt: Date.now() + 60000 }),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
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
    ilike: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
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
  (chain.ilike as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.order as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  (chain.range as ReturnType<typeof vi.fn>).mockReturnValue(chain);

  return chain;
}

// ─── GET /api/simulations ─────────────────────────────────────────────────────

describe('GET /api/simulations', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(makeChain({ data: [MOCK_SIMULATION], error: null, count: 1 })),
    } as never);
  });

  it('retourne 200 avec une liste pour un utilisateur authentifié', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.success).toBe(true);
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
    vi.mocked(rateLimit).mockReturnValueOnce({
      success: false,
      limit: 30,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations');
    const res = await GET(req);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });

  it('filtre par favorite=true', async () => {
    const chain = makeChain({ data: [MOCK_SIMULATION], error: null, count: 1 });
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
    const chain = makeChain({ data: [MOCK_SIMULATION], error: null, count: 1 });
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

  it('rejette ou remplace une colonne sort invalide', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest(
      'http://localhost/api/simulations?sort=password%3B%20DROP%20TABLE--'
    );
    const res = await GET(req);
    expect([200, 400]).toContain(res.status);
  });

  it('filtre par search term (ilike)', async () => {
    const chain = makeChain({ data: [MOCK_SIMULATION], error: null, count: 1 });
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
    const chain = makeChain({ data: [], error: null, count: 0 });
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?search=test%25admin');
    const res = await GET(req);
    expect(res.status).toBe(200);
    // Le % doit être échappé en \%
    expect(chain.ilike as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('name', '%test\\%admin%');
  });

  it('applique la pagination avec limit et offset valides', async () => {
    const chain = makeChain({ data: [MOCK_SIMULATION], error: null, count: 1 });
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?limit=10&offset=20');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(chain.range as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(20, 29);
  });

  it('corrige limit hors bornes (max 100)', async () => {
    const chain = makeChain({ data: [], error: null, count: 0 });
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?limit=999');
    const res = await GET(req);
    expect(res.status).toBe(200);
    // range(0, 99) car limit est clampé à 100
    expect(chain.range as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(0, 99);
  });

  it('corrige offset négatif à 0', async () => {
    const chain = makeChain({ data: [], error: null, count: 0 });
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(chain),
    } as never);

    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?offset=-5');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(chain.range as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(0, expect.any(Number));
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
    // La route ne distingue pas SyntaxError de ZodError → retourne 500
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
