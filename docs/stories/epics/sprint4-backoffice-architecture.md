# Architecture — Sprint 4 : Back-Office Configuration (V2-S19 à V2-S24)

> **Auteur** : Winston — Architect
> **Date** : 2026-02-16
> **Version** : 1.0
> **Contexte** : Réponses aux questions de `docs/reports/sprint4-questions-architecte.md` + blueprint d'implémentation complet

---

## 1. Décisions d'architecture (réponses aux questions)

### Q1 — Système de rôles admin : **Option A — Migration SQL + helper `requireAdmin()`**

**Décision** : Option A.

**Justification** : L'architecture existante n'utilise aucun plugin Better Auth. Introduire `adminPlugin` juste pour un champ `role` créerait une asymétrie. Une colonne SQL + un helper centralisé est cohérent avec la philosophie du projet (simplicité, RLS deny-all, service role key).

**Implémentation** :

```sql
-- Migration : 20260216_add_user_role.sql
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role) WHERE role = 'admin';
```

```typescript
// src/lib/auth-helpers.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export type UserRole = 'user' | 'admin';

export interface SessionWithRole {
  user: { id: string; email: string; role: UserRole };
}

/**
 * Vérifie que la session est valide et que l'utilisateur est admin.
 * Retourne { session } ou { error: NextResponse } selon le cas.
 */
export async function requireAdmin(): Promise<
  { session: SessionWithRole; error: null } | { session: null; error: NextResponse }
> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Non authentifié' } },
        { status: 401 }
      ),
    };
  }

  // Lire le rôle en base (pas dans le token JWT Better Auth par défaut)
  const supabase = await createAdminClient();
  const { data: userRow } = await supabase
    .from('user')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (userRow?.role !== 'admin') {
    return {
      session: null,
      error: NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs' },
        },
        { status: 403 }
      ),
    };
  }

  return {
    session: { user: { ...session.user, role: 'admin' } },
    error: null,
  };
}
```

**Pattern d'utilisation dans chaque route admin** :

```typescript
// src/app/api/admin/params/route.ts (exemple)
export async function GET() {
  const { session, error } = await requireAdmin();
  if (error) return error;
  // ...suite du handler
}
```

---

### Q2 — Promotion du premier compte admin : **Option B — Script `scripts/promote-admin.mjs`**

**Décision** : Option B.

**Justification** :

- L'Option A (SQL manuel) est trop fragile en production — risque d'erreur humaine, pas traçable.
- L'Option C (auto-promotion via env) est un vecteur de sécurité : si `ADMIN_EMAIL` fuite ou est mal configurée, n'importe qui peut devenir admin au premier login.
- L'Option B suit le pattern existant (`scripts/test-auth.mjs`), est explicite et auditée.

```javascript
// scripts/promote-admin.mjs
import postgres from 'postgres';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/promote-admin.mjs <email>');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);
const result = await sql`
  UPDATE "user" SET role = 'admin'
  WHERE email = ${email}
  RETURNING id, email, role
`;
if (result.length === 0) {
  console.error(`Utilisateur non trouvé : ${email}`);
  process.exit(1);
}
console.log(`✅ Promu admin :`, result[0]);
await sql.end();
```

Commande : `node scripts/promote-admin.mjs admin@example.com`

---

### Q3 — Scope V2-S22 : constantes à migrer en BDD — **Sélection validée avec ajustements mineurs**

**Décision** : La proposition est validée. Ajustements :

| Bloc            | Constantes migrées                                                                                                                              | Motif d'exclusion des autres                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| A — Fiscalité   | `TAUX_PS_FONCIER`, `TAUX_PS_REVENUS_BIC_LMNP`, `MICRO_FONCIER.*`, `MICRO_BIC.*.ABATTEMENT`, `MICRO_BIC.*.PLAFOND`, `IS.*`, `FLAT_TAX`           | `BAREME_EMOLUMENTS` : tableau barémique complexe                                    |
| B — Foncier     | `DEFICIT_FONCIER.PLAFOND_IMPUTATION`, `DEFICIT_FONCIER.PLAFOND_ENERGIE`, `DEFICIT_FONCIER.DUREE_REPORT`                                         | —                                                                                   |
| C — Plus-value  | `PLUS_VALUE.TAUX_IR`, `PLUS_VALUE.TAUX_PS`, `PLUS_VALUE.FORFAIT_FRAIS_ACQUISITION`, `PLUS_VALUE.FORFAIT_TRAVAUX_PV`, `PLUS_VALUE.SEUIL_SURTAXE` | `PLUS_VALUE.BAREME_SURTAXE` : tableau ; `DATE_LOI_LE_MEUR` : date législative figée |
| D — HCSF        | `HCSF.TAUX_MAX`, `HCSF.DUREE_MAX_ANNEES`, `HCSF.PONDERATION_LOCATIFS`                                                                           | `HCSF.REVENUS_ESTIMES` : map TMI→revenu, complexité d'édition UI                    |
| E — DPE         | `PROJECTION.DECOTE_DPE.F_G`, `PROJECTION.DECOTE_DPE.E`                                                                                          | —                                                                                   |
| F — Scoring/LMP | `LMP.SEUIL_ALERTE`, `LMP.SEUIL_LMP`, `RESTE_A_VIVRE.SEUIL_MIN`, `RESTE_A_VIVRE.SEUIL_CONFORT`                                                   | `SCORING_PROFIL` : objet imbriqué avec sémantique métier complexe                   |
| G — Charges     | `DEFAULTS.*` (7 valeurs), `CFE.SEUIL_EXONERATION`, `FRAIS_REVENTE.*`                                                                            | —                                                                                   |
| H — Projections | `PROJECTION.INFLATION_LOYER`, `PROJECTION.INFLATION_CHARGES`, `PROJECTION.REVALORISATION_BIEN`                                                  | `PROJECTION.HORIZONS` : tableau                                                     |

**Total : ~40 constantes scalaires migrées** sur ~50 existantes.

**Ajout** : `NOTAIRE.TAUX_ANCIEN` et `NOTAIRE.TAUX_NEUF` sont également à migrer (taux estimatifs modifiables sans redéploiement).

---

### Q4 — V2-S24 Mode Dry Run : **Option A — Fixtures hardcodées**

**Décision** : Option A pour le MVP Sprint 4.

**Justification** : L'Option B nécessite un flag supplémentaire en BDD + une UI pour désigner les simulations de référence. L'Option C est la cible long terme. Pour ce sprint, 5 fixtures TypeScript couvrent 100% du besoin fonctionnel avec zéro complexité additionnelle.

```typescript
// src/server/admin/dry-run-fixtures.ts
// 5 profils représentatifs couvrant les régimes fiscaux principaux
export const DRY_RUN_FIXTURES = [
  {
    id: 'lmnp-classique',
    label: 'LMNP Classique — Studio Paris',
    formData: {
      /* ... */
    },
  },
  {
    id: 'nu-micro-foncier',
    label: 'Nu Micro-Foncier — T2 Lyon',
    formData: {
      /* ... */
    },
  },
  {
    id: 'lmnp-reel-is',
    label: 'SCI IS — Immeuble de rapport',
    formData: {
      /* ... */
    },
  },
  {
    id: 'colocation',
    label: 'Colocation LMNP meublé',
    formData: {
      /* ... */
    },
  },
  {
    id: 'tourisme-classe',
    label: 'Meublé tourisme classé — Gîte',
    formData: {
      /* ... */
    },
  },
] as const;
```

---

### Q5 — V2-S23 Destinataire des alertes : **Option C (MVP) + Option A en .env**

**Décision** : MVP = affichage dashboard admin uniquement (AC1 + AC2). Si l'email est nécessaire, utiliser `ADMIN_ALERT_EMAIL` en .env — pas de requête sur tous les admins en base.

**Justification** : Pour une installation mono-admin (cas typique), interroger tous les admins est du sur-engineering. L'env var est déjà le pattern du projet (`EMAIL_SENDER` dans `src/lib/email.ts`).

---

### Q6 — Versioning par année fiscale : **Option C — `anneeFiscale` optionnel, défaut = année en cours**

**Décision** : Option C.

**Comportement attendu** : Les simulations historiques recalculées en 2026 utilisent les taux 2026. C'est le comportement correct — une simulation est toujours recalculée avec les règles fiscales actuelles. La cohérence historique est assurée par le stockage des `resultats` JSONB dans la table `simulations` (les résultats sauvegardés ne changent pas).

**Implémentation** :

```typescript
// src/server/config/config-service.ts
async getConfig(anneeFiscale?: number): Promise<ConfigParams> {
  const year = anneeFiscale ?? new Date().getFullYear();
  // Lire en cache d'abord, puis DB
  return this.fetchFromCacheOrDb(year);
}
```

---

### Q7 — URL du back-office : **`/admin`**

**Décision** : `/admin`.

**Justification** : Convention Next.js App Router standard. La protection par middleware est plus simple et prévisible avec `/admin/:path*`. L'expérience utilisateur métier n'est pas impactée car le back-office est réservé aux admins techniques.

---

### Q8 — Cache `ConfigService` : **Cache mémoire (Map + timestamp)**

**Décision** : Cache mémoire, TTL 5 minutes.

**Justification** : Le back-office est à faible trafic. Le cold start Vercel recharge le cache automatiquement. Pas de Redis pour ce sprint — réévaluer si le trafic ou le nombre d'instances augmente.

---

### Q9 — Table `config_params_audit` : **Option B — Table + UI historique**

**Décision** : Option B — l'AC6 de V2-S21 est explicite ("Historique des modifications visible par paramètre").

---

## 2. Architecture des données (V2-S19)

### Schéma `config_params`

```sql
-- supabase/migrations/20260216_sprint4_config_params.sql

-- ============================================================
-- Table principale des paramètres configurables
-- ============================================================
CREATE TABLE public.config_params (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annee_fiscale INTEGER NOT NULL,               -- Ex: 2025, 2026
  bloc         TEXT NOT NULL,                   -- 'fiscalite', 'hcsf', 'plus_value', etc.
  cle          TEXT NOT NULL,                   -- Ex: 'TAUX_PS_FONCIER', 'MICRO_BIC_MEUBLE_LONGUE_DUREE_ABATTEMENT'
  valeur       DECIMAL(20, 8) NOT NULL,         -- Valeur numérique (taux en décimal ou montant)
  unite        TEXT NOT NULL DEFAULT 'decimal', -- 'decimal', 'euros', 'annees', 'pourcentage'
  label        TEXT NOT NULL,                   -- Libellé affichable : "Prélèvements sociaux foncier"
  description  TEXT,                            -- Texte aide contextuelle
  is_temporary BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE = dispositif fiscal temporaire
  date_expiration DATE,                         -- NULL si permanent ; sinon date d'expiration connue
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT config_params_unique UNIQUE (annee_fiscale, bloc, cle)
);

-- Index pour lecture par année fiscale (chemin chaud)
CREATE INDEX idx_config_params_annee ON public.config_params(annee_fiscale);
CREATE INDEX idx_config_params_bloc ON public.config_params(annee_fiscale, bloc);
CREATE INDEX idx_config_params_temporary ON public.config_params(is_temporary, date_expiration)
  WHERE is_temporary = TRUE;

-- Trigger updated_at (réutilise la fonction existante)
CREATE TRIGGER config_params_updated_at
  BEFORE UPDATE ON public.config_params
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.config_params ENABLE ROW LEVEL SECURITY;
-- Accès via service role uniquement (cohérent avec le reste du projet)

-- ============================================================
-- Table d'audit des modifications
-- ============================================================
CREATE TABLE public.config_params_audit (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id     UUID NOT NULL REFERENCES public.config_params(id) ON DELETE CASCADE,
  annee_fiscale INTEGER NOT NULL,
  bloc          TEXT NOT NULL,
  cle           TEXT NOT NULL,
  ancienne_valeur DECIMAL(20, 8) NOT NULL,
  nouvelle_valeur DECIMAL(20, 8) NOT NULL,
  modifie_par   TEXT NOT NULL REFERENCES "user"(id),
  modifie_le    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  motif         TEXT                               -- Motif de modification (optionnel)
);

CREATE INDEX idx_audit_config_id ON public.config_params_audit(config_id);
CREATE INDEX idx_audit_modifie_le ON public.config_params_audit(modifie_le DESC);

ALTER TABLE public.config_params_audit ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Migration du rôle utilisateur
-- ============================================================
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role) WHERE role = 'admin';
```

### Données initiales de seed

```sql
-- Seed 2026 — extrait (complet dans la migration)
INSERT INTO public.config_params (annee_fiscale, bloc, cle, valeur, unite, label, is_temporary, date_expiration) VALUES
-- Bloc fiscalité
(2026, 'fiscalite', 'TAUX_PS_FONCIER',              0.172,  'decimal', 'PS sur revenus fonciers',             FALSE, NULL),
(2026, 'fiscalite', 'TAUX_PS_REVENUS_BIC_LMNP',     0.186,  'decimal', 'PS sur revenus BIC LMNP',             FALSE, NULL),
(2026, 'fiscalite', 'MICRO_FONCIER_ABATTEMENT',     0.30,   'decimal', 'Abattement Micro-Foncier',             FALSE, NULL),
(2026, 'fiscalite', 'MICRO_FONCIER_PLAFOND',        15000,  'euros',   'Plafond Micro-Foncier',                FALSE, NULL),
-- Déficit foncier — dispositif temporaire expiré le 31/12/2025
(2026, 'foncier',   'DEFICIT_FONCIER_PLAFOND_ENERGIE', 21400, 'euros', 'Plafond majoré déficit foncier énergie', TRUE, '2025-12-31'),
-- [... 36 autres lignes ...]
;
```

---

## 3. Architecture des services (V2-S20 à V2-S22)

### `ConfigService` — service singleton côté serveur

```
src/server/config/
├── config-service.ts      # Singleton avec cache mémoire
├── config-types.ts        # Types TypeScript
├── config-seed.ts         # Données initiales (2026)
└── config-validator.ts    # Validation des valeurs
```

```typescript
// src/server/config/config-types.ts

export type ConfigBloc =
  | 'fiscalite'
  | 'foncier'
  | 'plus_value'
  | 'hcsf'
  | 'dpe'
  | 'lmp_scoring'
  | 'charges'
  | 'projections';

export interface ConfigParam {
  id: string;
  anneeFiscale: number;
  bloc: ConfigBloc;
  cle: string;
  valeur: number;
  unite: 'decimal' | 'euros' | 'annees' | 'pourcentage';
  label: string;
  description?: string;
  isTemporary: boolean;
  dateExpiration?: string | null;
}

export interface ConfigParamAudit {
  id: string;
  configId: string;
  anneeFiscale: number;
  bloc: string;
  cle: string;
  ancienneValeur: number;
  nouvelleValeur: number;
  modifiePar: string;
  modifieLe: string;
  motif?: string;
}

// Structure plate résultante pour le moteur de calcul
export interface ResolvedConfig {
  anneeFiscale: number;
  // Fiscalité
  tauxPsFoncier: number;
  tauxPsRevenusBicLmnp: number;
  microFoncierAbattement: number;
  microFoncierPlafond: number;
  microBicMeubleLongueDureeAbattement: number;
  microBicMeubleLongueDureePlafond: number;
  microBicTourismeClasseAbattement: number;
  microBicTourismeClassePlafond: number;
  microBicTourismeNonClasseAbattement: number;
  microBicTourismeNonClassePlafond: number;
  isTauxReduit: number;
  isTauxNormal: number;
  isSeuilTauxReduit: number;
  flatTax: number;
  // Foncier
  deficitFoncierPlafondImputation: number;
  deficitFoncierPlafondEnergie: number;
  deficitFoncierDureeReport: number;
  // Plus-value
  plusValueTauxIr: number;
  plusValueTauxPs: number;
  plusValueForfaitFraisAcquisition: number;
  plusValueForfaitTravauxPv: number;
  plusValueSeuilSurtaxe: number;
  // HCSF
  hcsfTauxMax: number;
  hcsfDureeMaxAnnees: number;
  hcsfPonderationLocatifs: number;
  // DPE
  decoteDpeFg: number;
  decoteDpeE: number;
  // LMP / Scoring
  lmpSeuilAlerte: number;
  lmpSeuilLmp: number;
  resteAVivreSeuilMin: number;
  resteAVivreSeuilConfort: number;
  // Charges
  defaultsAssurancePno: number;
  defaultsChargesCoproM2: number;
  defaultsTaxeFoncieresMois: number;
  defaultsFraisDossierBanque: number;
  defaultsFraisGarantieCredit: number;
  defaultsComptableLmnp: number;
  defaultsCfeMin: number;
  cfeSeuilExoneration: number;
  fraisReventeTauxAgenceDefaut: number;
  fraisReventeDiagnostics: number;
  notaireTauxAncien: number;
  notaireTauxNeuf: number;
  // Projections
  projectionInflationLoyer: number;
  projectionInflationCharges: number;
  projectionRevalorisation: number;
  projectionDecoteDpeFg: number;
  projectionDecoteDpeE: number;
}
```

```typescript
// src/server/config/config-service.ts

import { createAdminClient } from '@/lib/supabase/server';
import type { ConfigParam, ResolvedConfig, ConfigBloc } from './config-types';

interface CacheEntry {
  data: ResolvedConfig;
  fetchedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<number, CacheEntry>();

export class ConfigService {
  private static instance: ConfigService;

  static getInstance(): ConfigService {
    if (!ConfigService.instance) ConfigService.instance = new ConfigService();
    return ConfigService.instance;
  }

  async getConfig(anneeFiscale?: number): Promise<ResolvedConfig> {
    const year = anneeFiscale ?? new Date().getFullYear();
    const cached = cache.get(year);

    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.data;
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('config_params')
      .select('*')
      .eq('annee_fiscale', year);

    if (error || !data?.length) {
      // Fallback sur les constantes hardcodées si la DB est vide
      return this.getFallbackConfig(year);
    }

    const resolved = this.mapToResolvedConfig(year, data as ConfigParam[]);
    cache.set(year, { data: resolved, fetchedAt: Date.now() });
    return resolved;
  }

  invalidateCache(year?: number): void {
    if (year) cache.delete(year);
    else cache.clear();
  }

  private mapToResolvedConfig(year: number, params: ConfigParam[]): ResolvedConfig {
    const get = (cle: string): number => {
      const p = params.find((p) => p.cle === cle);
      if (!p) throw new Error(`Paramètre manquant en BDD : ${cle} (année ${year})`);
      return p.valeur;
    };

    return {
      anneeFiscale: year,
      tauxPsFoncier: get('TAUX_PS_FONCIER'),
      // ... toutes les clés
    } as ResolvedConfig;
  }

  private getFallbackConfig(year: number): ResolvedConfig {
    // Importe les CONSTANTS du fichier existant comme fallback de sécurité
    const { CONSTANTS } = require('@/config/constants');
    // Mapper CONSTANTS → ResolvedConfig
    return {
      anneeFiscale: year,
      tauxPsFoncier: CONSTANTS.FISCALITE.TAUX_PS_FONCIER,
      // ...
    } as ResolvedConfig;
  }
}

export const configService = ConfigService.getInstance();
```

---

## 4. Architecture API REST admin (V2-S20)

### Structure des routes

```
src/app/api/admin/
├── params/
│   ├── route.ts             # GET (liste filtrée) + POST (nouveau)
│   └── [id]/
│       ├── route.ts         # GET (détail) + PATCH (update) + DELETE
│       └── audit/
│           └── route.ts     # GET (historique d'un paramètre)
├── dry-run/
│   └── route.ts             # POST (simulation impact)
└── alerts/
    └── route.ts             # GET (paramètres à expiration proche)
```

### Convention des routes (cohérente avec `simulations/route.ts`)

```typescript
// src/app/api/admin/params/route.ts

export async function GET(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  // Rate limiting admin : 60 req/min (moins strict que public)
  // Filtres : bloc, annee_fiscale, is_temporary
  // Réponse : { success: true, data: ConfigParam[], meta: { total, ... } }
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  // Validation Zod
  // Update en DB + insert audit
  // Invalidation du cache ConfigService
  // Réponse : { success: true, data: ConfigParam }
}
```

### Schéma de validation Zod

```typescript
// src/app/api/admin/params/[id]/route.ts

const UpdateParamSchema = z.object({
  valeur: z.number().finite(),
  motif: z.string().max(500).optional(),
});
```

---

## 5. Architecture UI admin (V2-S21)

### Structure des pages

```
src/app/admin/
├── layout.tsx           # Layout admin avec nav latérale, AuthGuard côté client
├── page.tsx             # Dashboard admin (liens blocs + alertes)
└── params/
    ├── page.tsx         # Liste des 8 blocs
    └── [bloc]/
        └── page.tsx     # Paramètres d'un bloc + historique inline
```

### Composants dédiés

```
src/components/admin/
├── AdminGuard.tsx        # Vérification rôle côté client (redirect si !admin)
├── ParamsGrid.tsx        # Tableau éditable par bloc
├── ParamRow.tsx          # Ligne éditable : label + input + bouton save + historique
├── AuditHistory.tsx      # Accordéon historique par paramètre
├── ExpirationBanner.tsx  # Bandeau alerte paramètres temporaires expirants
└── DryRunPanel.tsx       # Panel simulation impact (V2-S24)
```

### Protection côté client

```typescript
// src/app/admin/layout.tsx
import { AdminGuard } from '@/components/admin/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
```

```typescript
// src/components/admin/AdminGuard.tsx
'use client';
import { useSession } from '@/hooks/useSession'; // hook Better Auth existant
import { redirect } from 'next/navigation';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') return <LoadingSpinner />;
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }
  return <>{children}</>;
}
```

> **Note** : La sécurité réelle est dans `requireAdmin()` côté API. L'`AdminGuard` côté client est une UX guard, pas une sécurité.

---

## 6. Architecture Mode Dry Run (V2-S24)

### Flux de données

```
Admin sélectionne un paramètre à modifier
    ↓
Saisit la nouvelle valeur (preview avant save)
    ↓
POST /api/admin/dry-run { cle, nouvelleValeur, annee_fiscale }
    ↓
API calcule avec ConfigService(patchedConfig) sur les 5 fixtures
    ↓
Retourne { before: ResultatsFixture[], after: ResultatsFixture[], diff: DiffSummary[] }
    ↓
UI affiche tableau comparatif
```

### Service Dry Run

```typescript
// src/server/admin/dry-run-service.ts

import { DRY_RUN_FIXTURES } from './dry-run-fixtures';
import { configService } from '@/server/config/config-service';
import { calculerResultats } from '@/server/calculations/engine';

export async function runDryRun(
  cle: string,
  nouvelleValeur: number,
  anneeFiscale: number
): Promise<DryRunResult> {
  const currentConfig = await configService.getConfig(anneeFiscale);
  const patchedConfig = { ...currentConfig, [mapCleToField(cle)]: nouvelleValeur };

  const results = await Promise.all(
    DRY_RUN_FIXTURES.map(async (fixture) => ({
      id: fixture.id,
      label: fixture.label,
      before: await calculerResultats(fixture.formData, currentConfig),
      after: await calculerResultats(fixture.formData, patchedConfig),
    }))
  );

  return {
    cle,
    ancienneValeur: currentConfig[mapCleToField(cle) as keyof ResolvedConfig] as number,
    nouvelleValeur,
    fixtures: results,
  };
}
```

---

## 7. Middleware — extension pour `/admin`

```typescript
// src/middleware.ts (modification)

const isAdminPage = request.nextUrl.pathname.startsWith('/admin');

// Redirect vers login si admin page sans session
if (!sessionCookie && isAdminPage) {
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// config.matcher : ajouter "/admin/:path*"
export const config = {
  matcher: ['/simulations', '/simulations/:path*', '/auth/:path*', '/admin', '/admin/:path*'],
};
```

> **Important** : Le middleware ne vérifie que la présence d'un cookie de session (pas le rôle). La vérification du rôle admin est faite dans `requireAdmin()` côté API et dans `AdminGuard` côté client.

---

## 8. Alertes dispositifs temporaires (V2-S23)

### Logique de détection

```typescript
// src/server/admin/alerts-service.ts

export interface ParamAlert {
  param: ConfigParam;
  daysUntilExpiration: number;
  severity: 'info' | 'warning' | 'critical'; // 180j / 90j / 30j
}

export async function getExpirationAlerts(): Promise<ParamAlert[]> {
  const supabase = await createAdminClient();
  const today = new Date();

  const { data } = await supabase
    .from('config_params')
    .select('*')
    .eq('is_temporary', true)
    .not('date_expiration', 'is', null);

  return (data ?? [])
    .map((p) => {
      const exp = new Date(p.date_expiration!);
      const days = Math.ceil((exp.getTime() - today.getTime()) / 86_400_000);
      return {
        param: p as ConfigParam,
        daysUntilExpiration: days,
        severity: days <= 30 ? 'critical' : days <= 90 ? 'warning' : 'info',
      };
    })
    .filter((a) => a.daysUntilExpiration <= 180) // Afficher si < 6 mois
    .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
}
```

### Déclenchement des alertes email (optionnel, `.env`)

```typescript
// Appelé dans GET /api/admin/alerts/route.ts
// Si ADMIN_ALERT_EMAIL est défini ET que severity = 'critical'
if (process.env.ADMIN_ALERT_EMAIL && alert.severity === 'critical') {
  await resend.emails.send({
    from: EMAIL_SENDER,
    to: process.env.ADMIN_ALERT_EMAIL,
    subject: `[Renta Immo] Paramètre fiscal expirant dans ${alert.daysUntilExpiration} jours`,
    // ...
  });
}
```

---

## 9. Intégration V2-S22 — Migration du moteur de calcul

### Stratégie de migration (en 3 étapes)

**Étape 1 — Dual mode** : Le moteur de calcul accepte `config?: ResolvedConfig` en paramètre optionnel. Si fourni, l'utilise ; sinon, fallback sur `CONSTANTS` hardcodées.

```typescript
// src/server/calculations/engine.ts (modification)
export async function calculerResultats(
  formData: FormData,
  config?: ResolvedConfig
): Promise<CalculResultats> {
  const cfg = config ?? (await configService.getConfig());
  // Remplacer les CONSTANTS par cfg.xxx dans le moteur
}
```

**Étape 2 — Remplacement progressif** : Remplacer `CONSTANTS.FISCALITE.TAUX_PS_FONCIER` par `cfg.tauxPsFoncier` dans chaque fichier de calcul. Un test de régression `npm test` valide chaque remplacement.

**Étape 3 — Suppression du fallback** : Une fois le seed BDD en place et les tests verts, retirer le fallback `CONSTANTS`.

### Fichiers impactés par V2-S22

```
src/server/calculations/
├── fiscalite/
│   ├── impot-foncier.ts     → cfg.tauxPsFoncier, cfg.microFoncier*
│   ├── impot-lmnp.ts        → cfg.tauxPsRevenusBicLmnp, cfg.microBic*
│   └── impot-sci-is.ts      → cfg.isTauxReduit, cfg.isTauxNormal, cfg.isSeuilTauxReduit
├── plus-value.ts             → cfg.plusValue*
├── hcsf.ts                   → cfg.hcsf*
├── cashflow.ts               → cfg.defaults*
├── projections.ts            → cfg.projection*
└── scoring.ts                → cfg.lmp*, cfg.resteAVivre*
```

---

## 10. Variables d'environnement requises (nouvelles)

```bash
# .env.local (à ajouter)
ADMIN_ALERT_EMAIL=admin@renta-immo.fr   # Optionnel — alertes expirations
```

Aucune autre variable n'est nécessaire — tout passe par le service role Supabase existant.

---

## 11. Séquence d'implémentation recommandée

```
V2-S19 (SQL migrations)
  ├── Migration rôle user
  ├── Migration config_params + config_params_audit
  └── Seed 2026 complet
  ↓
V2-S20 (API)
  ├── src/lib/auth-helpers.ts (requireAdmin)
  ├── src/server/config/ (ConfigService, types)
  └── src/app/api/admin/params/ (CRUD)
  ↓
V2-S21 (UI)
  ├── src/app/admin/ (pages)
  └── src/components/admin/ (composants)
  ↓
V2-S22 (Migration moteur)
  ├── Dual mode (config optionnel)
  ├── Remplacement progressif par bloc
  └── Suppression fallback
  ↓
V2-S23 (Alertes)
  └── src/server/admin/alerts-service.ts
  ↓
V2-S24 (Dry Run)
  ├── src/server/admin/dry-run-fixtures.ts
  └── src/server/admin/dry-run-service.ts
```

---

## 12. Checklist de robustesse

| Critère             | Solution                                                    |
| ------------------- | ----------------------------------------------------------- |
| **Sécurité API**    | `requireAdmin()` sur toutes les routes `/api/admin/*`       |
| **Sécurité UI**     | `AdminGuard` + middleware cookie check                      |
| **Validation**      | Zod sur tous les inputs API                                 |
| **Audit trail**     | Table `config_params_audit` — immutable                     |
| **Cohérence cache** | `configService.invalidateCache(year)` après chaque PATCH    |
| **Fallback calcul** | `CONSTANTS` hardcodées si DB inaccessible                   |
| **Tests**           | Tests unitaires ConfigService + tests d'intégration dry run |
| **Migration SQL**   | Idempotentes (`IF NOT EXISTS`, `IF NOT EXISTS`)             |
| **Rate limiting**   | `requireAdmin()` peut incorporer un rate limit 60 req/min   |

---

_Winston — Architect 🏗️ — 2026-02-16_
