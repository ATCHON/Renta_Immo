// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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
  form_data: { bien: {}, financement: {} },
  resultats: { rentabilite: {}, hcsf: {} },
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const PARAMS = { params: { id: 'sim-123' } };

/**
 * Chaîne Supabase thenable — toutes les méthodes de filtre retournent `this`,
 * `single()` résout directement, et `await chain` résout aussi (pour DELETE).
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

  return chain;
}

// ─── GET /api/simulations/[id] ───────────────────────────────────────────────

describe('GET /api/simulations/[id]', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(makeChain({ data: MOCK_SIMULATION, error: null })),
    } as never);
  });

  it("retourne 200 avec la simulation si elle appartient à l'utilisateur", async () => {
    const { GET } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123');
    const res = await GET(req, PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('sim-123');
  });

  it("retourne 404 si la simulation n'existe pas (PGRST116)", async () => {
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi
        .fn()
        .mockReturnValue(
          makeChain({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
        ),
    } as never);

    const { GET } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/not-found');
    const res = await GET(req, { params: { id: 'not-found' } });
    expect(res.status).toBe(404);
  });

  it('retourne 401 si non authentifié', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);
    const { GET } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123');
    const res = await GET(req, PARAMS);
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
    const { GET } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123');
    const res = await GET(req, PARAMS);
    expect(res.status).toBe(429);
  });
});

// ─── PATCH /api/simulations/[id] ─────────────────────────────────────────────

describe('PATCH /api/simulations/[id]', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(makeChain({ data: MOCK_SIMULATION, error: null })),
    } as never);
  });

  it('retourne 200 après mise à jour valide', async () => {
    const { PATCH } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Nouveau nom' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await PATCH(req, PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('retourne 401 si non authentifié', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);
    const { PATCH } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Test' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await PATCH(req, PARAMS);
    expect(res.status).toBe(401);
  });

  it('met à jour is_favorite indépendamment', async () => {
    const { PATCH } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'PATCH',
      body: JSON.stringify({ is_favorite: true }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await PATCH(req, PARAMS);
    expect(res.status).toBe(200);
  });

  it('met à jour is_archived indépendamment', async () => {
    const { PATCH } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'PATCH',
      body: JSON.stringify({ is_archived: true }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await PATCH(req, PARAMS);
    expect(res.status).toBe(200);
  });

  it('retourne 400 si le body est invalide (type ZodError)', async () => {
    const { PATCH } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'PATCH',
      body: JSON.stringify({ is_favorite: 'not-a-boolean' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await PATCH(req, PARAMS);
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /api/simulations/[id] ────────────────────────────────────────────

describe('DELETE /api/simulations/[id]', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi.fn().mockReturnValue(makeChain({ error: null })),
    } as never);
  });

  it('retourne 200 après suppression réussie', async () => {
    const { DELETE } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'DELETE',
    });
    const res = await DELETE(req, PARAMS);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('retourne 401 si non authentifié', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);
    const { DELETE } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'DELETE',
    });
    const res = await DELETE(req, PARAMS);
    expect(res.status).toBe(401);
  });

  it('retourne 500 si erreur Supabase', async () => {
    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockResolvedValue({
      from: vi
        .fn()
        .mockReturnValue(makeChain({ error: { code: 'PGRST000', message: 'DB error' } })),
    } as never);

    const { DELETE } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'DELETE',
    });
    const res = await DELETE(req, PARAMS);
    expect(res.status).toBe(500);
  });
});
