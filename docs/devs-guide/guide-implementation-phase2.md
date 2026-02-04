# Guide d'Implementation - Phase 2 (TECH-010 to TECH-023)

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : Winston (Architecte)
> **Scope** : Stories TECH-010 a TECH-023

---

## Vue d'Ensemble

Ce guide fournit les recommandations architecturales et techniques pour l'implementation des stories de la Phase 2. Les stories sont regroupees en 5 domaines :

| Domaine | Stories | Priorite |
|---------|---------|----------|
| Dette Technique TypeScript | TECH-010, TECH-011 | P3 |
| Performance/QA | TECH-012 | P4 |
| Generation PDF | TECH-013 a TECH-016 | P2 |
| Integration Supabase | TECH-017 a TECH-021 | P2 |
| Tests | TECH-022, TECH-023 | P3 |

---

## 1. Ordre d'Implementation Recommande

### Sprint 1 - Fondations

```
TECH-010 ──┐
TECH-011 ──┼── Parallelisables (dette technique)
TECH-012 ──┘

TECH-013 (Setup PDF) ─── prerequis pour ───> TECH-014, 015, 016

TECH-017 (Setup Supabase) ─── prerequis pour ───> TECH-018, 019, 020, 021
```

### Sprint 2 - Fonctionnalites

```
TECH-014 (Template PDF) ───> TECH-015 (Route API) ───> TECH-016 (UI)

TECH-018 (Schema BDD) ───> TECH-019 (Client) ───> TECH-020 (API CRUD) ───> TECH-021 (UI)

TECH-022 (Coverage) ───> TECH-023 (E2E)
```

### Diagramme de Dependances

```
                    ┌─────────────┐
                    │  TECH-010   │  (any types)
                    │  TECH-011   │  (ESLint)
                    │  TECH-012   │  (Benchmark)
                    └─────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
    ┌───────────────┐             ┌───────────────┐
    │   TECH-013    │             │   TECH-017    │
    │  Setup PDF    │             │Setup Supabase │
    └───────┬───────┘             └───────┬───────┘
            │                             │
            ▼                             ▼
    ┌───────────────┐             ┌───────────────┐
    │   TECH-014    │             │   TECH-018    │
    │  Template PDF │             │  Schema BDD   │
    └───────┬───────┘             └───────┬───────┘
            │                             │
            ▼                             ▼
    ┌───────────────┐             ┌───────────────┐
    │   TECH-015    │             │   TECH-019    │
    │  Route /api   │             │ Client Supa.  │
    └───────┬───────┘             └───────┬───────┘
            │                             │
            ▼                             ▼
    ┌───────────────┐             ┌───────────────┐
    │   TECH-016    │             │   TECH-020    │
    │   UI Button   │             │  API CRUD     │
    └───────────────┘             └───────┬───────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │   TECH-021    │
                                  │   UI Liste    │
                                  └───────────────┘
                                          │
            ┌─────────────────────────────┘
            ▼
    ┌───────────────┐             ┌───────────────┐
    │   TECH-022    │ ──────────> │   TECH-023    │
    │   Coverage    │             │   Tests E2E   │
    └───────────────┘             └───────────────┘
```

---

## 2. Dette Technique (TECH-010, TECH-011)

### TECH-010 : Elimination des types `any`

**Fichiers concernes :**

| Fichier | Correction |
|---------|------------|
| `src/server/calculations/fiscalite.test.ts:47` | `Partial<RentabiliteResultat>` |
| `src/components/results/CashflowChart.tsx:18,50` | Interface `CashflowDataPoint` |
| `src/components/results/PatrimoineChart.tsx:17,59` | Interface `PatrimoineDataPoint` |
| `src/components/forms/StepAssocies.tsx:77` | Type `AssocieData` |
| `src/components/forms/StepOptions.tsx:56` | Type du formulaire |

**Patterns recommandes :**

```typescript
// AVANT (mauvais)
const data: any[] = [];
formatter={(value: any) => formatCurrency(value)}

// APRES (correct)
interface CashflowDataPoint {
  annee: number;
  cashflow: number;
  cashflowCumule: number;
}
const data: CashflowDataPoint[] = [];
formatter={(value: number) => formatCurrency(value)}
```

**Pour les formatters Recharts :**
```typescript
import type { TooltipProps } from 'recharts';

// Generic pour formatter
const valueFormatter = (value: number | string | Array<number | string>) => {
  if (typeof value === 'number') {
    return formatCurrency(value);
  }
  return String(value);
};
```

### TECH-011 : Warning ESLint useEffect

**Solution recommandee : Option A** (ajouter la dependance)

```typescript
// src/components/forms/StepAssocies.tsx

// AVANT
useEffect(() => {
  // logique utilisant structure.associes
}, []); // Warning: missing dependency

// APRES
const associesRef = useRef(structure.associes);

useEffect(() => {
  // Comparer les refs pour eviter les boucles infinies
  if (JSON.stringify(associesRef.current) !== JSON.stringify(structure.associes)) {
    associesRef.current = structure.associes;
    // logique
  }
}, [structure.associes]);
```

**Alternative avec useMemo :**
```typescript
const associesCount = useMemo(() =>
  structure.associes.reduce((acc, a) => acc + a.parts, 0),
  [structure.associes]
);
```

---

## 3. Generation PDF (TECH-013 a TECH-016)

### Architecture

```
src/lib/pdf/
├── index.ts              # Exports
├── styles.ts             # StyleSheet centralise
├── components/           # Composants PDF reutilisables
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Table.tsx
│   ├── ScoreGauge.tsx
│   └── KeyMetrics.tsx
└── templates/
    └── RapportSimulation.tsx  # Template principal
```

### TECH-013 : Setup react-pdf

**Installation :**
```bash
npm install @react-pdf/renderer
```

**Configuration Next.js** (`next.config.js`) :
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  // Webpack config pour canvas (si necessaire)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
```

**Point d'attention :** `@react-pdf/renderer` ne fonctionne PAS dans les Client Components. Utiliser exclusivement cote serveur (Route Handlers, Server Components).

### TECH-014 : Structure du Template

```typescript
// src/lib/pdf/templates/RapportSimulation.tsx
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

interface RapportProps {
  formData: CalculateurFormData;
  resultats: CalculResultats;
  generatedAt?: Date;
}

export function RapportSimulation({ formData, resultats, generatedAt = new Date() }: RapportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Header date={generatedAt} />

        {/* Synthese - Page 1 */}
        <View style={styles.section}>
          <ScoreGauge score={resultats.synthese.score_global} />
          <KeyMetrics
            rentaBrute={resultats.rentabilite.brute}
            cashflow={resultats.cashflow.mensuel}
            tauxHCSF={resultats.hcsf.taux_endettement}
          />
        </View>

        {/* Footer */}
        <Footer pageNumber={1} totalPages={4} />
      </Page>

      {/* Pages 2, 3, 4... */}
    </Document>
  );
}
```

### TECH-015 : Route API /api/pdf

**Structure :**
```typescript
// src/app/api/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { RapportSimulation } from '@/lib/pdf/templates/RapportSimulation';
import { z } from 'zod';

const PdfRequestSchema = z.object({
  formData: z.object({/* validation CalculateurFormData */}),
  resultats: z.object({/* validation CalculResultats */}),
  options: z.object({
    includeGraphs: z.boolean().default(true),
    language: z.enum(['fr', 'en']).default('fr'),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = PdfRequestSchema.parse(body);

    const pdfBuffer = await renderToBuffer(
      <RapportSimulation
        formData={validated.formData}
        resultats={validated.resultats}
      />
    );

    const filename = `simulation-renta-immo-${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.message } },
        { status: 400 }
      );
    }
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'PDF_GENERATION_ERROR', message: 'Erreur lors de la generation du PDF' } },
      { status: 500 }
    );
  }
}
```

### TECH-016 : Hook et Composant UI

```typescript
// src/hooks/useDownloadPdf.ts
import { useState, useCallback } from 'react';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

type PdfStatus = 'idle' | 'loading' | 'success' | 'error';

export function useDownloadPdf() {
  const [status, setStatus] = useState<PdfStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = useCallback(async (
    formData: CalculateurFormData,
    resultats: CalculResultats
  ) => {
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, resultats }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur generation PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulation-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('success');
      // Reset to idle after 2s
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { downloadPdf, status, error, reset };
}
```

---

## 4. Integration Supabase (TECH-017 a TECH-021)

### Architecture

```
src/lib/supabase/
├── index.ts          # Barrel exports
├── client.ts         # Client browser (createBrowserClient)
├── server.ts         # Client server (createServerClient)
└── middleware.ts     # Client middleware (optionnel)

src/types/
└── database.ts       # Types generes/definis pour Supabase

src/app/api/simulations/
├── route.ts          # GET (liste) + POST (create)
└── [id]/
    └── route.ts      # GET, PATCH, DELETE

src/hooks/
├── useSupabase.ts    # Hook client browser
├── useSimulations.ts # Liste simulations (React Query)
├── useSimulation.ts  # Detail simulation
└── useSimulationMutations.ts # CRUD mutations
```

### TECH-017 : Setup Supabase

**Installation :**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Variables d'environnement** (`.env.local`) :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Point critique de securite :** Ne JAMAIS exposer `SUPABASE_SERVICE_ROLE_KEY` cote client. Cette cle bypass toutes les politiques RLS.

### TECH-018 : Schema BDD

**Recommandations architecturales :**

1. **JSONB pour flexibilite** : Stocker `form_data` et `resultats` en JSONB permet l'evolution du schema sans migrations destructives.

2. **Colonnes denormalisees** : Les indicateurs cles (`rentabilite_brute`, `score_global`, etc.) sont denormalises pour permettre le tri/filtrage sans parser le JSON.

3. **RLS obligatoire** : Row Level Security est CRITIQUE. Sans RLS, un utilisateur pourrait acceder aux simulations d'autres utilisateurs.

**Script de migration :**
```sql
-- supabase/migrations/20260204_create_simulations.sql

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table simulations
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'Simulation sans titre',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  form_data JSONB NOT NULL,
  resultats JSONB NOT NULL,
  rentabilite_brute DECIMAL(5,2),
  rentabilite_nette DECIMAL(5,2),
  cashflow_mensuel DECIMAL(10,2),
  score_global INTEGER CHECK (score_global >= 0 AND score_global <= 100),
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Index
CREATE INDEX idx_simulations_user_id ON public.simulations(user_id);
CREATE INDEX idx_simulations_created ON public.simulations(created_at DESC);
CREATE INDEX idx_simulations_favorites ON public.simulations(user_id, is_favorite)
  WHERE is_favorite = TRUE;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER simulations_updated_at
  BEFORE UPDATE ON public.simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations"
  ON public.simulations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON public.simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON public.simulations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON public.simulations FOR DELETE
  USING (auth.uid() = user_id);
```

### TECH-019 : Clients Supabase

**Client Browser :**
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
```

**Client Server :**
```typescript
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Handle Server Component context
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Handle Server Component context
          }
        },
      },
    }
  );
}
```

### TECH-020 : API CRUD

**Pattern pour les Route Handlers :**

```typescript
// src/app/api/simulations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema validation
const CreateSimulationSchema = z.object({
  name: z.string().max(255).optional(),
  description: z.string().optional(),
  form_data: z.object({}).passthrough(), // Validation souple pour JSONB
  resultats: z.object({}).passthrough(),
});

// GET /api/simulations
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Verifier authentification
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Non authentifie' } },
      { status: 401 }
    );
  }

  // Query params
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');
  const sortBy = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') === 'asc';
  const favoriteOnly = searchParams.get('favorite') === 'true';
  const includeArchived = searchParams.get('archived') === 'true';

  // Build query
  let query = supabase
    .from('simulations')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order(sortBy, { ascending: order })
    .range(offset, offset + limit - 1);

  if (favoriteOnly) {
    query = query.eq('is_favorite', true);
  }
  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
    meta: { total: count, limit, offset },
  });
}

// POST /api/simulations
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validated = CreateSimulationSchema.parse(body);

    // Extraire indicateurs pour denormalisation
    const resultats = validated.resultats as { rentabilite?: { brute?: number; nette?: number }; cashflow?: { mensuel?: number }; synthese?: { score_global?: number } };

    const { data, error } = await supabase
      .from('simulations')
      .insert({
        user_id: user.id,
        name: validated.name || 'Simulation sans titre',
        description: validated.description,
        form_data: validated.form_data,
        resultats: validated.resultats,
        rentabilite_brute: resultats.rentabilite?.brute,
        rentabilite_nette: resultats.rentabilite?.nette,
        cashflow_mensuel: resultats.cashflow?.mensuel,
        score_global: resultats.synthese?.score_global,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
```

### TECH-021 : Hooks React Query

```typescript
// src/hooks/useSimulations.ts
import { useQuery } from '@tanstack/react-query';

interface QueryOptions {
  limit?: number;
  offset?: number;
  sort?: 'created_at' | 'updated_at' | 'score_global';
  order?: 'asc' | 'desc';
  favorite?: boolean;
  archived?: boolean;
}

export function useSimulations(options: QueryOptions = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  if (options.offset) params.set('offset', String(options.offset));
  if (options.sort) params.set('sort', options.sort);
  if (options.order) params.set('order', options.order);
  if (options.favorite) params.set('favorite', 'true');
  if (options.archived) params.set('archived', 'true');

  return useQuery({
    queryKey: ['simulations', options],
    queryFn: async () => {
      const res = await fetch(`/api/simulations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch simulations');
      return res.json();
    },
  });
}
```

---

## 5. Tests (TECH-022, TECH-023)

### TECH-022 : Configuration Coverage

**Installation :**
```bash
npm install -D @vitest/coverage-v8
```

**Configuration Vitest :**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.d.ts',
        'src/types/**',
      ],
      thresholds: {
        // Objectif 80% pour les modules calculs
        'src/server/calculations/**': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
```

**Script npm :**
```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage"
  }
}
```

### TECH-023 : Tests E2E Playwright

**Installation :**
```bash
npm init playwright@latest
```

**Configuration :**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Structure des tests :**
```typescript
// e2e/tests/simulation-complete.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Simulation complete', () => {
  test('parcours nom propre location nue', async ({ page }) => {
    await page.goto('/');

    // Step 1: Bien
    await page.fill('[data-testid="prix-achat"]', '150000');
    await page.selectOption('[data-testid="type-bien"]', 'appartement');
    await page.click('[data-testid="next-step"]');

    // Step 2: Financement
    await page.fill('[data-testid="apport"]', '30000');
    await page.fill('[data-testid="duree"]', '20');
    await page.click('[data-testid="next-step"]');

    // ... autres steps

    // Verification resultats
    await expect(page.locator('[data-testid="score-global"]')).toBeVisible();
    await expect(page.locator('[data-testid="rentabilite-brute"]')).toContainText('%');
  });
});
```

---

## 6. Points d'Attention Critiques

### Securite

1. **RLS Supabase** : Toujours verifier que les politiques RLS sont actives avant de deployer. Tester avec differents utilisateurs.

2. **Service Role Key** : Ne JAMAIS utiliser cote client. Uniquement dans les Server Components / Route Handlers si absolument necessaire.

3. **Validation Zod** : Toujours valider les entrees utilisateur, meme avec TypeScript.

### Performance

1. **PDF Generation** : `renderToBuffer` est synchrone et bloquant. Pour les gros documents, envisager un worker ou un service dedie.

2. **React Query** : Utiliser `staleTime` et `gcTime` pour eviter les requetes inutiles.

3. **Pagination** : Toujours paginer les listes (simulations, etc.). Maximum 100 items par requete.

### Maintenabilite

1. **Types partages** : Les types `CalculateurFormData` et `CalculResultats` sont la source de verite. Ne pas creer de doublons.

2. **Barrel exports** : Utiliser `index.ts` pour les exports propres (`@/lib/pdf`, `@/lib/supabase`).

3. **Conventions de nommage** :
   - Components : PascalCase (`DownloadPdfButton.tsx`)
   - Hooks : camelCase avec prefix `use` (`useDownloadPdf.ts`)
   - Utils : camelCase (`formatCurrency.ts`)

---

## 7. Checklist Pre-Implementation

Avant de commencer chaque story :

- [ ] Lire la story complete et ses criteres d'acceptation
- [ ] Verifier les dependances (stories bloquantes)
- [ ] Creer la branche git (`feat/tech-xxx-description`)
- [ ] Verifier les types existants dans `src/types/`
- [ ] Consulter ce guide pour les patterns recommandes

Apres implementation :

- [ ] `npm run type-check` passe
- [ ] `npm run lint` passe sans warning
- [ ] `npm run test` passe
- [ ] Tests unitaires ajoutes si applicable
- [ ] PR creee avec description des changements
- [ ] Mise à jour de la documentation si necessaire

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Creation initiale | Winston (Architecte) |
