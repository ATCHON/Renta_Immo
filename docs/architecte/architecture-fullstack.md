# Architecture Fullstack - Renta_Immo

> **Version** : 3.0
> **Date** : 2026-02-04
> **Auteur** : Winston (Architecte)
> **Statut** : Phase 2 - PDF + Supabase

---

## 1. Introduction

Ce document formalise l'architecture fullstack complete pour **Renta_Immo**, un simulateur de rentabilite immobiliere. Il couvre l'ensemble des couches : frontend Next.js, backend de calcul, persistance Supabase, et generation PDF.

### 1.1 Objectifs Architecturaux

| Objectif | Description |
|----------|-------------|
| **Autonomie** | Zero dependance externe (n8n supprime) |
| **Performance** | Calculs < 500ms, PDF < 2s |
| **Type-safety** | TypeScript strict, types partages |
| **Scalabilite** | Architecture modulaire, ready pour V1 |
| **DX** | Developer experience optimisee |

### 1.2 Documents de Reference

| Document | Chemin |
|----------|--------|
| PRD | [docs/prd.md](./prd.md) |
| Architecture Backend (historique) | [docs/architecture.md](./architecture.md) |
| Guide Implementation Phase 2 | [docs/devs-guide/guide-implementation-phase2.md](./devs-guide/guide-implementation-phase2.md) |

### 1.3 Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-25 | 1.0 | Creation initiale (backend) | Winston |
| 2026-01-29 | 2.0 | Ajout Projections/TRI | Winston |
| 2026-02-04 | 3.0 | Architecture Fullstack complete | Winston |

---

## 2. Vue d'Ensemble Technique

### 2.1 Resume Technique

Renta_Immo est une application **monolithique modulaire** deployee sur Vercel, combinant un frontend Next.js 14 (App Router) avec un backend de calcul integre via API Routes. La persistance est assuree par Supabase (PostgreSQL) et la generation de rapports par @react-pdf/renderer cote serveur.

L'architecture suit le pattern **Jamstack moderne** avec :
- Pre-rendu statique pour les pages publiques
- API Routes serverless pour les calculs
- Client-side state management (Zustand)
- BaaS (Supabase) pour la persistance et l'authentification future

### 2.2 Plateforme et Infrastructure

**Plateforme** : Vercel + Supabase

| Service | Fournisseur | Usage |
|---------|-------------|-------|
| Hosting Frontend | Vercel | SSG/SSR, Edge Network |
| API Routes | Vercel Serverless | Calculs, PDF |
| Base de donnees | Supabase (PostgreSQL) | Simulations |
| Authentification | Supabase Auth | V1 (comptes utilisateurs) |
| Stockage | Supabase Storage | PDFs (optionnel) |

**Regions** : Auto (Vercel Edge) + EU-West (Supabase)

### 2.3 Diagramme d'Architecture

```
                    ┌─────────────────────────────────────────────────────┐
                    │                    UTILISATEUR                       │
                    └────────────────────────┬────────────────────────────┘
                                             │
                    ┌────────────────────────▼────────────────────────────┐
                    │              VERCEL EDGE NETWORK                     │
                    │         (CDN, SSL, Auto-scaling)                     │
                    └────────────────────────┬────────────────────────────┘
                                             │
         ┌───────────────────────────────────┼───────────────────────────────────┐
         │                                   │                                   │
         ▼                                   ▼                                   ▼
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│   PAGES STATIQUES   │          │   API ROUTES        │          │   SUPABASE          │
│   (Next.js SSG)     │          │   (Serverless)      │          │   (PostgreSQL)      │
│                     │          │                     │          │                     │
│ • / (landing)       │          │ • POST /calculate   │◄────────►│ • simulations       │
│ • /simulateur       │          │ • POST /api/pdf     │          │ • users (V1)        │
│ • /resultats        │          │ • GET/POST /api/    │          │ • RLS policies      │
│                     │          │   simulations       │          │                     │
└─────────────────────┘          └──────────┬──────────┘          └─────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │           MOTEUR DE CALCUL                    │
                    │           (src/server/calculations/)          │
                    │                                               │
                    │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
                    │  │validate │►│rentabil.│►│fiscalite│         │
                    │  └─────────┘ └─────────┘ └─────────┘         │
                    │       │           │           │               │
                    │       ▼           ▼           ▼               │
                    │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
                    │  │  hcsf   │►│synthese │►│project. │         │
                    │  └─────────┘ └─────────┘ └─────────┘         │
                    └───────────────────────────────────────────────┘
```

### 2.4 Patterns Architecturaux

| Pattern | Implementation | Rationale |
|---------|----------------|-----------|
| **Monolith Modulaire** | Next.js App Router + src/server/ | Simplicite, partage types, deploy unifie |
| **Component-Based UI** | React + TypeScript strict | Reutilisabilite, maintainabilite |
| **Colocation** | Tests, types, composants ensemble | DX, navigation facile |
| **Repository Pattern** | src/lib/supabase/ abstrait l'acces BDD | Testabilite, migration future |
| **BFF (Backend for Frontend)** | API Routes adaptees au frontend | Optimisation payloads |

---

## 3. Stack Technique

### 3.1 Tableau Definitif

| Categorie | Technologie | Version | Purpose | Rationale |
|-----------|-------------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.7.3 | Type-safety | Strict mode, coherence fullstack |
| **Frontend Framework** | Next.js | 14.2.21 | SSG/SSR, API Routes | App Router, Vercel optimise |
| **UI Component Library** | Custom + Tailwind | - | Design system | Flexibilite, performance |
| **State Management** | Zustand | 5.0.10 | Client state | Simple, persist middleware |
| **Data Fetching** | React Query | 5.90.19 | Server state | Cache, optimistic updates |
| **Backend Language** | TypeScript | 5.7.3 | Type-safety | Types partages avec frontend |
| **Backend Framework** | Next.js API Routes | 14.2.21 | Serverless API | Zero config, Vercel natif |
| **API Style** | REST | - | Simplicite | Standard, bien compris |
| **Database** | PostgreSQL | 15+ | Relational data | Via Supabase, robuste |
| **Cache** | React Query | 5.90.19 | Client-side | Stale-while-revalidate |
| **File Storage** | Supabase Storage | - | PDFs (optionnel) | Integre |
| **Authentication** | Supabase Auth | - | V1 | OAuth ready, RLS integre |
| **Validation** | Zod | 4.3.5 | Schema validation | Runtime + types |
| **Forms** | React Hook Form | 7.71.1 | Form management | Performance, UX |
| **Charts** | Recharts | 3.7.0 | Data visualization | React natif |
| **PDF Generation** | @react-pdf/renderer | 3.x | Server-side PDF | Serverless compatible |
| **Frontend Testing** | Vitest | 4.x | Unit tests | Rapide, TS natif |
| **E2E Testing** | Playwright | 1.x | End-to-end | Multi-browser, fiable |
| **CSS Framework** | Tailwind CSS | 3.4.17 | Utility-first | Rapid prototyping |
| **Build Tool** | Next.js | 14.2.21 | Bundling | Integre |
| **CI/CD** | Vercel | - | Deploy | Git-based, previews |
| **Monitoring** | Vercel Analytics | - | Performance | Integre |

---

## 4. Data Models

### 4.1 Core Entities

#### CalculateurFormData

**Purpose** : Donnees d'entree d'une simulation immobiliere

```typescript
// src/types/calculateur.ts

export interface CalculateurFormData {
  bien: BienData;
  financement: FinancementData;
  exploitation: ExploitationData;
  structure: StructureData;
  options: OptionsData;
}

export interface BienData {
  adresse: string;
  prix_achat: number;
  surface?: number;
  type_bien: 'appartement' | 'maison' | 'immeuble';
  etat_bien: 'ancien' | 'neuf';
  montant_travaux: number;
  valeur_mobilier: number;
}

export interface FinancementData {
  apport: number;
  taux_interet: number;
  duree_emprunt: number;
  assurance_pret: number;
  frais_dossier: number;
  frais_garantie: number;
}

export interface ExploitationData {
  loyer_mensuel: number;
  charges_copro: number;
  taxe_fonciere: number;
  assurance_pno: number;
  gestion_locative: number;
  provision_travaux: number;
  provision_vacance: number;
  type_location: 'nue' | 'meublee_longue_duree' | 'meublee_tourisme_classe' | 'meublee_tourisme_non_classe';
  charges_copro_recuperables: number;
  assurance_gli: number;
  cfe_estimee: number;
  comptable_annuel: number;
}

export interface StructureData {
  type: 'nom_propre' | 'sci_is';
  tmi: number;
  regime_fiscal?: 'micro_foncier' | 'reel' | 'lmnp_micro' | 'lmnp_reel';
  associes: AssocieData[];
  credits_immobiliers?: number;
  loyers_actuels?: number;
  revenus_activite?: number;
  distribution_dividendes?: boolean;
  autres_charges?: number;
}
```

#### CalculResultats

**Purpose** : Resultats complets d'une simulation

```typescript
export interface CalculResultats {
  rentabilite: RentabiliteResultat;
  cashflow: CashflowResultat;
  financement: FinancementResultat;
  fiscalite: FiscaliteResultat;
  hcsf: HCSFResultat;
  synthese: SyntheseResultat;
  projections?: ProjectionData;
  tableauAmortissement?: TableauAmortissement;
  comparaisonFiscalite?: FiscaliteComparaison;
}
```

#### Simulation (Database)

**Purpose** : Simulation persistee en base

```typescript
// src/types/database.ts

export interface Simulation {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  form_data: CalculateurFormData;
  resultats: CalculResultats;
  rentabilite_brute: number | null;
  rentabilite_nette: number | null;
  cashflow_mensuel: number | null;
  score_global: number | null;
  is_favorite: boolean;
  is_archived: boolean;
}
```

---

## 5. API Specification

### 5.1 Endpoints

| Methode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/calculate` | Executer une simulation | Non |
| POST | `/api/pdf` | Generer un rapport PDF | Non |
| GET | `/api/simulations` | Lister les simulations | Oui |
| GET | `/api/simulations/[id]` | Detail d'une simulation | Oui |
| POST | `/api/simulations` | Creer une simulation | Oui |
| PATCH | `/api/simulations/[id]` | Modifier une simulation | Oui |
| DELETE | `/api/simulations/[id]` | Supprimer une simulation | Oui |

### 5.2 POST /api/calculate

**Request:**
```typescript
{
  bien: BienData;
  financement: FinancementData;
  exploitation: ExploitationData;
  structure: StructureData;
  options: OptionsData;
}
```

**Response (200):**
```typescript
{
  success: true;
  resultats: CalculResultats;
  timestamp: string;
  alertes: string[];
}
```

**Response (400):**
```typescript
{
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    field?: string;
    details?: Record<string, unknown>;
  };
}
```

### 5.3 POST /api/pdf

**Request:**
```typescript
{
  formData: CalculateurFormData;
  resultats: CalculResultats;
  options?: {
    includeGraphs?: boolean;
    language?: 'fr' | 'en';
  };
}
```

**Response (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="simulation-2026-02-04.pdf"

<binary PDF data>
```

---

## 6. Frontend Architecture

### 6.1 Component Organization

```
src/
├── components/
│   ├── ui/                    # Primitives (Button, Input, Card, etc.)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   ├── forms/                 # Composants de formulaire
│   │   ├── StepBien.tsx
│   │   ├── StepFinancement.tsx
│   │   ├── StepExploitation.tsx
│   │   ├── StepStructure.tsx
│   │   ├── StepAssocies.tsx
│   │   ├── StepOptions.tsx
│   │   └── index.ts
│   ├── results/               # Composants de resultats
│   │   ├── ScoreGauge.tsx
│   │   ├── KeyMetrics.tsx
│   │   ├── CashflowChart.tsx
│   │   ├── PatrimoineChart.tsx
│   │   ├── FiscalComparator.tsx
│   │   └── index.ts
│   ├── simulations/           # Composants de gestion simulations
│   │   ├── SaveSimulationButton.tsx
│   │   ├── SaveSimulationModal.tsx
│   │   ├── SimulationsList.tsx
│   │   ├── SimulationCard.tsx
│   │   └── index.ts
│   └── providers/
│       └── QueryProvider.tsx
```

### 6.2 Component Template

```typescript
// Pattern standard pour un composant

import { type FC } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  // props specifiques
}

export const Component: FC<ComponentProps> = ({ className, ...props }) => {
  return (
    <div className={cn('base-styles', className)}>
      {/* content */}
    </div>
  );
};
```

### 6.3 State Management

**Structure Zustand :**

```typescript
// src/stores/calculateur.store.ts

interface CalculateurState {
  // Scenarios multiples
  scenarios: Scenario[];
  activeScenarioId: string | null;

  // Actions
  createScenario: () => string;
  duplicateScenario: (id: string) => string;
  deleteScenario: (id: string) => void;
  setActiveScenario: (id: string) => void;

  // Updates par section
  updateBien: (id: string, data: Partial<BienData>) => void;
  updateFinancement: (id: string, data: Partial<FinancementData>) => void;
  // ...

  // Resultats
  setResultats: (id: string, resultats: CalculResultats) => void;
  setStatus: (id: string, status: FormStatus) => void;
}
```

**Patterns :**
- Persist middleware pour localStorage
- Selectors pour performance
- Actions atomiques

### 6.4 Routing

```
src/app/
├── page.tsx                   # Landing / Formulaire
├── resultats/
│   └── page.tsx               # Resultats simulation
├── simulations/
│   ├── page.tsx               # Liste simulations
│   └── [id]/
│       └── page.tsx           # Detail simulation
├── api/
│   ├── calculate/
│   │   └── route.ts
│   ├── pdf/
│   │   └── route.ts
│   └── simulations/
│       ├── route.ts
│       └── [id]/
│           └── route.ts
└── layout.tsx
```

### 6.5 API Client

```typescript
// src/lib/api.ts

const API_BASE = '/api';

export async function calculate(formData: CalculateurFormData): Promise<ApiResponse<CalculResultats>> {
  const response = await fetch(`${API_BASE}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.error.code, error.error.message);
  }

  return response.json();
}
```

---

## 7. Backend Architecture

### 7.1 Module de Calcul

```
src/server/calculations/
├── index.ts              # Orchestrateur performCalculations()
├── types.ts              # Types et constantes internes
├── validation.ts         # Validation Zod + normalisation
├── rentabilite.ts        # Calculs rentabilite
├── fiscalite.ts          # Calculs fiscaux (IR/IS)
├── hcsf.ts               # Analyse HCSF
├── projection.ts         # Projections et TRI
└── synthese.ts           # Scoring et recommandations
```

**Orchestrateur :**

```typescript
// src/server/calculations/index.ts

export function performCalculations(input: unknown): CalculationResult {
  // 1. Validation
  const validated = validateAndNormalize(input);

  // 2. Calculs sequentiels
  const rentabilite = calculerRentabilite(validated);
  const fiscalite = calculerFiscalite(validated, rentabilite);
  const hcsf = analyserHCSF(validated, rentabilite);
  const synthese = genererSynthese(rentabilite, fiscalite, hcsf);
  const projections = genererProjections(validated, rentabilite);

  // 3. Assemblage
  return {
    rentabilite,
    fiscalite,
    hcsf,
    synthese,
    projections,
    // ...
  };
}
```

### 7.2 Generation PDF

```
src/lib/pdf/
├── index.ts              # Exports
├── styles.ts             # StyleSheet centralise
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ScoreGauge.tsx
│   ├── KeyMetrics.tsx
│   └── Table.tsx
└── templates/
    └── RapportSimulation.tsx
```

### 7.3 Client Supabase

```
src/lib/supabase/
├── index.ts              # Barrel exports
├── client.ts             # Browser client (singleton)
├── server.ts             # Server client (per-request)
└── types.ts              # Database types
```

---

## 8. Database Schema

### 8.1 Table simulations

```sql
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'Simulation sans titre',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Donnees JSON
  form_data JSONB NOT NULL,
  resultats JSONB NOT NULL,

  -- Indicateurs denormalises (pour tri/filtres)
  rentabilite_brute DECIMAL(5,2),
  rentabilite_nette DECIMAL(5,2),
  cashflow_mensuel DECIMAL(10,2),
  score_global INTEGER CHECK (score_global >= 0 AND score_global <= 100),

  -- Flags
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Index performance
CREATE INDEX idx_simulations_user_id ON public.simulations(user_id);
CREATE INDEX idx_simulations_created ON public.simulations(created_at DESC);
CREATE INDEX idx_simulations_favorites ON public.simulations(user_id, is_favorite)
  WHERE is_favorite = TRUE;

-- Trigger updated_at
CREATE TRIGGER simulations_updated_at
  BEFORE UPDATE ON public.simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 8.2 Row Level Security

```sql
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

---

## 9. Project Structure

```
renta-immo/
├── .github/
│   └── workflows/
│       └── ci.yaml              # CI (lint, type-check, tests)
├── docs/
│   ├── prd.md
│   ├── architecture.md          # (historique)
│   ├── architecture-fullstack.md # CE DOCUMENT
│   ├── stories/
│   └── devs-guide/
├── e2e/
│   ├── fixtures/
│   └── tests/
│       ├── simulation-complete.spec.ts
│       └── multi-scenarios.spec.ts
├── public/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── calculate/route.ts
│   │   │   ├── pdf/route.ts
│   │   │   └── simulations/
│   │   ├── simulations/
│   │   ├── resultats/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── results/
│   │   ├── simulations/
│   │   └── providers/
│   ├── hooks/
│   │   ├── useCalculateur.ts
│   │   ├── useDownloadPdf.ts
│   │   ├── useSimulations.ts
│   │   └── useSupabase.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   ├── validators.ts
│   │   ├── pdf/
│   │   └── supabase/
│   ├── server/
│   │   └── calculations/
│   ├── stores/
│   │   └── calculateur.store.ts
│   └── types/
│       ├── calculateur.ts
│       ├── api.ts
│       ├── database.ts
│       └── index.ts
├── .env.example
├── .env.local                   # (git-ignored)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 10. Development Workflow

### 10.1 Prerequisites

```bash
# Node.js 20+
node -v  # v20.x.x

# Package manager
npm -v   # 10.x.x
```

### 10.2 Initial Setup

```bash
# Clone et install
git clone https://github.com/user/renta-immo.git
cd renta-immo
npm install

# Configuration
cp .env.example .env.local
# Editer .env.local avec vos credentials Supabase
```

### 10.3 Development Commands

```bash
# Demarrer le serveur de dev
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Tests E2E
npm run test:e2e

# Build production
npm run build
```

### 10.4 Environment Variables

```bash
# .env.local

# Supabase (Phase 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-only, NEVER expose

# (Deprecated)
# NEXT_PUBLIC_N8N_WEBHOOK_URL=...
```

---

## 11. Deployment

### 11.1 Strategy

| Composant | Plateforme | Methode |
|-----------|------------|---------|
| Frontend + API | Vercel | Git push → auto deploy |
| Database | Supabase | Migrations SQL |
| Preview | Vercel | PR → preview URL |

### 11.2 Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | localhost:3000 | localhost:3000/api | Local dev |
| Preview | *.vercel.app | *.vercel.app/api | PR testing |
| Production | renta-immo.vercel.app | renta-immo.vercel.app/api | Live |

### 11.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml

name: CI

on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## 12. Security & Performance

### 12.1 Security

**Frontend :**
- CSP Headers via `next.config.js`
- XSS Prevention : React escape par defaut
- Secure Storage : Pas de secrets en localStorage

**Backend :**
- Input Validation : Zod sur toutes les entrees
- Rate Limiting : Vercel auto (plan dependent)
- CORS : Configure dans API Routes

**Authentication (V1) :**
- Supabase Auth avec RLS
- JWT stocke en httpOnly cookie
- Session refresh automatique

### 12.2 Performance Targets

| Metrique | Cible | Mesure |
|----------|-------|--------|
| API /calculate | < 500ms | Vercel Analytics |
| API /pdf | < 2s | Logs |
| LCP | < 2.5s | Core Web Vitals |
| TTI | < 3s | Lighthouse |
| Bundle Size | < 200KB (initial) | next-bundle-analyzer |

**Optimisations :**
- Code splitting automatique (Next.js)
- Image optimization (next/image)
- React Query caching (staleTime: 5min)
- Lazy loading composants lourds

---

## 13. Testing Strategy

### 13.1 Testing Pyramid

```
        E2E Tests (Playwright)
       /                      \
      Integration Tests (API)
     /                        \
    Frontend Unit    Backend Unit
    (Vitest)         (Vitest)
```

### 13.2 Coverage Targets

| Module | Target |
|--------|--------|
| src/server/calculations/ | 80% |
| src/lib/ | 70% |
| src/components/ | 60% |

### 13.3 Test Examples

**Unit Test (Backend) :**
```typescript
// src/server/calculations/rentabilite.test.ts

describe('calculerRentabilite', () => {
  it('should calculate brute correctly', () => {
    const result = calculerRentabilite({
      bien: { prix_achat: 100000 },
      exploitation: { loyer_mensuel: 600 },
      // ...
    });

    expect(result.brute).toBeCloseTo(7.2, 1);
  });
});
```

**E2E Test :**
```typescript
// e2e/tests/simulation-complete.spec.ts

test('complete simulation flow', async ({ page }) => {
  await page.goto('/');

  // Fill form
  await page.fill('[data-testid="prix-achat"]', '150000');
  // ...

  await page.click('[data-testid="calculer"]');

  // Verify results
  await expect(page.locator('[data-testid="score-global"]')).toBeVisible();
});
```

---

## 14. Coding Standards

### 14.1 Critical Rules

- **Type Sharing** : Toujours definir types dans `src/types/` et importer
- **API Calls** : Utiliser `src/lib/api.ts`, jamais `fetch` direct
- **Env Vars** : Acces via config, jamais `process.env` direct
- **Error Handling** : Toutes les routes API utilisent le handler standard
- **No Any** : Pas de `any` explicite, utiliser `unknown` + type guards

### 14.2 Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `UserProfile.tsx` |
| Hooks | camelCase + use | - | `useAuth.ts` |
| API Routes | - | kebab-case | `/api/user-profile` |
| Database Tables | - | snake_case | `user_profiles` |
| Constants | SCREAMING_SNAKE | SCREAMING_SNAKE | `MAX_DURATION` |

---

## 15. Error Handling

### 15.1 Error Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, unknown>;
  };
}
```

### 15.2 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| VALIDATION_ERROR | 400 | Donnees invalides |
| UNAUTHORIZED | 401 | Non authentifie |
| FORBIDDEN | 403 | Acces interdit |
| NOT_FOUND | 404 | Ressource introuvable |
| CALCULATION_ERROR | 500 | Erreur de calcul |
| PDF_GENERATION_ERROR | 500 | Erreur generation PDF |
| SERVER_ERROR | 500 | Erreur interne |

### 15.3 Frontend Error Handling

```typescript
// src/lib/api.ts

export class ApiError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

// Usage dans les hooks
const { data, error } = useQuery({
  queryKey: ['simulations'],
  queryFn: fetchSimulations,
  onError: (err) => {
    if (err instanceof ApiError) {
      toast.error(err.message);
    }
  },
});
```

---

## 16. Monitoring

### 16.1 Stack

| Aspect | Tool |
|--------|------|
| Frontend Perf | Vercel Analytics |
| API Perf | Vercel Functions logs |
| Errors | Console + Sentry (optionnel) |
| Uptime | Vercel Status |

### 16.2 Key Metrics

**Frontend :**
- Core Web Vitals (LCP, FID, CLS)
- JS errors rate
- API response times

**Backend :**
- Request rate
- Error rate (< 0.1%)
- P95 response time

---

## 17. Prochaines Etapes

### Phase 2 (En cours)

- [x] Documentation architecture fullstack
- [ ] TECH-010 a TECH-012 : Dette technique
- [ ] TECH-013 a TECH-016 : Generation PDF
- [ ] TECH-017 a TECH-021 : Integration Supabase
- [ ] TECH-022 a TECH-023 : Tests

### V1 (Future)

- [ ] Supabase Auth (comptes utilisateurs)
- [ ] Partage de simulations
- [ ] Historique cloud
- [ ] Notifications email

---

*Document genere par Winston (Architecte) - Mode YOLO*
