# Architecture Fullstack - Renta_Immo

> **Version** : 4.0
> **Date** : 2026-02-20
> **Auteur** : Winston (Architecte)
> **Statut** : Production — Back-Office Config opérationnel

---

## 1. Introduction

Ce document formalise l'architecture fullstack complète pour **Renta_Immo**, un simulateur de rentabilité immobilière. Il couvre l'ensemble des couches : frontend Next.js, moteur de calcul, persistance Supabase, authentification Better Auth, génération PDF, envoi d'email et back-office de configuration.

### 1.1 Objectifs Architecturaux

| Objectif        | Description                                           |
| --------------- | ----------------------------------------------------- |
| **Autonomie**   | Zéro dépendance externe non maîtrisée (n8n supprimé)  |
| **Performance** | Calculs < 500ms, PDF < 2s                             |
| **Type-safety** | TypeScript strict, types partagés frontend/backend    |
| **Conformité**  | Paramètres fiscaux configurables sans redéploiement   |
| **Sécurité**    | Authentification robuste, RBAC admin, RLS BDD         |
| **DX**          | Migrations automatiques, dev bypass admin, 136+ tests |

### 1.2 Documents de Référence

| Document                    | Chemin                                              |
| --------------------------- | --------------------------------------------------- |
| PRD                         | `docs/prd.md`                                       |
| Guide développeur           | `docs/devs-guide/guidance-devs-2026-01-29.md`       |
| Audit conformité simulateur | `docs/audit/rapport-audit-simulateur-2026-02-18.md` |

### 1.3 Changelog

| Date       | Version | Description                                           |
| ---------- | ------- | ----------------------------------------------------- |
| 2026-01-25 | 1.0     | Création initiale (backend)                           |
| 2026-01-29 | 2.0     | Ajout Projections/TRI                                 |
| 2026-02-04 | 3.0     | Architecture Fullstack complète                       |
| 2026-02-20 | 4.0     | Better Auth · Back-Office Config · Email · Routing V2 |

---

## 2. Vue d'Ensemble Technique

### 2.1 Résumé

Renta_Immo est une application **monolithique modulaire** déployée sur Vercel, combinant un frontend Next.js 14 (App Router) avec un backend de calcul intégré via API Routes. La persistance est assurée par Supabase (PostgreSQL), l'authentification par Better Auth (connexion directe `pg`), la génération de rapports par `@react-pdf/renderer` côté serveur, et l'envoi d'emails par Resend.

### 2.2 Infrastructure

| Service              | Fournisseur                            | Usage                                       |
| -------------------- | -------------------------------------- | ------------------------------------------- |
| Hosting + API        | Vercel                                 | SSG/SSR, Serverless Functions, Edge Network |
| Base de données      | Supabase (PostgreSQL 15+)              | Simulations, Config, Users                  |
| Authentification     | **Better Auth**                        | Email/password + Google OAuth               |
| Email transactionnel | Resend                                 | Envoi simulations PDF                       |
| Migrations           | Script Node.js (`scripts/migrate.mjs`) | Auto au `dev` et `build`                    |

**Régions** : Auto (Vercel Edge) + EU-West (Supabase)

### 2.3 Diagramme d'Architecture

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                     UTILISATEUR                          │
                    └───────────────────────────┬─────────────────────────────┘
                                                │
                    ┌───────────────────────────▼─────────────────────────────┐
                    │               VERCEL EDGE NETWORK                        │
                    │          (CDN · SSL · Auto-scaling · Middleware)         │
                    └───────────────────────────┬─────────────────────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────┐
         │                                      │                                  │
         ▼                                      ▼                                  ▼
┌─────────────────────┐           ┌─────────────────────┐         ┌─────────────────────┐
│   PAGES NEXT.JS     │           │   API ROUTES         │         │   SUPABASE          │
│   (App Router)      │           │   (Serverless)       │         │   (PostgreSQL)      │
│                     │           │                      │         │                     │
│ /                   │           │ /api/calculate       │◄───────►│ simulations         │
│ /calculateur        │           │ /api/pdf             │         │ config_params       │
│ /calculateur/result │           │ /api/send-simulation │         │ config_params_audit │
│ /simulations/[id]   │           │ /api/simulations     │         │ user (Better Auth)  │
│ /auth/login|signup  │           │ /api/auth/[...all]   │         │ session · account   │
│ /account            │           │ /api/admin/*         │         │                     │
│ /admin/params       │           │                      │         │ RLS: deny-all       │
│ /en-savoir-plus     │           └──────────┬───────────┘         │ (service role only) │
└─────────────────────┘                      │                     └─────────────────────┘
                                             │
                    ┌────────────────────────▼────────────────────────────────┐
                    │                SERVICES MÉTIER                           │
                    │                                                           │
                    │  src/server/calculations/   (Moteur de calcul)           │
                    │  validate → rentabilite → fiscalite → hcsf               │
                    │              → synthese → projection                     │
                    │                                                           │
                    │  src/server/config/ConfigService  (cache 5min, 40 params)│
                    │  src/server/admin/  (alerts-service · dry-run-service)   │
                    └────────────────────────────────────────────────────────┘
                                             │
                    ┌────────────────────────▼────────────────────────────────┐
                    │             SERVICES EXTERNES                            │
                    │         Better Auth (pg) · Resend API                   │
                    └─────────────────────────────────────────────────────────┘
```

### 2.4 Patterns Architecturaux

| Pattern                | Implémentation                                | Rationale                                 |
| ---------------------- | --------------------------------------------- | ----------------------------------------- |
| **Monolith Modulaire** | Next.js App Router + `src/server/`            | Simplicité, types partagés, deploy unifié |
| **Repository Pattern** | `src/lib/supabase/`                           | Testabilité, isolation BDD                |
| **BFF**                | API Routes adaptées au frontend               | Optimisation payloads                     |
| **Service Singleton**  | `ConfigService` (cache in-memory)             | Performance, isolation                    |
| **RBAC**               | Colonne `role` dans `user` + `requireAdmin()` | Sécurité back-office                      |
| **Config as Data**     | Paramètres fiscaux en BDD                     | Agilité réglementaire                     |

---

## 3. Stack Technique

| Catégorie            | Technologie                           | Version    |
| -------------------- | ------------------------------------- | ---------- |
| Framework            | Next.js                               | 14.2.23    |
| Langage              | TypeScript                            | 5.7.3      |
| CSS                  | Tailwind CSS                          | 3.4.17     |
| State (client)       | Zustand                               | 5.0.11     |
| Data fetching        | React Query (@tanstack)               | 5.90.21    |
| Forms                | React Hook Form + @hookform/resolvers | 7.71.1     |
| Validation           | Zod                                   | 4.3.6      |
| **Authentification** | **Better Auth**                       | **1.4.18** |
| BDD (browser)        | @supabase/ssr + @supabase/supabase-js | 0.8 / 2.94 |
| BDD (Better Auth)    | pg (node-postgres)                    | 8.18       |
| PDF                  | @react-pdf/renderer                   | 4.3.2      |
| **Email**            | **Resend**                            | **6.9.2**  |
| Icons                | Lucide React                          | 0.574      |
| Charts               | Recharts                              | 3.7.0      |
| Toasts               | React Hot Toast                       | 2.6.0      |
| Tests unitaires      | Vitest                                | 4.0.18     |
| Tests E2E            | Playwright                            | 1.58.2     |
| CI/CD                | GitHub Actions + Vercel               | —          |
| Git hooks            | Husky + lint-staged                   | 9.1.7      |

---

## 4. Authentification (Better Auth)

### 4.1 Architecture

L'authentification utilise **Better Auth** — pas Supabase Auth. Better Auth se connecte directement à PostgreSQL via `pg` et gère ses propres tables (`user`, `session`, `account`).

```
src/lib/
├── auth.ts           # Configuration Better Auth (serveur uniquement)
├── auth-client.ts    # Client Better Auth (browser)
└── auth-helpers.ts   # requireAdmin(), getSessionWithRole()
```

**Providers supportés** : Email/password + Google OAuth.

### 4.2 Gestion des rôles (RBAC)

Le rôle est stocké dans la colonne `role TEXT` de la table `user` (valeurs : `'user'` | `'admin'`).

Flux de vérification pour les routes admin :

1. `requireAdmin()` appelle `getSessionWithRole()`
2. Vérifie le cookie Better Auth via `auth.api.getSession()`
3. Lit le rôle en BDD (pas dans le token JWT)
4. Retourne `403 FORBIDDEN` si `role !== 'admin'`

**Bypass développement** : Si `DEV_ADMIN_ID` et `DEV_ADMIN_EMAIL` sont définis dans `.env.local`, le système retourne directement un utilisateur admin (uniquement en `NODE_ENV=development`).

### 4.3 Middleware de protection

Le middleware Next.js (`src/middleware.ts`) protège :

- `/simulations/*` → redirige vers `/auth/login` si pas de cookie de session
- `/auth/*` → redirige vers `/` si déjà connecté

### 4.4 Pages

| Route          | Usage                                   |
| -------------- | --------------------------------------- |
| `/auth/login`  | Connexion email/password + Google OAuth |
| `/auth/signup` | Création de compte                      |
| `/account`     | Profil utilisateur                      |

---

## 5. Back-Office de Configuration (Sprint 4)

### 5.1 Principe

Les paramètres fiscaux et réglementaires (~40 valeurs : taux PS, abattements, HCSF, DPE, etc.) sont stockés en base de données et modifiables via le back-office admin **sans redéploiement**. Le moteur de calcul les charge via `ConfigService` avec un cache in-memory de 5 minutes. En cas d'erreur BDD, un fallback hardcodé prend le relais.

### 5.2 Architecture

```
src/server/config/
├── config-types.ts    # ConfigParam, ResolvedConfig (~40 champs), CLE_TO_FIELD
└── config-service.ts  # Singleton, cache TTL 5min, fallback hardcodé

src/server/admin/
├── alerts-service.ts  # Alertes paramètres temporaires/expirés
└── dry-run-service.ts # Simulation calcul avec nouveaux params (sans sauvegarde)

src/app/api/admin/
├── params/route.ts              # GET, POST
├── params/[id]/route.ts         # PATCH, DELETE
├── params/[id]/audit/route.ts   # GET historique
├── alerts/route.ts              # GET alertes expiration
└── dry-run/route.ts             # POST simulation impact

src/components/admin/
├── ParamsTable.tsx
├── EditParamModal.tsx
├── AuditHistoryModal.tsx
├── DryRunPanel.tsx
└── ExpirationBanner.tsx
```

### 5.3 Tables BDD

**`config_params`** — Paramètres configurables

| Colonne           | Type          | Description                                                                                                |
| ----------------- | ------------- | ---------------------------------------------------------------------------------------------------------- |
| `id`              | UUID PK       |                                                                                                            |
| `annee_fiscale`   | INTEGER       | Ex : 2026                                                                                                  |
| `bloc`            | TEXT          | `fiscalite` \| `hcsf` \| `plus_value` \| `foncier` \| `dpe` \| `lmp_scoring` \| `charges` \| `projections` |
| `cle`             | TEXT          | SCREAMING_SNAKE_CASE — UNIQUE par (annee, bloc, cle)                                                       |
| `valeur`          | DECIMAL(20,8) |                                                                                                            |
| `unite`           | TEXT          | `decimal` \| `euros` \| `annees` \| `pourcentage`                                                          |
| `is_temporary`    | BOOLEAN       | Dispositif fiscal temporaire                                                                               |
| `date_expiration` | DATE          | Expiration du dispositif                                                                                   |

**`config_params_audit`** — Historique des modifications

| Colonne                               | Type                      | Description                      |
| ------------------------------------- | ------------------------- | -------------------------------- |
| `config_id`                           | UUID → `config_params.id` |                                  |
| `ancienne_valeur` / `nouvelle_valeur` | DECIMAL                   |                                  |
| `modifie_par`                         | TEXT → `user.id`          |                                  |
| `motif`                               | TEXT                      | Justification de la modification |

### 5.4 Blocs de paramètres

| Bloc          | Exemples de clés                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `fiscalite`   | TAUX_PS_FONCIER, TAUX_PS_REVENUS_BIC_LMNP, MICRO_FONCIER_ABATTEMENT, IS_TAUX_REDUIT, FLAT_TAX     |
| `foncier`     | DEFICIT_FONCIER_PLAFOND_IMPUTATION, DEFICIT_FONCIER_PLAFOND_ENERGIE, DEFICIT_FONCIER_DUREE_REPORT |
| `plus_value`  | PLUS_VALUE_TAUX_IR, PLUS_VALUE_TAUX_PS, PLUS_VALUE_SEUIL_SURTAXE                                  |
| `hcsf`        | HCSF_TAUX_MAX, HCSF_DUREE_MAX_ANNEES, HCSF_PONDERATION_LOCATIFS, HCSF_DUREE_MAX_ANNEES_VEFA       |
| `dpe`         | DECOTE_DPE_FG, DECOTE_DPE_E                                                                       |
| `lmp_scoring` | LMP_SEUIL_ALERTE, LMP_SEUIL_LMP, RESTE_A_VIVRE_SEUIL_MIN                                          |
| `charges`     | DEFAULTS_ASSURANCE_PNO, NOTAIRE_TAUX_ANCIEN, FRAIS_REVENTE_TAUX_AGENCE_DEFAUT                     |
| `projections` | PROJECTION_INFLATION_LOYER, PROJECTION_INFLATION_CHARGES, PROJECTION_REVALORISATION_BIEN          |

---

## 6. Data Models

### 6.1 Input de Simulation (`CalculateurFormData`)

5 sections : `bien`, `financement`, `exploitation`, `structure`, `options`.

**Champs notables ajoutés depuis V3 :**

| Section            | Champ                              | Description                                 |
| ------------------ | ---------------------------------- | ------------------------------------------- |
| `BienData`         | `dpe?: DPE`                        | Classe énergétique A→G (scoring + décotes)  |
| `BienData`         | `is_vefa?: boolean`                | VEFA → durée HCSF 27 ans                    |
| `BienData`         | `renovation_energetique?: boolean` | Déficit foncier majoré                      |
| `BienData`         | `part_terrain?: number`            | Part terrain paramétrée                     |
| `FinancementData`  | `mode_assurance?`                  | `capital_initial` \| `capital_restant_du`   |
| `ExploitationData` | `taux_occupation?: number`         | Taux d'occupation (défaut 0.92)             |
| `StructureData`    | `mode_amortissement?`              | `simplifie` \| `composants`                 |
| `OptionsData`      | `profil_investisseur?`             | `rentier` \| `patrimonial` (scoring dual)   |
| `OptionsData`      | `ponderation_loyers?`              | Pondération HCSF (défaut 70, avec GLI → 80) |
| `OptionsData`      | `prix_revente?`                    | Prix cible pour calcul plus-value           |
| `OptionsData`      | `duree_detention?`                 | Durée de détention (abattements PV)         |
| `OptionsData`      | `taux_agence_revente?`             | Frais agence à la revente                   |

### 6.2 Résultats de Simulation (`CalculResultats`)

| Champ                         | Type                         | Description                                  |
| ----------------------------- | ---------------------------- | -------------------------------------------- |
| `rentabilite`                 | `RentabiliteResultat`        | Brute, nette, nette-nette, effet levier      |
| `cashflow`                    | `CashflowResultat`           | Mensuel/annuel brut et net                   |
| `financement`                 | `FinancementResultat`        | Mensualité, frais notaire (tranches réelles) |
| `fiscalite`                   | `FiscaliteResultat`          | Impôt estimé, net en poche                   |
| `hcsf`                        | `HCSFResultat`               | Taux endettement, reste à vivre              |
| `synthese`                    | `SyntheseResultat`           | Score, recommandations, alertes              |
| `projections?`                | `ProjectionData`             | Projections N ans, TRI, plus-value           |
| `tableauAmortissement?`       | `TableauAmortissement`       | Amortissement financier                      |
| `tableauAmortissementFiscal?` | `TableauAmortissementFiscal` | Amortissement LMNP réel / SCI IS             |
| `comparaisonFiscalite?`       | `FiscaliteComparaison`       | Comparaison régimes fiscaux                  |

**Champs notables ajoutés depuis V3 :**

| Champ                                      | Description                                               |
| ------------------------------------------ | --------------------------------------------------------- |
| `SyntheseResultat.scores_par_profil`       | Scores pré-calculés pour Rentier et Patrimonial (V2-S16)  |
| `SyntheseResultat.points_attention_detail` | Alertes structurées (type, catégorie, conseil)            |
| `SyntheseResultat.recommandations_detail`  | Recommandations avec actions concrètes                    |
| `ProjectionData.plusValue`                 | Calcul complet plus-value à la revente                    |
| `ProjectionData.alerteApportZero`          | TRI non significatif si apport = 0 (REC-05)               |
| `ProjectionData.hypotheses`                | Inflation loyer/charges/revalorisation affichées (REC-03) |

### 6.3 Simulation (table BDD)

| Colonne                       | Type             | Description                             |
| ----------------------------- | ---------------- | --------------------------------------- |
| `id`                          | UUID PK          |                                         |
| `user_id`                     | TEXT → `user.id` | Utilisateur Better Auth                 |
| `form_data`                   | JSONB            | `CalculateurFormData` sérialisé         |
| `resultats`                   | JSONB            | `CalculResultats` sérialisé             |
| `rentabilite_brute/nette`     | DECIMAL          | Dénormalisés pour tri/filtres           |
| `cashflow_mensuel`            | DECIMAL          | Dénormalisé                             |
| `score_global`                | INTEGER          | Toujours `Math.round()` avant insertion |
| `is_favorite` / `is_archived` | BOOLEAN          |                                         |

---

## 7. API Specification

### 7.1 Endpoints

| Méthode | Endpoint                       | Description                         | Auth    |
| ------- | ------------------------------ | ----------------------------------- | ------- |
| POST    | `/api/calculate`               | Exécuter une simulation             | Non     |
| POST    | `/api/pdf`                     | Générer un rapport PDF              | Non     |
| POST    | `/api/send-simulation`         | Envoyer le PDF par email (3/min/IP) | Non     |
| GET     | `/api/simulations`             | Lister les simulations              | Session |
| GET     | `/api/simulations/[id]`        | Détail d'une simulation             | Session |
| POST    | `/api/simulations`             | Créer une simulation                | Session |
| PATCH   | `/api/simulations/[id]`        | Modifier une simulation             | Session |
| DELETE  | `/api/simulations/[id]`        | Supprimer une simulation            | Session |
| `*`     | `/api/auth/[...all]`           | Better Auth handler                 | —       |
| GET     | `/api/admin/params`            | Lister les paramètres config        | Admin   |
| POST    | `/api/admin/params`            | Créer un paramètre                  | Admin   |
| PATCH   | `/api/admin/params/[id]`       | Modifier un paramètre               | Admin   |
| DELETE  | `/api/admin/params/[id]`       | Supprimer un paramètre              | Admin   |
| GET     | `/api/admin/params/[id]/audit` | Historique modifications            | Admin   |
| GET     | `/api/admin/alerts`            | Alertes params expirés              | Admin   |
| POST    | `/api/admin/dry-run`           | Simuler l'impact d'un changement    | Admin   |

### 7.2 Format d'erreur standard

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "field": "..." } }
```

Codes : `VALIDATION_ERROR (400)` · `UNAUTHORIZED (401)` · `FORBIDDEN (403)` · `NOT_FOUND (404)` · `RATE_LIMIT (429)` · `CALCULATION_ERROR (500)` · `PDF_GENERATION_ERROR (500)` · `EMAIL_SEND_ERROR (500)`

---

## 8. Frontend Architecture

### 8.1 Composants

```
src/components/
├── ui/               # Primitives (Button, Input, Card, Alert, Collapsible)
├── layout/           # Header
├── providers/        # QueryProvider
├── forms/            # FormWizard + 6 Steps (Bien, Financement, Exploitation, Structure, Associés, Options)
├── results/          # 20+ composants Dashboard de résultats
│   ├── Dashboard.tsx           # Orchestrateur
│   ├── ScorePanel.tsx          # Score global + évaluation
│   ├── ProfilInvestisseurToggle.tsx   # Bascule Rentier / Patrimonial
│   ├── AlerteLmp.tsx           # Alertes seuil LMP
│   ├── PointsAttention.tsx
│   ├── RecommandationsPanel.tsx
│   ├── FiscalComparator.tsx
│   ├── FiscalAmortizationTable.tsx   # LMNP/SCI IS
│   ├── ProjectionTable.tsx           # Projections + hypothèses
│   ├── PatrimoineChart.tsx           # Recharts (lazy loaded)
│   └── CashflowChart.tsx             # Recharts (lazy loaded)
├── simulations/      # Simulations sauvegardées (liste, card, filtres URL)
└── admin/            # Back-office (ParamsTable, EditParamModal, AuditHistoryModal, DryRunPanel, ExpirationBanner)
```

### 8.2 State Management (Zustand)

Le store `src/stores/calculateur.store.ts` gère les scénarios multiples avec persist (localStorage). Il expose des actions atomiques par section (`updateBien`, `updateFinancement`, etc.) et des selectors pour les résultats.

### 8.3 Routing (App Router)

```
/                         → Landing publique
/en-savoir-plus           → Page d'information
/calculateur              → Formulaire wizard (6 étapes)
/calculateur/resultats    → Dashboard résultats
/simulations              → Liste (filtres URL search params)
/simulations/[id]         → Détail simulation sauvegardée
/auth/login               → Connexion
/auth/signup              → Inscription
/account                  → Profil
/admin                    → Dashboard admin
/admin/params             → Gestion paramètres fiscaux
```

Les filtres de simulations sont basés sur les URL search params (partageables, navigation browser native).

---

## 9. Backend Architecture

### 9.1 Moteur de Calcul

```
src/server/calculations/
├── index.ts        # Orchestrateur performCalculations()
├── types.ts        # Types internes
├── constants.ts    # Constantes métier (LMP.SEUIL_ALERTE, etc.)
├── validation.ts   # Validation Zod + normalisation
├── rentabilite.ts  # Brute, nette, nette-nette, frais notaire par tranches
├── fiscalite.ts    # IR/IS, micro/réel, amortissements composants, PS LMNP 18,6%
├── hcsf.ts         # Taux endettement, reste à vivre, VEFA, pondération GLI
├── projection.ts   # Projections N ans, TRI, plus-value, frais revente
├── synthese.ts     # Scoring dual profil (Rentier/Patrimonial), alertes LMP
└── __tests__/      # 136+ tests unitaires + mock-config.ts
```

L'orchestrateur charge `ResolvedConfig` via `ConfigService` avant chaque calcul. Les modules de calcul reçoivent la config en paramètre (testable via `mock-config.ts`).

### 9.2 Génération PDF

```
src/lib/pdf/
├── templates/RapportSimulation.tsx   # Template principal
├── components/                       # Header, Footer, ScoreGauge, KeyMetrics,
│                                     # CashflowWaterfall, HcsfAnalysis,
│                                     # PointsAttention, ProjectCost, PropertyDetails
└── utils/formatters.ts
```

### 9.3 Accès Base de données

Tout accès depuis les API Routes utilise `createAdminClient()` (service role key). Le client browser utilise la clé anon avec les sessions Better Auth.

---

## 10. Base de données

### 10.1 Tables

| Table                 | Propriétaire | Usage                                       |
| --------------------- | ------------ | ------------------------------------------- |
| `user`                | Better Auth  | Utilisateurs + colonne `role` (user\|admin) |
| `session`             | Better Auth  | Sessions actives                            |
| `account`             | Better Auth  | Liaisons OAuth                              |
| `simulations`         | App          | Simulations persistées                      |
| `config_params`       | App          | Paramètres fiscaux/réglementaires           |
| `config_params_audit` | App          | Historique des modifications admin          |

### 10.2 Row Level Security

RLS activé en mode "deny all" par défaut sur toutes les tables applicatives. Tout accès passe par le service role key côté serveur.

### 10.3 Migrations

Fichiers dans `supabase/migrations/`, exécutés automatiquement au démarrage via `src/instrumentation.ts` → `src/server/migrations/runner.ts`.

| Migration                               | Contenu                            |
| --------------------------------------- | ---------------------------------- |
| `20260203_better_auth_setup.sql`        | Tables Better Auth                 |
| `20260204_create_simulations_table.sql` | Table simulations + RLS            |
| `20260207_fix_rls_policies.sql`         | Corrections RLS                    |
| `20260208_fix_schema_drift.sql`         | Corrections drift schéma           |
| `20260216_sprint4_config_params.sql`    | config_params + audit + rôle admin |
| `20260218_audit_corrections.sql`        | Corrections post-audit conformité  |

---

## 11. Structure du Projet

```
renta-immo/
├── .github/workflows/ci.yaml   # CI : lint, type-check, test, build
├── docs/
│   ├── architecte/             # CE DOCUMENT
│   ├── audit/
│   ├── devs-guide/
│   └── stories/
├── scripts/
│   ├── migrate.mjs             # Runner migrations
│   └── db-status.mjs
├── supabase/migrations/        # SQL chronologiques
├── src/
│   ├── app/                    # Pages + API Routes (App Router)
│   │   ├── admin/
│   │   ├── api/ (admin · auth · calculate · pdf · send-simulation · simulations)
│   │   ├── auth/
│   │   ├── calculateur/
│   │   ├── simulations/
│   │   ├── account/
│   │   └── en-savoir-plus/
│   ├── components/ (admin · forms · layout · providers · results · simulations · ui)
│   ├── hooks/ (useScenarioFormReset · useSimulationMutations · useSimulations · useSupabase)
│   ├── lib/
│   │   ├── auth.ts / auth-client.ts / auth-helpers.ts / auth/redirect.ts
│   │   ├── email.ts (Resend) · logger.ts · rate-limit.ts
│   │   ├── api.ts · utils.ts · validators.ts · constants.ts
│   │   ├── pdf/ · supabase/
│   ├── middleware.ts
│   ├── instrumentation.ts / instrumentation.node.ts
│   ├── server/
│   │   ├── admin/ (alerts-service · dry-run-service)
│   │   ├── calculations/ (+ __tests__)
│   │   ├── config/ (config-service · config-types)
│   │   └── migrations/runner.ts
│   ├── stores/calculateur.store.ts
│   └── types/ (api · calculateur · database · database.types · index)
├── vitest.config.mts
├── playwright.config.ts
└── package.json
```

---

## 12. Workflow de Développement

### 12.1 Setup initial

```bash
npm install
cp .env.example .env.local
# Renseigner les variables d'environnement (voir 12.3)
npm run dev    # → migrations auto + Next.js dev server
```

### 12.2 Commandes

| Commande                  | Usage                                 |
| ------------------------- | ------------------------------------- |
| `npm run dev`             | Dev server (migrations auto)          |
| `npm run build`           | Build prod (migrations auto)          |
| `npm run type-check`      | Vérification TypeScript               |
| `npm run lint`            | ESLint                                |
| `npm run test`            | Vitest (136+ tests)                   |
| `npm run test:coverage`   | Coverage V8                           |
| `npm run test:regression` | Tests de régression calcul uniquement |
| `npm run test:e2e`        | Playwright                            |
| `npm run db:migrate`      | Forcer les migrations                 |
| `npm run db:status`       | État de la BDD                        |
| `npm run format`          | Prettier                              |

### 12.3 Variables d'environnement

| Variable                                    | Usage                         | Exposition         |
| ------------------------------------------- | ----------------------------- | ------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`                  | URL Supabase                  | Client             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`             | Clé anon Supabase             | Client             |
| `SUPABASE_SERVICE_ROLE_KEY`                 | Clé service Supabase          | Serveur uniquement |
| `DATABASE_URL`                              | Connexion pg pour Better Auth | Serveur uniquement |
| `BETTER_AUTH_SECRET`                        | Secret JWT (min 32 chars)     | Serveur uniquement |
| `BETTER_AUTH_URL`                           | URL publique de l'app         | Serveur            |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google (optionnel)      | Serveur            |
| `RESEND_API_KEY`                            | Envoi d'emails                | Serveur uniquement |
| `EMAIL_SENDER`                              | Adresse expéditeur            | Serveur            |
| `DEV_ADMIN_ID` / `DEV_ADMIN_EMAIL`          | Bypass auth admin (dev only)  | Dev local          |

---

## 13. Déploiement

| Composant      | Plateforme | Méthode                      |
| -------------- | ---------- | ---------------------------- |
| Frontend + API | Vercel     | Git push → auto deploy       |
| Database       | Supabase   | Migrations auto au démarrage |
| Preview        | Vercel     | PR → preview URL             |

### 13.1 Environnements

| Env         | URL                     | Notes                   |
| ----------- | ----------------------- | ----------------------- |
| Development | localhost:3000          | Bypass auth admin actif |
| Preview     | `*.vercel.app`          | Tests PR                |
| Production  | `renta-immo.vercel.app` | Live                    |

### 13.2 Pipeline CI/CD (`.github/workflows/ci.yml`)

3 jobs séquentiels — déclenchés sur push `master` et PRs (hors `docs/**` et `*.md`) :

```
quality-checks  →  unit-tests  →  build
(lint, tsc,        (vitest run     (next build,
 format:check)      --coverage,     cache .next)
                    lcov PR,
                    seuils 50%)
```

- **Coverage** : rapport lcov commenté automatiquement sur les PRs via `lcov-reporter-action`
- **Artifacts** : rapport de couverture et build `.next/` conservés 7 jours
- **Cache Next.js** : keyed sur `package-lock.json` + fichiers `.ts/.tsx`
- **Migrations** : skippées en CI (pas de BDD réelle), exécutées au déploiement Vercel
- **Dependabot** : mises à jour npm mensuelles (`.github/dependabot.yml`)

---

## 14. Sécurité

| Aspect           | Implémentation                                                  |
| ---------------- | --------------------------------------------------------------- |
| Sessions         | Better Auth — cookies httpOnly                                  |
| Rôles            | Colonne `role` en BDD, vérifiée à chaque appel API admin        |
| Route guard      | Middleware Next.js (`/simulations/*`, `/auth/*`)                |
| Accès BDD        | Service role key côté serveur uniquement                        |
| Validation input | Zod sur toutes les API Routes                                   |
| Rate limiting    | 3 req/min/IP sur `/api/send-simulation` (in-memory)             |
| Headers          | CSP, X-Frame-Options, X-Content-Type-Options (`next.config.js`) |

---

## 15. Performance

| Métrique       | Cible   |
| -------------- | ------- |
| API /calculate | < 500ms |
| API /pdf       | < 2s    |
| LCP            | < 2.5s  |
| Bundle initial | < 200KB |

**Optimisations actives :**

- Recharts importé dynamiquement (code splitting)
- React Query : `staleTime` 5min pour les simulations
- `ConfigService` : cache in-memory TTL 5min (évite les requêtes BDD répétées)
- Filtres simulations : URL search params (navigation browser native)

---

## 16. Tests

### 16.1 Structure des tests

```
tests/
├── setup.ts                        # Setup global Vitest
├── helpers/test-config.ts          # ResolvedConfig mock partagée
├── unit/
│   ├── api/                        # Tests routes API (calculate, simulations CRUD, simulations/[id])
│   ├── calculations/               # 136+ tests unitaires moteur de calcul
│   │   └── (amortissement, assurance, deficit-foncier, fiscalite, hcsf, plus-value, scoring, ...)
│   ├── stores/calculateur.store.test.ts
│   ├── hooks/useDownloadPdf.test.ts
│   └── lib/                        # format, logger, rate-limit, redirect, pdf/RapportSimulation
└── e2e/
    ├── helpers/auth.ts             # Helper Playwright authentification
    ├── auth/                       # login, logout, signup, protected-routes
    ├── simulations/                # crud, filters, pdf
    ├── calculateur/validation.spec.ts
    ├── multi-scenarios.spec.ts
    └── simulation-complete.spec.ts
```

### 16.2 Configuration

**Vitest** (`vitest.config.mts`) :

- `environment: 'node'` — adapté aux calculs purs (intentionnel)
- `setupFiles: ['./tests/setup.ts']`
- `testTimeout: 10000`
- Coverage V8 : reporters text/json/html/lcov, include `src/server/**`, `src/lib/**`, `src/stores/**`, `src/hooks/**`
- Seuils de couverture actifs : lines/functions/branches/statements = **50%**
- Couverture mesurée : 84% stmts, 75% branches, 75% funcs, 85% lines

**Playwright** (`playwright.config.ts`) :

- `baseURL` via `PLAYWRIGHT_BASE_URL` (`.env.test`) ou `localhost:3000`
- Multi-browser : Chromium + Firefox
- `webServer` actif (démarre `npm run dev`)
- Retries : 2 en CI, 0 en local

**Commandes utiles :**

| Commande                  | Usage                                 |
| ------------------------- | ------------------------------------- |
| `npm run test`            | Tous les tests unitaires              |
| `npm run test:coverage`   | Coverage avec rapport lcov            |
| `npm run test:regression` | Tests de régression calcul uniquement |
| `npm run test:e2e`        | Tests E2E Playwright                  |

---

## 17. Notes Techniques

| Note                | Détail                                                                              |
| ------------------- | ----------------------------------------------------------------------------------- |
| `for...of` sur Map  | Non supporté selon target `tsconfig.json` → utiliser `.forEach()`                   |
| `score_global`      | Type `INTEGER` en BDD → toujours `Math.round()` avant insertion                     |
| Charts Recharts     | Dynamic import dans Dashboard (code splitting)                                      |
| Filtres simulations | URL search params (shareable, back/forward nav)                                     |
| Rate limiting       | In-memory → approximatif sur Vercel serverless (plusieurs instances)                |
| ConfigService       | S'invalide après modification admin → calculs suivants utilisent la nouvelle valeur |
| Better Auth tables  | Connexion pg directe (`DATABASE_URL`) — pas via Supabase JS                         |

---

## 18. Évolutions Planifiées

### Audit Conformité Simulateur — DONE (2026-02-18)

| Item                                         | Statut |
| -------------------------------------------- | ------ |
| NC-01 PS LMNP 18,6% (LFSS 2026)              | ✅     |
| NC-02 Surtaxe PV 200k-250k                   | ✅     |
| REC-01 Frais notaire par tranches            | ✅     |
| REC-02 HCSF capacité résiduelle configurable | ✅     |
| REC-03 Hypothèses inflation affichées        | ✅     |
| REC-04 VEFA HCSF 27 ans                      | ✅     |
| REC-05 Alerte TRI apport=0                   | ✅     |

### Audit Technique — Phases restantes

| Phase                    | Statut               | Contenu                                                                                                                                                                        |
| ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 4 — Tests & DevOps | ✅ DONE (2026-02-20) | CI/CD 3 jobs optimisé, Husky+lint-staged, tests unitaires API/store/hooks/lib, E2E auth+CRUD+filtres+PDF, multi-browser, config Vitest V8. Couverture 72%+, seuils 50% actifs. |
| Phase 5 — Scalabilité    | TODO                 | Rate limiting distribué (Redis/KV), monitoring Sentry, cache Edge, pagination curseur                                                                                          |

---

_Document généré par Winston (Architecte) — Version 4.0_
