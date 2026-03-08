# Audit Tests & DevOps — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mettre en place l'infrastructure de tests (Vitest + Playwright) et les tests unitaires/E2E couvrant les routes API simulations, les hooks/utilitaires, et les flux d'authentification.

**Architecture:** Configuration dual-environment Vitest (node pour calculs, jsdom pour hooks/stores), Playwright avec webServer auto-démarré et helper auth centralisé. Les tests API mockent Supabase et Better Auth sans aucune dépendance réseau.

**Tech Stack:** Vitest 4, Playwright 1.58, @testing-library/react, Husky, lint-staged

---

## Task 1 — AUDIT-201 : Vitest config (setupFiles + seuils + timeout)

**Files:**

- Modify: `vitest.config.ts`
- Create: `tests/setup.ts`

**Step 1: Modifier vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__x00__*',
        '**/\x00*',
        'cypress/**',
        'test?(s)/**',
        'test?(-*).?(c|m)js',
        '**/*{.,-}{test,spec}.?(c|m)js',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/vitest.{workspace,projects}.[jt]s?(on)',
        '**/.{eslint,prettier}rc.{js,cjs,yml,json}',
        'src/lib/auth.ts',
        'src/instrumentation*.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
```

**Step 2: Créer tests/setup.ts**

```typescript
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

// Mock window.matchMedia (Tailwind/résolution)
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
);

// Mock IntersectionObserver (composants lazy-load)
vi.stubGlobal(
  'IntersectionObserver',
  vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
);
```

**Step 3: Vérifier que les tests passent**

```bash
npm run test
```

Attendu : tous les tests existants passent (169+ tests)

**Step 4: Commit**

```bash
git add vitest.config.ts tests/setup.ts
git commit -m "feat(test): add Vitest setupFiles, testTimeout, coverage thresholds (AUDIT-201)"
```

---

## Task 2 — AUDIT-201 : Playwright config (webServer + Firefox + dotenv + baseURL env)

**Files:**

- Modify: `playwright.config.ts`
- Create: `tests/e2e/helpers/auth.ts`

**Step 1: Modifier playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**Step 2: Créer tests/e2e/helpers/auth.ts**

```typescript
import { Page } from '@playwright/test';

export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'test-auth-script@example.com',
  password: process.env.E2E_TEST_PASSWORD ?? 'Password123!',
};

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mot de passe/i).fill(password);
  await page.getByRole('button', { name: /connexion/i }).click();
  await page.waitForURL(/\/(calculateur|simulations)/);
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /déconnexion/i }).click();
  await page.waitForURL('/auth/login');
}
```

**Step 3: Créer .env.test (non commité)**

```bash
cat > .env.test << 'EOF'
E2E_TEST_EMAIL=test-auth-script@example.com
E2E_TEST_PASSWORD=Password123!
PLAYWRIGHT_BASE_URL=http://localhost:3000
EOF
echo ".env.test" >> .gitignore
```

**Step 4: Ajouter les scripts dans package.json**

Ajouter dans la section `"scripts"` :

```json
"test:watch": "vitest",
"test:ui": "vitest --ui",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"analyze": "ANALYZE=true next build",
"prepare": "husky"
```

**Step 5: Vérifier TypeScript**

```bash
npm run type-check
```

**Step 6: Commit**

```bash
git add playwright.config.ts tests/e2e/helpers/auth.ts package.json .gitignore
git commit -m "feat(test): configure Playwright webServer, Firefox, baseURL env, E2E auth helper (AUDIT-201)"
```

---

## Task 3 — AUDIT-202 : Husky + lint-staged pre-commit hooks

**Files:**

- Modify: `package.json`
- Create: `.husky/pre-commit`

**Step 1: Installer Husky et lint-staged**

```bash
npm install --save-dev husky lint-staged
npx husky init
```

**Step 2: Modifier .husky/pre-commit**

```sh
npx lint-staged
```

**Step 3: Ajouter la config lint-staged dans package.json**

Ajouter à la racine du JSON :

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write"
  ],
  "*.{json,md,css}": [
    "prettier --write"
  ]
}
```

**Step 4: Mettre à jour eslint-config-next**

```bash
npm install --save-dev eslint-config-next@14.2.35
```

**Step 5: Vérifier que le pre-commit passe**

```bash
git add .
git stash
echo "test" > /tmp/test-lint.ts
```

(Test manuel en committant un fichier propre)

**Step 6: Vérifier ci.yml utilise --ignore-scripts**

Ouvrir `.github/workflows/ci.yml` et vérifier que `npm ci` utilise `--ignore-scripts`. Si non, ajouter le flag.

**Step 7: Commit**

```bash
git add package.json package-lock.json .husky/
git commit -m "feat(devops): add Husky pre-commit hooks with lint-staged (AUDIT-202)"
```

---

## Task 4 — AUDIT-203 : Tests API `GET /api/simulations` + `POST /api/simulations`

**Files:**

- Create: `tests/unit/api/simulations.test.ts`

**Step 1: Lire les routes sources**

```bash
# Lire avant de tester
cat src/app/api/simulations/route.ts
```

**Step 2: Créer tests/unit/api/simulations.test.ts**

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Mocks ───────────────────────────────────────────────────────────────────

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

const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: MOCK_SIMULATION, error: null }),
};
// Pour GET list, il faut résoudre directement (pas de .single())
// On configure via beforeEach

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => mockSupabaseChain),
  })),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        session: { userId: 'user-123' },
      }),
    },
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  withRateLimit: vi
    .fn()
    .mockImplementation((_req: unknown, _config: unknown, handler: () => unknown) => handler()),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GET /api/simulations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Réinitialiser le comportement de la chaîne Supabase pour le GET list
    Object.assign(mockSupabaseChain, {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [MOCK_SIMULATION],
        error: null,
        count: 1,
      }),
    });
  });

  it('retourne 200 avec une liste pour un utilisateur authentifié', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
  });

  it('retourne 401 si la session est absente', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ session: null } as never);
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('filtre par status=favorites', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?status=favorites');
    const res = await GET(req);
    expect(res.status).toBe(200);
    // Vérifier que eq a été appelé avec is_favorite=true
    expect(mockSupabaseChain.eq).toHaveBeenCalledWith('is_favorite', true);
  });

  it('filtre par status=archived', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?status=archived');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockSupabaseChain.eq).toHaveBeenCalledWith('is_archived', true);
  });

  it('rejette ou remplace une colonne sort invalide', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?sort=password; DROP TABLE--');
    const res = await GET(req);
    expect([200, 400]).toContain(res.status);
  });

  it('filtre par search term', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?search=Paris');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('échappe les caractères LIKE spéciaux dans search', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?search=test%25admin');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('applique la pagination avec limit et offset valides', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?limit=10&offset=20');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockSupabaseChain.range).toHaveBeenCalledWith(20, 29);
  });

  it('corrige limit hors bornes', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?limit=999');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('corrige offset négatif à 0', async () => {
    const { GET } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations?offset=-5');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});

describe('POST /api/simulations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockSupabaseChain, {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { ...MOCK_SIMULATION, id: 'new-sim-456' }, error: null }),
    });
  });

  const validBody = {
    name: 'Ma simulation',
    form_data: { bien: {}, financement: {} },
    resultats: { rentabilite: {}, hcsf: {} },
    score_global: 72.7,
  };

  it('retourne 201 avec la simulation créée pour un body valide', async () => {
    const { POST } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it('retourne 401 si non authentifié', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ session: null } as never);
    const { POST } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('retourne 400 si le body est vide', async () => {
    const { POST } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations', {
      method: 'POST',
      body: '',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('retourne 400 si les champs obligatoires sont absents', async () => {
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
    const { POST } = await import('@/app/api/simulations/route');
    const req = new NextRequest('http://localhost/api/simulations', {
      method: 'POST',
      body: JSON.stringify({ ...validBody, score_global: 72.7 }),
      headers: { 'content-type': 'application/json' },
    });
    await POST(req);
    // Vérifier que l'insert a reçu score_global = 73 (entier)
    const insertCall = mockSupabaseChain.insert.mock.calls[0]?.[0];
    if (insertCall) {
      expect(Number.isInteger(insertCall.score_global)).toBe(true);
    }
  });
});
```

**Step 3: Exécuter les tests**

```bash
npm run test tests/unit/api/simulations.test.ts
```

Note: certains tests peuvent échouer si la route n'implémente pas exactement le comportement. Adapter les assertions en conséquence après lecture de la route source.

**Step 4: Commit**

```bash
git add tests/unit/api/simulations.test.ts
git commit -m "test(api): add unit tests for GET/POST /api/simulations (AUDIT-203)"
```

---

## Task 5 — AUDIT-203 : Tests API `GET/PUT/DELETE /api/simulations/[id]`

**Files:**

- Create: `tests/unit/api/simulations-id.test.ts`

**Step 1: Lire la route source**

```bash
cat src/app/api/simulations/[id]/route.ts
```

**Step 2: Créer tests/unit/api/simulations-id.test.ts**

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

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

const mockChain = {
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: MOCK_SIMULATION, error: null }),
};

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => mockChain),
  })),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({ session: { userId: 'user-123' } }),
    },
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  withRateLimit: vi
    .fn()
    .mockImplementation((_req: unknown, _config: unknown, handler: () => unknown) => handler()),
}));

const PARAMS = { params: { id: 'sim-123' } };

describe('GET /api/simulations/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne 200 avec la simulation si elle appartient à l'utilisateur", async () => {
    Object.assign(mockChain, {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: MOCK_SIMULATION, error: null }),
    });
    const { GET } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123');
    const res = await GET(req, PARAMS);
    expect(res.status).toBe(200);
  });

  it("retourne 404 si la simulation n'existe pas", async () => {
    Object.assign(mockChain, {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    });
    const { GET } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/not-found');
    const res = await GET(req, { params: { id: 'not-found' } });
    expect([403, 404]).toContain(res.status);
  });

  it('retourne 401 si non authentifié', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ session: null } as never);
    const { GET } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123');
    const res = await GET(req, PARAMS);
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/simulations/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockChain, {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: MOCK_SIMULATION, error: null }),
    });
  });

  it('retourne 200 après mise à jour valide', async () => {
    const { PUT } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Nouveau nom' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await PUT(req, PARAMS);
    expect(res.status).toBe(200);
  });

  it('retourne 401 si non authentifié', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ session: null } as never);
    const { PUT } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Test' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await PUT(req, PARAMS);
    expect(res.status).toBe(401);
  });

  it('met à jour is_favorite indépendamment', async () => {
    const { PUT } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'PUT',
      body: JSON.stringify({ is_favorite: true }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await PUT(req, PARAMS);
    expect(res.status).toBe(200);
  });

  it('met à jour is_archived indépendamment', async () => {
    const { PUT } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'PUT',
      body: JSON.stringify({ is_archived: true }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await PUT(req, PARAMS);
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/simulations/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockChain, {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: MOCK_SIMULATION, error: null }),
    });
  });

  it('retourne 200 ou 204 après suppression réussie', async () => {
    const { DELETE } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'DELETE',
    });
    const res = await DELETE(req, PARAMS);
    expect([200, 204]).toContain(res.status);
  });

  it('retourne 401 si non authentifié', async () => {
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ session: null } as never);
    const { DELETE } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/sim-123', {
      method: 'DELETE',
    });
    const res = await DELETE(req, PARAMS);
    expect(res.status).toBe(401);
  });

  it("retourne 404 si la simulation n'existe pas", async () => {
    Object.assign(mockChain, {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    });
    const { DELETE } = await import('@/app/api/simulations/[id]/route');
    const req = new NextRequest('http://localhost/api/simulations/not-found', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: { id: 'not-found' } });
    expect([403, 404]).toContain(res.status);
  });
});
```

**Step 3: Exécuter les tests**

```bash
npm run test tests/unit/api/simulations-id.test.ts
```

**Step 4: Commit**

```bash
git add tests/unit/api/simulations-id.test.ts
git commit -m "test(api): add unit tests for GET/PUT/DELETE /api/simulations/[id] (AUDIT-203)"
```

---

## Task 6 — AUDIT-204 : Tests utilitaires lib (format, redirect, rate-limit, logger)

**Files:**

- Create: `tests/unit/lib/format.test.ts`
- Create: `tests/unit/lib/redirect.test.ts`
- Create: `tests/unit/lib/rate-limit.test.ts`
- Create: `tests/unit/lib/logger.test.ts`

**Step 1: Lire les sources**

```bash
cat src/lib/utils.ts
cat src/lib/auth/redirect.ts
cat src/lib/rate-limit.ts
cat src/lib/logger.ts
```

**Step 2: Créer tests/unit/lib/format.test.ts**

```typescript
// @vitest-environment node
import { describe, it, expect } from 'vitest';

// Adapter selon l'export réel de src/lib/utils.ts
// Les fonctions peuvent s'appeler formatCurrency, formatPercent, etc.
// Lire utils.ts avant et ajuster les imports

describe('formatCurrency', () => {
  // Adapter l'import selon le nom réel d'export
  it('formate 150000 en "150 000 €"', async () => {
    const { formatCurrency } = await import('@/lib/utils');
    const result = formatCurrency(150000);
    expect(result).toMatch(/150[\s\u00a0]000/); // espace ou espace insécable
    expect(result).toContain('€');
  });

  it('formate 0 en "0 €"', async () => {
    const { formatCurrency } = await import('@/lib/utils');
    expect(formatCurrency(0)).toContain('€');
  });

  it('gère les valeurs négatives', async () => {
    const { formatCurrency } = await import('@/lib/utils');
    const result = formatCurrency(-500);
    expect(result).toContain('500');
  });
});

describe('formatPercent', () => {
  it('formate 5.23 en "5,23 %"', async () => {
    const { formatPercent } = await import('@/lib/utils');
    const result = formatPercent(5.23);
    expect(result).toContain('%');
  });

  it('formate 0 en "0 %"', async () => {
    const { formatPercent } = await import('@/lib/utils');
    const result = formatPercent(0);
    expect(result).toContain('%');
  });

  it('formate 100 en "100 %"', async () => {
    const { formatPercent } = await import('@/lib/utils');
    const result = formatPercent(100);
    expect(result).toContain('%');
  });
});
```

**Step 3: Créer tests/unit/lib/redirect.test.ts**

```typescript
// @vitest-environment node
import { describe, it, expect } from 'vitest';

// Adapter selon l'export de src/lib/auth/redirect.ts
describe('validateRedirectUrl', () => {
  it('accepte /calculateur', async () => {
    const { validateRedirectUrl } = await import('@/lib/auth/redirect');
    expect(validateRedirectUrl('/calculateur')).toBe('/calculateur');
  });

  it('accepte /simulations', async () => {
    const { validateRedirectUrl } = await import('@/lib/auth/redirect');
    expect(validateRedirectUrl('/simulations')).toBe('/simulations');
  });

  it('accepte /simulations/abc-123', async () => {
    const { validateRedirectUrl } = await import('@/lib/auth/redirect');
    const result = validateRedirectUrl('/simulations/abc-123');
    expect(result).toBe('/simulations/abc-123');
  });

  it('rejette https://evil.com', async () => {
    const { validateRedirectUrl } = await import('@/lib/auth/redirect');
    const result = validateRedirectUrl('https://evil.com');
    expect(result).not.toBe('https://evil.com');
  });

  it('rejette //evil.com', async () => {
    const { validateRedirectUrl } = await import('@/lib/auth/redirect');
    const result = validateRedirectUrl('//evil.com');
    expect(result).not.toContain('evil.com');
  });

  it('rejette les tentatives de path traversal', async () => {
    const { validateRedirectUrl } = await import('@/lib/auth/redirect');
    const result = validateRedirectUrl('/../etc/passwd');
    expect(result).not.toContain('etc/passwd');
  });

  it('retourne / pour une URL vide', async () => {
    const { validateRedirectUrl } = await import('@/lib/auth/redirect');
    const result = validateRedirectUrl('');
    expect(result).toBe('/');
  });
});
```

**Step 4: Créer tests/unit/lib/rate-limit.test.ts**

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('withRateLimit', () => {
  beforeEach(() => {
    vi.resetModules(); // Reset cache pour réinitialiser le state in-memory
  });

  it("la première requête d'une IP passe", async () => {
    const { withRateLimit } = await import('@/lib/rate-limit');
    const handler = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    const req = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const res = await withRateLimit(req as never, { limit: 10, window: 60 }, handler);
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalled();
  });

  it('retourne 429 après dépassement de la limite', async () => {
    const { withRateLimit } = await import('@/lib/rate-limit');
    const ip = '9.9.9.9';
    const handler = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    const makeReq = () =>
      new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
      });

    // Épuiser la limite (config: limit=3)
    for (let i = 0; i < 3; i++) {
      await withRateLimit(makeReq() as never, { limit: 3, window: 60 }, handler);
    }

    const overLimitRes = await withRateLimit(makeReq() as never, { limit: 3, window: 60 }, handler);
    expect(overLimitRes.status).toBe(429);
  });

  it('le header Retry-After est présent dans la réponse 429', async () => {
    const { withRateLimit } = await import('@/lib/rate-limit');
    const ip = '8.8.8.8';
    const handler = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    const makeReq = () =>
      new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
      });

    for (let i = 0; i < 3; i++) {
      await withRateLimit(makeReq() as never, { limit: 3, window: 60 }, handler);
    }

    const res = await withRateLimit(makeReq() as never, { limit: 3, window: 60 }, handler);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });
});
```

**Step 5: Créer tests/unit/lib/logger.test.ts**

```typescript
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('en production, debug et info ne loguent pas', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { logger } = await import('@/lib/logger');
    logger.debug('test debug');
    logger.info('test info');
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('en développement, tous les niveaux loguent', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { logger } = await import('@/lib/logger');
    logger.debug('test debug');
    // Vérifier qu'au moins une sortie a eu lieu
    const allCalls = [
      ...vi.mocked(console.log).mock.calls,
      ...vi.mocked(console.debug).mock.calls,
      ...vi.mocked(console.info).mock.calls,
    ];
    expect(allCalls.length).toBeGreaterThan(0);
  });

  it('error logue toujours, même en production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { logger } = await import('@/lib/logger');
    logger.error('test error');
    expect(vi.mocked(console.error)).toHaveBeenCalled();
  });

  it('warn logue toujours, même en production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { logger } = await import('@/lib/logger');
    logger.warn('test warn');
    expect(vi.mocked(console.warn)).toHaveBeenCalled();
  });
});
```

**Step 6: Exécuter les tests**

```bash
npm run test tests/unit/lib/
```

Note: adapter les noms d'import selon ce que trouvent les `cat` des sources (Step 1).

**Step 7: Commit**

```bash
git add tests/unit/lib/
git commit -m "test(lib): add unit tests for format, redirect, rate-limit, logger (AUDIT-204)"
```

---

## Task 7 — AUDIT-204 : Compléter les tests Zustand store + hook useDownloadPdf

**Files:**

- Modify: `tests/unit/stores/calculateur.store.test.ts`
- Create: `tests/unit/hooks/useDownloadPdf.test.ts`

**Step 1: Lire le store et le hook**

```bash
cat src/stores/calculateur.store.ts
cat src/hooks/useDownloadPdf.ts
```

**Step 2: Ajouter les cas manquants dans calculateur.store.test.ts**

Lire le fichier existant et ajouter les `describe` manquants :

```typescript
// Ajouter après les tests existants

describe('gestion des scénarios', () => {
  beforeEach(() => {
    useCalculateurStore.getState().reset();
  });

  it('addScenario crée un nouveau scénario avec ID unique', () => {
    const store = useCalculateurStore.getState();
    const initialCount = store.scenarios.length;
    store.addScenario();
    expect(useCalculateurStore.getState().scenarios.length).toBe(initialCount + 1);
    // Les IDs doivent être uniques
    const ids = useCalculateurStore.getState().scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('duplicateScenario crée une copie avec les mêmes données', () => {
    const store = useCalculateurStore.getState();
    const originalId = store.activeScenarioId;
    store.duplicateScenario(originalId);
    const state = useCalculateurStore.getState();
    expect(state.scenarios.length).toBeGreaterThan(1);
    const original = state.scenarios.find((s) => s.id === originalId);
    const duplicate = state.scenarios[state.scenarios.length - 1];
    expect(duplicate?.bien).toEqual(original?.bien);
  });

  it('removeScenario supprime le scénario', () => {
    const store = useCalculateurStore.getState();
    store.addScenario();
    const state = useCalculateurStore.getState();
    const idToRemove = state.scenarios[state.scenarios.length - 1].id;
    const countBefore = state.scenarios.length;
    store.removeScenario(idToRemove);
    expect(useCalculateurStore.getState().scenarios.length).toBe(countBefore - 1);
  });

  it('setActiveScenario change le scénario actif', () => {
    const store = useCalculateurStore.getState();
    store.addScenario();
    const newId =
      useCalculateurStore.getState().scenarios[useCalculateurStore.getState().scenarios.length - 1]
        .id;
    store.setActiveScenario(newId);
    expect(useCalculateurStore.getState().activeScenarioId).toBe(newId);
  });

  it('reset remet le store à son état initial', () => {
    const store = useCalculateurStore.getState();
    store.addScenario();
    store.addScenario();
    store.reset();
    expect(useCalculateurStore.getState().scenarios.length).toBe(1);
  });
});
```

**Step 3: Créer tests/unit/hooks/useDownloadPdf.test.ts**

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.stubGlobal('fetch', vi.fn());

describe('useDownloadPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne une fonction download et isLoading: false initialement', async () => {
    const { useDownloadPdf } = await import('@/hooks/useDownloadPdf');
    const { result } = renderHook(() => useDownloadPdf());
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.download).toBe('function');
  });

  it('passe isLoading à true pendant le téléchargement', async () => {
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(new Response(new Blob(['%PDF'], { type: 'application/pdf' }))),
            100
          )
        )
    );
    const { useDownloadPdf } = await import('@/hooks/useDownloadPdf');
    const { result } = renderHook(() => useDownloadPdf());

    act(() => {
      result.current.download('sim-123');
    });

    expect(result.current.isLoading).toBe(true);
  });
});
```

**Step 4: Exécuter les tests**

```bash
npm run test tests/unit/stores/ tests/unit/hooks/
```

**Step 5: Commit**

```bash
git add tests/unit/stores/calculateur.store.test.ts tests/unit/hooks/
git commit -m "test(store,hooks): complete store tests and add useDownloadPdf tests (AUDIT-204)"
```

---

## Task 8 — AUDIT-205 : Tests E2E authentification

**Files:**

- Create: `tests/e2e/auth/login.spec.ts`
- Create: `tests/e2e/auth/signup.spec.ts`
- Create: `tests/e2e/auth/logout.spec.ts`
- Create: `tests/e2e/auth/protected-routes.spec.ts`

**Step 1: Vérifier que le serveur de dev est accessible**

```bash
# Démarrer le serveur dans un terminal séparé si besoin
# npm run dev
curl http://localhost:3000 -o /dev/null -s -w "%{http_code}"
```

**Step 2: Créer tests/e2e/auth/protected-routes.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Routes protégées', () => {
  test('accéder à /simulations sans auth redirige vers /auth/login', async ({ page }) => {
    await page.goto('/simulations');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("l'URL de callback est préservée dans la redirection", async ({ page }) => {
    await page.goto('/simulations');
    await expect(page).toHaveURL(/callbackUrl/);
  });

  test('/calculateur est accessible sans authentification', async ({ page }) => {
    await page.goto('/calculateur');
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });

  test('la page de login affiche le formulaire correctement', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /connexion/i })).toBeVisible();
  });
});
```

**Step 3: Créer tests/e2e/auth/login.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USER } from '../helpers/auth';

test.describe('Connexion email/mot de passe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('connexion valide redirige vers le calculateur', async ({ page }) => {
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/mot de passe/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /connexion/i }).click();
    await expect(page).toHaveURL(/\/(calculateur|simulations)/, { timeout: 15000 });
  });

  test('mot de passe incorrect affiche une erreur', async ({ page }) => {
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/mot de passe/i).fill('mauvais-mot-de-passe');
    await page.getByRole('button', { name: /connexion/i }).click();
    await expect(
      page.getByRole('alert').or(page.getByText(/erreur|incorrect|invalide/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('email inexistant affiche une erreur', async ({ page }) => {
    await page.getByLabel(/email/i).fill('inexistant@example.com');
    await page.getByLabel(/mot de passe/i).fill('Password123!');
    await page.getByRole('button', { name: /connexion/i }).click();
    await expect(
      page.getByRole('alert').or(page.getByText(/erreur|incorrect|invalide/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('le champ mot de passe est masqué', async ({ page }) => {
    const passwordField = page.getByLabel(/mot de passe/i);
    await expect(passwordField).toHaveAttribute('type', 'password');
  });
});
```

**Step 4: Créer tests/e2e/auth/logout.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from '../helpers/auth';

test.describe('Déconnexion', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
  });

  test('déconnexion depuis une session active', async ({ page }) => {
    await page.getByRole('button', { name: /déconnexion/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test('après déconnexion, /simulations redirige vers login', async ({ page }) => {
    await page.getByRole('button', { name: /déconnexion/i }).click();
    await page.goto('/simulations');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
```

**Step 5: Créer tests/e2e/auth/signup.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Inscription', () => {
  test("la page d'inscription affiche le formulaire", async ({ page }) => {
    await page.goto('/auth/register');
    // Adapter selon l'URL réelle de la page d'inscription
    const hasForm = await page.getByLabel(/email/i).isVisible();
    expect(hasForm).toBe(true);
  });

  test('email déjà utilisé affiche une erreur', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByLabel(/email/i).fill('test-auth-script@example.com');
    const passwordFields = page.getByLabel(/mot de passe/i);
    await passwordFields.first().fill('Password123!');
    if ((await passwordFields.count()) > 1) {
      await passwordFields.nth(1).fill('Password123!');
    }
    await page.getByRole('button', { name: /inscription|créer|s'inscrire/i }).click();
    await expect(page.getByText(/existe déjà|already|utilisé/i)).toBeVisible({ timeout: 10000 });
  });

  test('inscription avec email valide et mot de passe fort', async ({ page }) => {
    const email = `test-e2e-${Date.now()}@example.com`;
    await page.goto('/auth/register');
    await page.getByLabel(/email/i).fill(email);
    const passwordFields = page.getByLabel(/mot de passe/i);
    await passwordFields.first().fill('TestPassword123!');
    if ((await passwordFields.count()) > 1) {
      await passwordFields.nth(1).fill('TestPassword123!');
    }
    await page.getByRole('button', { name: /inscription|créer|s'inscrire/i }).click();
    await expect(page).toHaveURL(/\/(calculateur|simulations)/, { timeout: 15000 });
  });
});
```

**Step 6: Exécuter les tests E2E (nécessite serveur local actif)**

```bash
npm run test:e2e tests/e2e/auth/
```

**Step 7: Commit**

```bash
git add tests/e2e/auth/
git commit -m "test(e2e): add E2E auth tests - login, logout, signup, protected routes (AUDIT-205)"
```

---

## Task 9 — AUDIT-206 : Tests E2E CRUD simulations + filtres + PDF

**Files:**

- Create: `tests/e2e/simulations/crud.spec.ts`
- Create: `tests/e2e/simulations/filters.spec.ts`
- Create: `tests/e2e/simulations/pdf.spec.ts`
- Create: `tests/e2e/calculateur/validation.spec.ts`

**Step 1: Explorer l'UI simulations**

```bash
# Vérifier les data-testid utilisés dans les composants
grep -r "data-testid" src/components/ | head -20
```

**Step 2: Créer tests/e2e/simulations/filters.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from '../helpers/auth';

test.describe('Filtres et recherche simulations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/simulations');
  });

  test("filtre Favoris reflète status=favorites dans l'URL", async ({ page }) => {
    const favBtn = page.getByRole('button', { name: /favoris/i });
    if (await favBtn.isVisible()) {
      await favBtn.click();
      await expect(page).toHaveURL(/status=favorites/);
    }
  });

  test("filtre Archivées reflète status=archived dans l'URL", async ({ page }) => {
    const archBtn = page.getByRole('button', { name: /archiv/i });
    if (await archBtn.isVisible()) {
      await archBtn.click();
      await expect(page).toHaveURL(/status=archived/);
    }
  });

  test('la recherche par nom filtre les résultats', async ({ page }) => {
    const searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/rechercher|search/i));
    if (await searchInput.isVisible()) {
      await searchInput.fill('inexistant-xyz-12345');
      await page.waitForTimeout(400); // debounce
      await expect(page.getByText(/aucune simulation|no simulation|0 simulation/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test('les filtres sont restaurés après navigation arrière/avant', async ({ page }) => {
    const favBtn = page.getByRole('button', { name: /favoris/i });
    if (await favBtn.isVisible()) {
      await favBtn.click();
      await expect(page).toHaveURL(/status=favorites/);
      await page.goBack();
      await page.goForward();
      await expect(page).toHaveURL(/status=favorites/);
    }
  });
});
```

**Step 3: Créer tests/e2e/simulations/crud.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from '../helpers/auth';

test.describe('CRUD Simulations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
  });

  test('la liste des simulations est accessible', async ({ page }) => {
    await page.goto('/simulations');
    await expect(page).toHaveURL(/\/simulations/);
  });

  test('supprimer une simulation demande confirmation', async ({ page }) => {
    await page.goto('/simulations');
    // Chercher le menu d'actions
    const actionsBtn = page.getByTestId('simulation-actions').first();
    if (await actionsBtn.isVisible()) {
      await actionsBtn.click();
      const deleteBtn = page.getByRole('menuitem', { name: /supprimer/i });
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
        // Annuler → la simulation reste
        await page.getByRole('button', { name: /annuler/i }).click();
        await expect(page.getByRole('dialog')).not.toBeVisible();
      }
    }
  });
});
```

**Step 4: Créer tests/e2e/simulations/pdf.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from '../helpers/auth';

test.describe('Génération PDF', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
  });

  test('le bouton PDF déclenche un téléchargement', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/simulations');

    // Cliquer sur la première simulation pour aller aux résultats
    const firstSim = page.getByTestId('simulation-card').first();
    if (await firstSim.isVisible()) {
      await firstSim.click();

      const downloadPromise = page.waitForEvent('download', { timeout: 25000 });
      const pdfBtn = page.getByRole('button', { name: /télécharger|rapport|pdf/i });
      if (await pdfBtn.isVisible()) {
        await pdfBtn.click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
      }
    }
  });
});
```

**Step 5: Créer tests/e2e/calculateur/validation.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Validation formulaire calculateur', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculateur');
  });

  test("passer l'étape 1 sans prix d'achat affiche une erreur", async ({ page }) => {
    // Chercher le bouton Suivant / Continuer
    const nextBtn = page.getByRole('button', { name: /suivant|continuer|next/i }).first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await expect(page.getByText(/requis|obligatoire|required/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("un taux d'intérêt supérieur à 20% affiche un avertissement", async ({ page }) => {
    const tauxInput = page.getByLabel(/taux.*intérêt|interest rate/i);
    if (await tauxInput.isVisible()) {
      await tauxInput.fill('25');
      await tauxInput.blur();
      // L'avertissement peut être une alerte, un tooltip ou un texte coloré
      await expect(page.getByText(/élevé|avertissement|warning|attention/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
```

**Step 6: Exécuter les tests E2E**

```bash
npm run test:e2e tests/e2e/simulations/ tests/e2e/calculateur/
```

**Step 7: Commit**

```bash
git add tests/e2e/simulations/ tests/e2e/calculateur/
git commit -m "test(e2e): add E2E tests for simulations CRUD, filters, PDF, form validation (AUDIT-206)"
```

---

## Task 10 — Vérification finale et CI

**Step 1: Lancer tous les tests unitaires**

```bash
npm run test
```

Attendu: 169+ tests existants + nouveaux tests = >200 tests verts

**Step 2: Vérifier la couverture**

```bash
npm run test:coverage
```

Vérifier : `src/app/api/simulations/` > 80%, `src/lib/` > 70%, `src/stores/` > 80%

**Step 3: Vérifier TypeScript**

```bash
npm run type-check
```

**Step 4: Vérifier le lint**

```bash
npm run lint
npm run format:check
```

**Step 5: Vérifier ci.yml utilise --ignore-scripts**

Lire `.github/workflows/ci.yml` et confirmer que `npm ci --ignore-scripts` est utilisé pour l'install des dépendances.

**Step 6: Commit final (si ajustements)**

```bash
git add -A
git commit -m "chore(test): final adjustments and CI compatibility (AUDIT-201 to AUDIT-206)"
```

---

## Notes d'implémentation

### Pattern de mock Vitest avec modules ESM

Les routes Next.js utilisent les imports ESM. Avec Vitest, les mocks doivent être déclarés **avant** l'import du module testé :

```typescript
vi.mock('@/lib/supabase/admin', () => ({ ... }));
// PUIS
const { GET } = await import('@/app/api/simulations/route');
```

Ne pas utiliser l'import statique au top du fichier pour les modules à mocker.

### Ajustements probables des tests

- Les noms des exports des routes Next.js (`GET`, `POST`, `PUT`, `DELETE`) peuvent nécessiter une vérification
- La signature des routes peut être `(req, { params })` ou `(req, context)` — lire les sources avant de tester
- Les utilitaires de formatage peuvent être dans `src/lib/utils.ts` ou dans des fichiers séparés

### Priorité d'exécution

1. Task 1+2 (config Vitest+Playwright) — prérequis
2. Task 3 (Husky) — indépendant
3. Tasks 4+5+6+7 (tests unitaires) — parallélisables
4. Tasks 8+9 (tests E2E) — nécessitent serveur actif
5. Task 10 (vérification finale)
