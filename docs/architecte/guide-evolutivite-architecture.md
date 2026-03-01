# Guide d'Évolutivité Architecture — Renta_Immo

> **Version** : 1.0  
> **Date** : 2026-02-27  
> **Statut** : Référence Architecturale  
> **Auteur** : Antigravity / Architecture Review

Ce document est le référentiel de préparation avant l'ajout de toute nouvelle fonctionnalité significative. Il couvre les points d'attention actuels, les actions concrètes à mener, et les recommandations stratégiques pour l'évolution fonctionnelle et technique de l'application sur le long terme.

---

## Table des Matières

1. [Diagnostic de l'État Actuel](#1-diagnostic-de-létat-actuel)
2. [Points d'Attention Critiques](#2-points-dattention-critiques)
3. [Actions Immédiates Avant Nouvelle Feature](#3-actions-immédiates-avant-nouvelle-feature)
4. [Stratégie de Maintenabilité](#4-stratégie-de-maintenabilité)
5. [Scalabilité Applicative](#5-scalabilité-applicative)
6. [Détachement de Vercel — Multi-Cluster & Self-Hosting](#6-détachement-de-vercel--multi-cluster--self-hosting)
7. [Containerisation Docker](#7-containerisation-docker)
8. [Migration Backend (Python / autre)](#8-migration-backend-python--autre)
9. [Gouvernance des données & Sécurité à l'échelle](#9-gouvernance-des-données--sécurité-à-léchelle)
10. [Roadmap Technique Recommandée](#10-roadmap-technique-recommandée)

---

## 1. Diagnostic de l'État Actuel

### 1.1 Forces

| Force                               | Impact                                          |
| ----------------------------------- | ----------------------------------------------- |
| Monolithe modulaire (`src/server/`) | Ajout de features sans friction d'orchestration |
| TypeScript strict + types partagés  | Contrats clairs entre couches, refactoring sûr  |
| API Routes Serverless (Next.js)     | Isolation naturelle des endpoints               |
| ConfigService (params BDD)          | Features configurables sans redéploiement       |
| Better Auth découplé                | Auth réutilisable pour toute nouvelle section   |
| Migrations SQL versionnées          | Schéma évolutif et traçable                     |
| CI/CD GitHub Actions                | Pipeline reproductible                          |
| Coverage 84% (moteur calcul)        | Filet de sécurité pour les refactorings         |

### 1.2 Dettes Techniques Actuelles

| Dette                               | Sévérité | Impact si non traitée                      |
| ----------------------------------- | -------- | ------------------------------------------ |
| Rate limiting in-memory             | 🟡 Moyen | Inefficace sur plusieurs instances Vercel  |
| Pas de queue/worker async           | 🟡 Moyen | Bloque les traitements longs futurs        |
| Pas de monitoring/observabilité     | 🟡 Moyen | Aucune visibilité sur les erreurs prod     |
| Pas de cache distribué              | 🟡 Moyen | ConfigService non cohérent multi-instances |
| Pas de pagination curseur           | 🟠 Bas   | Performance dégradée si volumes croissants |
| RLS en mode "deny-all" service role | 🟢 Bas   | OK maintenant, à auditer si multi-tenant   |

---

## 2. Points d'Attention Critiques

### 2.1 Architecture — Boundaries entre Domaines

> [!IMPORTANT]
> Le monolithe modulaire n'est viable long terme que si les **frontières de domaines sont respectées**. Une feature mal découpée qui cross-importe d'un autre domaine crée des couplages invisibles impossibles à extraire ensuite.

**Règle à appliquer immédiatement :**

Chaque domaine fonctionnel doit être **auto-contenu** dans ses dossiers :

```
src/
├── app/[feature]/           ← Pages & routes HTTP
├── app/api/[feature]/       ← API Surface
├── server/[feature]/        ← Logique métier pure
├── components/[feature]/    ← UI (si feature avec interface)
├── stores/[feature].store.ts← État client
└── types/[feature].ts       ← Contrats TypeScript
supabase/migrations/
└── YYYYMMDD_[feature]_*.sql ← Schéma isolé par feature
```

**Ne jamais faire :** importer `src/server/calculations/` depuis `src/server/autreDomaine/` directement. Passer par les API Routes ou un service partagé explicite dans `src/server/shared/`.

### 2.2 Couplage du Moteur de Calcul

Le moteur de calcul (`src/server/calculations/`) est actuellement **mono-domaine** (simulation immobilière). Il est bien testé (136+ tests) mais son architecture interne (`validate → rentabilite → fiscalite → hcsf → synthese → projection`) serait difficile à réutiliser pour un domaine différent tel quel.

**Point d'attention :** Si une future feature réutilise des calculs (ex : calculateur crédit seul, calculateur patrimoine global), créer une couche `src/server/shared/finance/` avec les primitives réutilisables (PMT, TRI, NPV) plutôt que copier du code.

### 2.3 ConfigService — Scope Unique

Actuellement, `ConfigService` gère **un seul domaine** de config (params fiscaux). Si plusieurs features ont leurs propres paramètres configurables, le singleton pourrait devenir une God-Class.

**Action :** Prévoir une version `ConfigService<T>` générique ou un registre de configs par domaine : `ConfigRegistry.get('fiscalite')`, `ConfigRegistry.get('credit')`, etc.

### 2.4 Base de Données — Schéma Non Partitionné

Supabase (PostgreSQL 15) est robuste, mais sans partitionnement ni indexation proactive, la table `simulations` deviendra un bottleneck au-delà de **~500K lignes**.

**Actions préventives :**

- Ajouter des index composites sur (`user_id`, `created_at`) dès maintenant
- Planifier une partition de `simulations` par `created_at` avant 100K lignes
- Activer `pg_stat_statements` pour identifier les requêtes lentes

### 2.5 Authentification — Pas de Multi-Tenant

Better Auth gère actuellement **une seule organisation implicite**. Si l'application évolue vers un SaaS B2B (agences immobilières, conseillers patrimoniaux avec leurs clients), il manque un concept d'Organisation/Tenant.

**Anticiper :** Ne pas coupler les données à `user_id` uniquement si un modèle multi-tenant est envisagé. Prévoir une colonne `organization_id` nullable dès le début sur les nouvelles tables.

---

## 3. Actions Immédiates Avant Nouvelle Feature

Ces actions doivent être réalisées **avant** d'initier un nouveau développement significatif, pour éviter de construire sur des fondations fragiles.

### 3.1 🔴 Priorité Haute

#### Action 1 — Remplacer le Rate Limiting In-Memory

```typescript
// ACTUEL (non fiable multi-instances)
// src/lib/rate-limit.ts — Map in-memory

// CIBLE
// Option A : Upstash Redis (serverless-friendly, Vercel compatible)
// Option B : Vercel KV (intégration native)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
});
```

**Coût estimé :** 1 jour. Gratuit jusqu'à 10K requêtes/jour (Upstash free tier).

#### Action 2 — Observabilité (Monitoring & Error Tracking)

Sans monitoring, les erreurs de production sont invisibles.

```bash
# Option recommandée : Sentry (gratuit jusqu'à 5K erreurs/mois)
npm install @sentry/nextjs

# Configuration dans instrumentation.ts (déjà présent !)
```

Configurer :

- `Sentry.init()` dans `instrumentation.ts`
- Alertes sur les erreurs `CALCULATION_ERROR` et `PDF_GENERATION_ERROR`
- Performance monitoring sur `/api/calculate` (cible < 500ms)

#### Action 3 — Cache Distribué pour ConfigService

```typescript
// ACTUEL : cache in-memory TTL 5min (non partagé entre instances)
// CIBLE : Redis / Vercel KV

// config-service.ts
import { kv } from '@vercel/kv';

async function getConfig(): Promise<ResolvedConfig> {
  const cached = await kv.get<ResolvedConfig>('config:current');
  if (cached) return cached;
  const config = await loadFromDatabase();
  await kv.set('config:current', config, { ex: 300 }); // 5min TTL
  return config;
}
```

#### Action 4 — Documentation des Contrats d'API (OpenAPI)

Avant d'ajouter des features, documenter l'API existante avec une spec OpenAPI/Swagger. Cela force à clarifier les contrats et facilitera la migration backend (voir §8).

```bash
npm install @asteasolutions/zod-to-openapi
# Les schémas Zod sont déjà en place → génération automatique
```

### 3.2 🟡 Priorité Moyenne (avant features complexes)

#### Action 5 — Infrastructure de Queue Async

Pour tout traitement > 2 secondes (rapport complexe, import, batch), il faut une queue.

```
Options recommandées :
├── Vercel Cron + Vercel Queue (intégré, serverless)
├── Trigger.dev (open-source, self-hostable)
└── BullMQ + Redis (si self-hosted)
```

Architecture cible :

```
Client → POST /api/jobs/[type] → JobService → Queue
                                              ↓
                                          Worker (background)
                                              ↓
                                      Webhook / SSE → Client
```

#### Action 6 — Conventions de Feature Flag

Permettre d'activer/désactiver des features sans redéploiement :

```typescript
// src/lib/features.ts
const FEATURES = {
  COMPARATEUR_BIEN: process.env.NEXT_PUBLIC_FEATURE_COMPARATEUR === "true",
  MODULE_PATRIMOINE: process.env.NEXT_PUBLIC_FEATURE_PATRIMOINE === "true",
} as const;

// Usage dans les composants
if (FEATURES.MODULE_PATRIMOINE) { ... }
```

Stocker les feature flags dans `config_params` (BDD) pour les activer sans redéploiement.

#### Action 7 — Pagination Curseur sur les Simulations

```typescript
// ACTUEL : pas de pagination → SELECT * peut devenir lent
// CIBLE : cursor-based pagination

// GET /api/simulations?cursor=<id>&limit=20
const { data } = await supabase
  .from('simulations')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20)
  .gt('id', cursor); // cursor-based, pas OFFSET
```

---

## 4. Stratégie de Maintenabilité

### 4.1 Conventions de Code à Gravir dans Pierre

> [!NOTE]
> Ces conventions doivent être documentées dans `docs/devs-guide/` et vérifiées en CI.

| Convention                               | Outil                                       | Statut       |
| ---------------------------------------- | ------------------------------------------- | ------------ |
| `any` interdit                           | ESLint `@typescript-eslint/no-explicit-any` | ✅ En place  |
| Tests obligatoires sur tout nouveau code | Vitest, seuil 50%                           | ✅ En place  |
| Lint 0 warning                           | `eslint --max-warnings 0`                   | ✅ En place  |
| Pas d'import circulaire                  | `eslint-plugin-import/no-cycle`             | 🔲 À ajouter |
| ADR (Architecture Decision Records)      | Markdown dans `docs/adr/`                   | 🔲 À créer   |
| Changelog automatique                    | `semantic-release` ou `changesets`          | 🔲 À évaluer |

### 4.2 Architecture Decision Records (ADR)

Avant chaque décision technique structurante, rédiger un ADR dans `docs/adr/` :

```
docs/adr/
├── 001-monolith-vs-microservices.md
├── 002-better-auth-vs-supabase-auth.md
├── 003-redis-pour-rate-limiting.md
└── 004-migration-backend-python.md
```

Format standard :

```markdown
# ADR-XXX : [Titre]

**Statut** : Proposé | Accepté | Déprécié
**Contexte** : Pourquoi cette décision est nécessaire
**Décision** : Ce qui a été décidé
**Conséquences** : Trade-offs
```

### 4.3 Versioning Sémantique des API

Introduire le versioning d'API dès maintenant pour éviter des breaking changes :

```
/api/v1/calculate     ← version actuelle
/api/v2/calculate     ← future version avec nouveau format
```

Même pour un monolithe, cela protège les consommateurs futurs (applications mobiles, partenaires, etc.).

### 4.4 Tests — Cibles de Couverture par Domaine

| Couche           | Cible actuelle | Cible recommandée         |
| ---------------- | -------------- | ------------------------- |
| Moteur de calcul | 84%            | ≥ 90%                     |
| API Routes       | ~60%           | ≥ 75%                     |
| Services admin   | ~50%           | ≥ 70%                     |
| Composants UI    | Non couvert    | ≥ 60% (Storybook + tests) |

---

## 5. Scalabilité Applicative

### 5.1 Scalabilité Verticale vs Horizontale

```
ACTUEL : Monolithe Next.js sur Vercel Serverless
         → Scale automatique par fonction (horizontal implicite)
         → Limite : 10s timeout (hobby) / 60s (pro) / 300s (enterprise)

CIBLE à terme :
         Frontend (statique/SSR) ←→ BFF/Gateway ←→ Backends spécialisés
```

### 5.2 Stratégie de Découpage Progressive

Le monolithe peut évoluer en **"Modular Monolith → Macroservices"** sans refonte brutale :

```
Phase 1 (maintenant)  : Monolithe modulaire — tout dans Next.js
Phase 2 (> 3 features): Extraction du moteur de calcul en service séparé
Phase 3 (scaling B2B) : BFF Pattern + services autonomes par domaine
Phase 4 (SaaS mature) : Microservices sélectifs uniquement pour les domaines à fort trafic
```

> [!WARNING]
> **Ne pas prématurément extraire en microservices.** Le coût opérationnel (observabilité distribuée, latence réseau, gestion des erreurs partielles) dépasse largement les bénéfices tant que le monolithe tient la charge.

### 5.3 Mise en Cache Multicouche

```
Navigateur  → Cache HTTP (Cache-Control, ETag)
CDN Vercel  → Edge Cache (ISR, Route Cache)
Application → Redis/KV (ConfigService, sessions lourdes)
BDD         → PgBouncer (pool de connexions), Materialized Views
```

Points d'action concrets :

- Activer ISR (`revalidate`) sur les pages publiques (`/`, `/en-savoir-plus`)
- Mettre en cache les résultats de `/api/simulations` 30s avec `stale-while-revalidate`
- Considérer `pgbouncer` via Supabase si > 100 connexions simultanées

### 5.4 Base de Données — Évolution du Schéma

```sql
-- Index à créer maintenant (si pas déjà présents)
CREATE INDEX CONCURRENTLY idx_simulations_user_created
  ON simulations(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_config_params_bloc_cle
  ON config_params(annee_fiscale, bloc, cle);

-- Partitionnement à prévoir (> 100K simulations)
CREATE TABLE simulations_2026 PARTITION OF simulations
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

---

## 6. Détachement de Vercel — Multi-Cluster & Self-Hosting

### 6.1 Dépendances Vercel Actuelles

| Dépendance            | Service             | Effort de remplacement                        |
| --------------------- | ------------------- | --------------------------------------------- |
| Hosting SSR/SSG       | Vercel Hosting      | 🟡 Moyen (Next.js sur n'importe quel Node.js) |
| Serverless Functions  | Vercel Functions    | 🟡 Moyen (AWS Lambda, Fly.io, Render)         |
| Edge Middleware       | Vercel Edge Runtime | 🟠 Complexe (dépend des API Edge)             |
| Vercel KV (si adopté) | Upstash Redis       | 🟢 Facile (changer la config Redis)           |
| CI/CD Preview         | Vercel Preview URLs | 🟢 Facile (GitHub Actions + AWS/GCP)          |

### 6.2 Architecture Self-Hosted Cible

```
Internet
   │
   ▼
[Nginx / Traefik]  ← Load Balancer / Reverse Proxy
   │
   ├── [Next.js Frontend]  × N instances (Docker)
   │         └── /static → S3/CloudFront (assets)
   │
   ├── [API Gateway]  ← optionnel (Kong, Nginx, Traefik)
   │         │
   │         ├── /api/calculate → [Calculation Service]  (Node.js ou Python)
   │         ├── /api/pdf       → [PDF Service]          (Node.js)
   │         ├── /api/auth      → [Auth Service]          (Better Auth)
   │         └── /api/admin     → [Admin Service]         (Node.js)
   │
   └── [PostgreSQL]  ← Supabase self-hosted ou RDS/CloudSQL
             └── [PgBouncer]  ← Pool de connexions
```

### 6.3 Compatibilité Next.js avec d'autres Hébergeurs

Next.js 16 peut être déployé en dehors de Vercel avec le **standalone output** :

```javascript
// next.config.js — à activer dès maintenant
module.exports = {
  output: 'standalone', // Produit un bundle Node.js auto-suffisant
};
```

Cela génère un dossier `.next/standalone/` déployable sur :

- **Fly.io** — instances persistantes, latence faible
- **Railway** — déploiement simple depuis Git
- **AWS ECS / GCP Cloud Run** — conteneurs managés
- **VPS bare metal** — contrôle total

### 6.4 Plan de Migration Progressive de Vercel

```
Étape 1 : Ajouter output: "standalone" dans next.config.js
Étape 2 : Containeriser avec Docker (voir §7)
Étape 3 : Tester le déploiement sur Fly.io ou Railway en staging
Étape 4 : Migrer la BDD vers Supabase self-hosted ou RDS
Étape 5 : Configurer Nginx/Traefik comme edge layer
Étape 6 : Basculer le DNS production
```

---

## 7. Containerisation Docker

### 7.1 Dockerfile Production (Next.js Standalone)

```dockerfile
# Dockerfile
FROM node:22-alpine AS base

# ─── Dependencies ────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# ─── Builder ─────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Runner ──────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 7.2 Docker Compose (Développement local complet)

```yaml
# docker-compose.yml
version: '3.9'

services:
  app:
    build:
      context: .
      target: builder
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/renta_immo
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  postgres:
    image: supabase/postgres:15.1.0.117
    environment:
      POSTGRES_DB: renta_immo
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  # Service de calcul Python (anticipation migration §8)
  calc-service:
    build: ./services/calculation-python
    ports:
      - '8001:8001'
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/renta_immo

volumes:
  postgres_data:
  redis_data:
```

### 7.3 Docker Compose Production (Multi-instances)

```yaml
# docker-compose.prod.yml
services:
  app:
    image: renta-immo:${VERSION}
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first # Zero-downtime rolling update
      restart_policy:
        condition: on-failure

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/certs:/etc/nginx/certs
    depends_on:
      - app
```

### 7.4 .dockerignore

```
node_modules
.next
.git
*.md
tests/e2e
.env*
!.env.example
```

### 7.5 CI/CD avec Docker

```yaml
# .github/workflows/docker.yml
- name: Build & Push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      ghcr.io/${{ github.repository }}:latest
      ghcr.io/${{ github.repository }}:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

---

## 8. Migration Backend (Python / autre)

### 8.1 Pourquoi Migrer le Backend ?

| Raison                        | Détail                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Performance calculs**       | Python + NumPy/Numba = 10-100x plus rapide pour calculs matriciels (projections, TRI sur gros portefeuilles) |
| **Écosystème ML/IA**          | Pandas, scikit-learn, PyTorch pour scoring prédictif, recommandations                                        |
| **Bibliothèques financières** | `numpy-financial`, `QuantLib` — non disponibles en JS                                                        |
| **Interopérabilité**          | API REST/gRPC consommable par mobile, partenaires                                                            |

### 8.2 Stratégie de Migration — Étrangler le Monolithe (Strangler Fig Pattern)

> [!IMPORTANT]
> **Ne pas réécrire from scratch.** Extraire progressivement les modules lourds vers Python sans arrêter le service.

```
Phase 1 : Proxy transparent
  Next.js /api/calculate → [Proxy] → Python FastAPI /calculate
  (le client ne voit aucun changement)

Phase 2 : Coexistence
  Routes simples       → Next.js (restent en Node.js)
  Calculs complexes    → Python FastAPI
  ML / scoring         → Python FastAPI

Phase 3 : Next.js devient BFF pur
  Next.js = Frontend + API Gateway + Auth
  Python  = Calcul, ML, Analytics
```

### 8.3 Architecture du Service Python Cible

```
services/
└── calculation-service/          ← Service Python indépendant
    ├── pyproject.toml
    ├── Dockerfile
    ├── src/
    │   ├── main.py               ← FastAPI app
    │   ├── routers/
    │   │   ├── calculate.py      ← POST /calculate
    │   │   ├── projection.py     ← POST /projection
    │   │   └── scoring.py        ← POST /scoring
    │   ├── domain/
    │   │   ├── rentabilite.py
    │   │   ├── fiscalite.py
    │   │   ├── hcsf.py
    │   │   └── projection.py
    │   ├── config/
    │   │   └── config_service.py ← Même logique que le TS
    │   └── tests/
    │       └── test_*.py         ← pytest, couverture ≥ 90%
    └── requirements.txt
```

### 8.4 Interface de Communication

**Option A (recommandée) : REST/JSON**

```typescript
// src/server/calculations/index.ts
// Remplace le calcul local par un appel HTTP
async function performCalculations(input: CalculateurFormData): Promise<CalculResultats> {
  const response = await fetch(`${process.env.CALC_SERVICE_URL}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(10000), // 10s max
  });
  return response.json() as Promise<CalculResultats>;
}
```

**Option B : gRPC (recommandé si < 1ms de latence critique)**

```proto
// proto/calculation.proto
service CalculationService {
  rpc Calculate (CalculationRequest) returns (CalculationResponse);
  rpc ProjectPortfolio (ProjectionRequest) returns (ProjectionResponse);
}
```

**Option C : Python dans Node.js (solution intermédiaire sans API)**

```typescript
import { spawn } from 'child_process';
// Exécuter un script Python directement (monolithe hybride)
// Simple mais non scalable — à éviter pour la prod
```

### 8.5 Parité des Tests lors de la Migration

Avant toute migration d'un module :

1. **Extraire les cas de test existants** (Vitest → pytest via conversion automatique)
2. **Implémenter en Python**
3. **Vérifier la parité numérique** (même arrondi, même résultats à 8 décimales)
4. **Shadow mode** : exécuter les deux implémentations en parallèle et comparer les résultats
5. **Basculer** uniquement si les tests de parité sont verts à 100%

```python
# tests/parity/test_rentabilite_parity.py
def test_rentabilite_matches_typescript_reference():
    """Vérifie que Python donne les mêmes résultats que les fixtures TypeScript."""
    fixtures = load_fixtures("tests/fixtures/rentabilite.json")
    for fixture in fixtures:
        result = calculate_rentabilite(fixture["input"])
        assert_close(result.rendement_brut, fixture["expected"]["rendement_brut"], rel_tol=1e-8)
```

---

## 9. Gouvernance des Données & Sécurité à l'Échelle

### 9.1 Multi-Tenancy — Anticipation

Si l'application évolue vers un modèle où des organisations (agences, conseillers CGP) gèrent leurs clients, il faut un modèle de multi-tenancy.

**Stratégie recommandée : Row-Level Multi-Tenancy (le plus simple)**

```sql
-- Ajouter sur TOUTES les nouvelles tables dès maintenant
ALTER TABLE simulations ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- RLS par organisation
CREATE POLICY "org_isolation" ON simulations
  USING (organization_id = current_setting('app.current_org')::UUID);
```

### 9.2 RGPD & Données Personnelles

| Donnée                      | Localisation               | Action                                              |
| --------------------------- | -------------------------- | --------------------------------------------------- |
| Email utilisateur           | `user.email` (Better Auth) | Implémenter `DELETE /api/account` (droit à l'oubli) |
| Simulations                 | Table `simulations`        | Anonymisation ou suppression sur demande            |
| Logs erreurs (Sentry futur) | Sentry Cloud               | Configurer PII scrubbing                            |

### 9.3 Secrets Management

```
ACTUEL : Variables d'env Vercel (suffisant pour 1 app)

CIBLE (multi-déploiements) :
├── HashiCorp Vault (self-hosted)
├── AWS Secrets Manager
└── Doppler (recommandé — intégration simple, multi-env)
```

### 9.4 Audit Trail

`config_params_audit` est un bon début. Étendre à toutes les entités sensibles :

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,    -- 'simulation', 'user', 'config_param'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,          -- 'CREATE', 'UPDATE', 'DELETE'
  actor_id TEXT,                 -- user.id
  actor_ip INET,
  payload JSONB,                 -- diff avant/après
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 10. Roadmap Technique Recommandée

### Phase 0 — Fondations (Avant la prochaine feature) `~2 semaines`

- [ ] Remplacer rate limiting par Upstash Redis / Vercel KV
- [ ] Intégrer Sentry (error tracking + performance)
- [ ] Ajouter `output: "standalone"` dans `next.config.js`
- [ ] Ajouter index PostgreSQL sur `simulations` et `config_params`
- [ ] Créer `docs/adr/` avec les premières décisions documentées
- [ ] Ajouter règle ESLint `import/no-cycle`
- [ ] Configurer pagination curseur sur `/api/simulations`

### Phase 1 — Feature Development Ready `~1 mois`

- [ ] Créer `docker-compose.yml` de développement local complet
- [ ] Créer le `Dockerfile` production (standalone)
- [ ] Tester le déploiement sur Fly.io ou Railway (staging)
- [ ] Implémenter Feature Flags (env vars + BDD)
- [ ] Spécification OpenAPI des endpoints existants
- [ ] Pipeline Docker dans GitHub Actions (build + push GHCR)

### Phase 2 — Scalabilité `~2-3 mois`

- [ ] Infrastructure de queue async (Trigger.dev ou Vercel Queue)
- [ ] Cache Redis distribué pour ConfigService
- [ ] Supabase self-hosted (ou migration vers RDS/Neon)
- [ ] Multi-instances avec Docker Compose prod + Nginx
- [ ] Secrets management (Doppler ou Vault)
- [ ] Audit log générique

### Phase 3 — Migration Backend `En parallèle des features`

- [ ] Créer `services/calculation-service/` (FastAPI Python)
- [ ] Implémenter le module `rentabilite.py` avec tests de parité
- [ ] Mode shadow (Python + Node.js en parallèle)
- [ ] Migrer progressivement les modules (`fiscalite`, `hcsf`, `projection`)
- [ ] Configurer gRPC ou REST entre Next.js et le service Python
- [ ] Supprimer le code TypeScript de calcul remplacé

### Phase 4 — SaaS Ready `Horizon 6-12 mois`

- [ ] Multi-tenancy (organizations, RBAC par org)
- [ ] API publique versionnée (partenaires, mobile)
- [ ] Marketplace de plugins/features configurables
- [ ] Kubernetes ou Fly.io Machines (autoscaling avancé)
- [ ] CDN assets séparé (S3 + CloudFront)

---

## Annexe — Checklist "Nouvelle Feature"

> Avant chaque nouveau développement, valider cette checklist :

```markdown
## Checklist Nouvelle Feature

### Conception

- [ ] ADR rédigé si décision architecturale non triviale
- [ ] Domaine bien isolé (`src/app|server|components|stores/[feature]/`)
- [ ] Pas d'import circulaire avec d'autres domaines
- [ ] Considéré multi-tenancy si données utilisateur
- [ ] Feature flag défini si rollout progressif nécessaire

### Base de données

- [ ] Migration SQL dans `supabase/migrations/` avec timestamp
- [ ] Index créés sur les colonnes fréquemment filtrées
- [ ] RLS configuré si données sensibles
- [ ] Colonne `organization_id` ajoutée si données B2B

### API

- [ ] Endpoints versionnés (`/api/v1/`)
- [ ] Validation Zod sur tous les inputs
- [ ] Format d'erreur standard respecté
- [ ] Rate limiting configuré si endpoint public
- [ ] OpenAPI spec mise à jour

### Tests

- [ ] Tests unitaires sur la logique métier (≥ 80% coverage)
- [ ] Tests d'intégration sur les API Routes
- [ ] Tests E2E Playwright si parcours UI critique
- [ ] Tests de régression si calculs financiers

### Déploiement

- [ ] Variables d'env documentées dans `.env.example`
- [ ] Feature flag désactivé par défaut en prod
- [ ] Monitoring Sentry configuré pour les nouvelles erreurs
- [ ] Rollback plan défini
```

---

_Document maintenu par l'équipe Architecture — Mettre à jour après chaque décision technique majeure._
