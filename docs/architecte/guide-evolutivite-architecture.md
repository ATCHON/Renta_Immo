# Guide d'Évolutivité Architecture — Renta_Immo

> **Version** : 2.0
> **Date** : 2026-03-02
> **Statut** : Référence Architecturale
> **Auteur** : Antigravity / Architecture Review
> **Remplace** : v1.0 (2026-02-27)

Ce document est le référentiel de préparation avant l'ajout de toute nouvelle fonctionnalité significative. Il couvre les points d'attention actuels, les actions concrètes à mener, et les recommandations stratégiques pour l'évolution fonctionnelle et technique de l'application sur le long terme. Il intègre les enseignements des audits techniques (2026-02-07 à 2026-02-18) et les standards 2026 (RGPD, WCAG 2.1, Core Web Vitals, OWASP Top 10 2021).

---

## Table des Matières

1. [Diagnostic de l'État Actuel](#1-diagnostic-de-létat-actuel)
2. [Gouvernance Technique & Maintenabilité](#2-gouvernance-technique--maintenabilité)
3. [Sécurité by Design](#3-sécurité-by-design)
4. [RGPD & Conformité](#4-rgpd--conformité)
5. [Accessibilité & Standards Web Modernes](#5-accessibilité--standards-web-modernes)
6. [Observabilité & Résilience](#6-observabilité--résilience)
7. [Scalabilité & Performance](#7-scalabilité--performance)
8. [Actions Immédiates — Avant Prochaine Feature](#8-actions-immédiates--avant-prochaine-feature)
9. [Infrastructure & Migration Vercel → Self-Hosted](#9-infrastructure--migration-vercel--self-hosted)
10. [Préparation IA — Anticiper sans sur-ingénierie](#10-préparation-ia--anticiper-sans-sur-ingénieur)
11. [Developer Experience](#11-developer-experience)
12. [Multi-Tenancy — Anticipations sans Over-Engineering](#12-multi-tenancy--anticipations-sans-over-engineering)
13. [Roadmap Technique Priorisée](#13-roadmap-technique-priorisée)
14. [Annexe — Checklist Nouvelle Feature](#14-annexe--checklist-nouvelle-feature)

---

## 1. Diagnostic de l'État Actuel

### 1.1 Forces

_Source : Audit technique 2026-02-07, scores confirmés_

| Force                                   | Score audit | Impact                                             |
| --------------------------------------- | ----------- | -------------------------------------------------- |
| Monolithe modulaire (`src/server/`)     | ✅          | Ajout de features sans friction d'orchestration    |
| TypeScript strict + types partagés      | ✅          | Contrats clairs entre couches, refactoring sûr     |
| API Routes Serverless (Next.js)         | ✅          | Isolation naturelle des endpoints                  |
| ConfigService (params BDD)              | ✅          | Features configurables sans redéploiement          |
| Better Auth découplé                    | ✅          | Auth réutilisable pour toute nouvelle section      |
| Migrations SQL versionnées              | ✅          | Schéma évolutif et traçable                        |
| CI/CD GitHub Actions (3 jobs)           | ✅          | Pipeline reproductible + Husky pre-commit          |
| Coverage moteur calcul > 84%            | ✅          | Filet de sécurité solide pour les refactorings     |
| 136 tests unitaires moteur calcul       | ✅          | Conformité fiscale vérifiée (LMNP, Foncier, SCI)   |
| Corrections audit conformité 2026-02-18 | ✅          | LFSS 2026, décret notaire, HCSF VEFA, TRI apport=0 |

### 1.2 Dettes Techniques

_Ordonnées par impact réel, pas par effort_

| Dette                                 | Sévérité | Impact si non traitée                                     | Horizon recommandé  |
| ------------------------------------- | -------- | --------------------------------------------------------- | ------------------- |
| Rate limiting in-memory               | 🔴 Haut  | Contournement trivial sur multi-instances Vercel          | Phase 0 (< 1 mois)  |
| Absence de monitoring/observabilité   | 🔴 Haut  | Aucune visibilité erreurs prod, SLO impossibles           | Phase 0 (< 1 mois)  |
| Pas de cache distribué ConfigService  | 🔴 Haut  | Config non cohérente si scale horizontal                  | Phase 0 (< 1 mois)  |
| Pas de pagination curseur simulations | 🟡 Moyen | Dégradation perceptible à partir de ~10K simulations/user | Phase 0 (< 1 mois)  |
| Pas de queue/worker async             | 🟡 Moyen | Génération PDF bloque la request HTTP (timeout risqué)    | Phase 2 (3-6 mois)  |
| Pas de spec OpenAPI                   | 🟡 Moyen | Contrats d'API non formalisés, refactoring risqué         | Phase 1 (1-3 mois)  |
| RGPD incomplet                        | 🟡 Moyen | Risque légal CNIL sur données financières personnelles    | Phase 3 (parallèle) |
| Accessibilité non ciblée formellement | 🟢 Bas   | Risque légal RG2A + UX dégradée                           | Phase 3 (parallèle) |
| RLS "deny-all" service role           | 🟢 Bas   | OK maintenant, à auditer si multi-tenant                  | Phase 4 (> 6 mois)  |

### 1.3 Principes Architecturaux Fondateurs

Ces 8 principes sont **non négociables**. Toute décision qui les contredit exige un ADR explicite.

1. **TypeScript strict** — Zéro `any`, interfaces partagées dans `src/types/`, inférence explicite.
2. **TDD obligatoire** — Aucun commit sans tests verts. Couverture par couche (cf. §2.5).
3. **Boundaries de domaines** — Chaque domaine est auto-contenu. Pas de cross-import direct entre domaines.
4. **Security by default** — Validation Zod sur tous les inputs API. Rate limiting activé. Headers HTTP sécurisés.
5. **Privacy by design** — Collecte minimale des données. PII scrubbing avant tout envoi externe.
6. **Observability first** — Toute erreur doit être visible. Toute métrique business doit être mesurable.
7. **Monolithe-first** — Ne pas extraire en service séparé avant que le besoin soit avéré (> 1M req/mois).
8. **Infrastructure portable** — Aucune dépendance propriétaire non remplaçable sans plan de migration.

---

## 2. Gouvernance Technique & Maintenabilité

### 2.1 Conventions de Code — État Actuel & Manquants

| Convention                          | Outil                                       | Statut       |
| ----------------------------------- | ------------------------------------------- | ------------ |
| `any` interdit                      | ESLint `@typescript-eslint/no-explicit-any` | ✅ En place  |
| Tests obligatoires                  | Vitest, couverture CI                       | ✅ En place  |
| Lint 0 warning                      | `eslint --max-warnings 0`                   | ✅ En place  |
| Pre-commit hooks                    | Husky + lint-staged                         | ✅ En place  |
| Pas d'import circulaire             | `eslint-plugin-import/no-cycle`             | 🔲 À ajouter |
| ADR (Architecture Decision Records) | Markdown `docs/adr/`                        | 🔲 À créer   |
| Changelog automatique               | Changesets                                  | 🔲 À évaluer |
| OpenAPI spec                        | Zod → openapi                               | 🔲 À créer   |

**Ajout d'`import/no-cycle` :**

```bash
npm install --save-dev eslint-plugin-import
```

```javascript
// eslint.config.js — ajouter dans la config TypeScript
import importPlugin from 'eslint-plugin-import';

{
  plugins: { import: importPlugin },
  rules: {
    'import/no-cycle': ['error', { maxDepth: 3 }],
  },
}
```

### 2.2 Architecture Decision Records (ADR)

Avant chaque décision technique structurante, rédiger un ADR dans `docs/adr/`. Trois premières décisions à documenter immédiatement :

```
docs/adr/
├── 001-monolithe-vs-microservices.md       ← Choix monolithe modulaire
├── 002-better-auth-vs-supabase-auth.md     ← Choix Better Auth
└── 003-typescript-vs-python-calculs.md     ← Maintien TypeScript pour le moteur
```

**Format standard :**

```markdown
# ADR-XXX : [Titre]

**Statut** : Proposé | Accepté | Déprécié
**Date** : YYYY-MM-DD
**Contexte** : Pourquoi cette décision est nécessaire
**Options envisagées** : A / B / C
**Décision** : Ce qui a été décidé et pourquoi
**Conséquences** : Trade-offs, risques, actions de suivi
```

### 2.3 Versioning API & Contrats

Introduire le versioning d'API immédiatement pour protéger contre les breaking changes futurs :

```
/api/v1/calculate         ← version actuelle
/api/v1/simulations       ← version actuelle
/api/v2/calculate         ← future version si format change
```

La spec OpenAPI (cf. §8.6) force à formaliser ces contrats. Générer depuis Zod :

```bash
npm install @asteasolutions/zod-to-openapi
# Les schémas Zod sont déjà en place → génération presque automatique
```

### 2.4 Boundaries de Domaines

Le monolithe modulaire n'est viable long terme que si les frontières de domaines sont **strictement respectées**. Une feature qui cross-importe d'un autre domaine crée des couplages impossibles à extraire ensuite.

**Structure imposée :**

```
src/
├── app/[feature]/           ← Pages & routes HTTP
├── app/api/[feature]/       ← Surface API
├── server/[feature]/        ← Logique métier pure
├── server/shared/           ← Primitives réutilisables (PMT, TRI, NPV)
├── components/[feature]/    ← UI par feature
├── stores/[feature].store.ts← État client Zustand
└── types/[feature].ts       ← Contrats TypeScript
supabase/migrations/
└── YYYYMMDD_[feature]_*.sql ← Schéma isolé par feature
```

**Règle absolue :** Jamais importer `src/server/calculations/` depuis `src/server/autreDomaine/`. Passer par les API Routes ou un service explicite dans `src/server/shared/`.

**Point d'attention — Couplage du moteur de calcul :** Si une future feature réutilise des calculs (calculateur crédit seul, calculateur patrimoine global), créer des primitives dans `src/server/shared/finance/` plutôt que copier du code.

### 2.5 Cibles de Couverture Tests par Couche

| Couche                 | Couverture actuelle | Cible     | Outil              |
| ---------------------- | ------------------- | --------- | ------------------ |
| Moteur de calcul       | > 84% (136 tests)   | ≥ 90%     | Vitest             |
| API Routes             | ~60%                | ≥ 75%     | Vitest intégration |
| Services admin         | ~50%                | ≥ 70%     | Vitest             |
| Composants UI          | Non couvert         | ≥ 60%     | Testing Library    |
| E2E parcours critiques | Auth + CRUD + PDF   | Maintenir | Playwright         |

---

## 3. Sécurité by Design

### 3.1 OWASP Top 10 2021 — État & Gaps

| Risque OWASP                      | Statut           | Gap / Action                                                                              |
| --------------------------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| A01 Broken Access Control         | ✅ Partiellement | RLS deny-all + service role. Vérifier que les routes `/api/admin` rejettent les non-admin |
| A02 Cryptographic Failures        | ✅               | Supabase chiffre au repos (AES-256), HTTPS forcé                                          |
| A03 Injection                     | ✅               | Supabase-js utilise des requêtes paramétrées. Validation Zod sur tous les inputs          |
| A04 Insecure Design               | 🟡 Partiel       | Rate limiting in-memory (à remplacer), pas de DAST automatisé                             |
| A05 Security Misconfiguration     | 🟡 Partiel       | Headers HTTP sécurisés (audit Phase 3), CSP à renforcer                                   |
| A06 Vulnerable Components         | 🟡 Partiel       | Dependabot absent — à activer sur GitHub                                                  |
| A07 Auth & Session Failures       | ✅               | Better Auth v1.4, session tokens sécurisés, httpOnly cookies                              |
| A08 Software Integrity Failures   | 🔲 Absent        | Pas de SBOM, pas de vérification d'intégrité des dépendances                              |
| A09 Logging & Monitoring Failures | 🔴 Absent        | Aucun monitoring prod actuellement                                                        |
| A10 SSRF                          | ✅               | Pas de fetch côté serveur vers URLs utilisateur                                           |

### 3.2 Pipeline Sécurité Automatisée

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [master, main]
  pull_request:
  schedule:
    - cron: '0 3 * * 1' # Hebdomadaire, lundi 3h

jobs:
  sast:
    name: CodeQL SAST
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
      - uses: github/codeql-action/analyze@v3

  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: actions/dependency-review-action@v4
        if: github.event_name == 'pull_request'
```

**Activer Dependabot** dans `.github/dependabot.yml` :

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    ignore:
      - dependency-name: '*'
        update-types: ['version-update:semver-patch']
```

### 3.3 Gestion des Secrets

```
ACTUEL : Variables d'env Vercel (suffisant pour mono-déploiement)
         → OK maintenant

CIBLE (multi-environnements, équipe > 3 personnes) :
├── Doppler (recommandé — intégration CLI + CI/CD, multi-env, audit trail)
└── Vault HashiCorp (self-hosted, pour migration infra §9)
```

**Rotation des secrets — procédure :**

1. Générer la nouvelle valeur (JWT secret, service role key)
2. Ajouter la nouvelle valeur en parallel (double lecture possible)
3. Redéployer
4. Invalider l'ancienne valeur
5. Consigner la rotation dans l'audit log

### 3.4 Audit Trail Générique

`config_params_audit` est un bon début. Étendre à toutes les entités sensibles :

```sql
-- supabase/migrations/YYYYMMDD_audit_log_generique.sql
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,        -- 'simulation', 'user', 'config_param'
  entity_id   UUID NOT NULL,
  action      TEXT NOT NULL,        -- 'CREATE', 'UPDATE', 'DELETE'
  actor_id    TEXT,                 -- user.id
  actor_ip    INET,
  old_values  JSONB,                -- état avant modification
  new_values  JSONB,                -- état après modification
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, created_at DESC);
```

### 3.5 Headers HTTP & CSP

État post-audit Phase 3 : headers sécurisés activés dans `next.config.js`. Points à renforcer :

```javascript
// next.config.js — renforcement CSP
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'nonce-{NONCE}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://sentry.io;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;
```

---

## 4. RGPD & Conformité

> [!IMPORTANT]
> Renta_Immo traite des données financières personnelles (revenus, crédits, structure patrimoniale, profil fiscal). Ces données relèvent de la catégorie "données financières sensibles" au sens du RGPD. La conformité n'est pas optionnelle.

### 4.1 Inventaire des Données Personnelles Traitées

| Donnée                                    | Table/Source                 | Catégorie RGPD          | Risque |
| ----------------------------------------- | ---------------------------- | ----------------------- | ------ |
| Email                                     | `better_auth.users`          | Donnée d'identification | Moyen  |
| Adresse IP                                | Logs serveur, Sentry         | Donnée technique        | Faible |
| Revenus locatifs simulés                  | `simulations.donnees_entree` | Donnée financière       | Élevé  |
| Revenus imposables (TMI)                  | `simulations.donnees_entree` | Donnée financière       | Élevé  |
| Structure patrimoniale (SCI/LMNP/Foncier) | `simulations.donnees_entree` | Donnée financière       | Élevé  |
| Capacité d'emprunt (HCSF)                 | `simulations.donnees_entree` | Donnée financière       | Élevé  |
| Scores de risque générés                  | `simulations.resultats`      | Donnée inférée          | Moyen  |
| Tokens de session                         | `better_auth.sessions`       | Donnée technique        | Moyen  |

### 4.2 Bases Légales & Finalités

| Traitement               | Base légale                   | Finalité                  | Durée légale           |
| ------------------------ | ----------------------------- | ------------------------- | ---------------------- |
| Compte utilisateur       | Contrat (Art. 6.1.b)          | Accès au service          | Durée du compte + 1 an |
| Simulations sauvegardées | Contrat (Art. 6.1.b)          | Fonctionnalité principale | Durée du compte        |
| Analytics (si activé)    | Consentement (Art. 6.1.a)     | Amélioration produit      | 13 mois (CNIL)         |
| Logs d'erreurs Sentry    | Intérêt légitime (Art. 6.1.f) | Débogage sécurité         | 90 jours               |
| Emails transactionnels   | Contrat (Art. 6.1.b)          | Notifications service     | 3 ans                  |

### 4.3 Registre des Traitements (Résumé)

_Document complet à tenir à jour par le responsable de traitement_

| Sous-traitant | Rôle                   | Localisation          | DPA signé         | Garanties                |
| ------------- | ---------------------- | --------------------- | ----------------- | ------------------------ |
| Supabase      | Base de données        | EU-West (Irlande)     | ✅ DPA disponible | SOC 2 Type II, ISO 27001 |
| Vercel        | Hébergement            | US + EU Edge          | ✅ DPA disponible | SOC 2 Type II            |
| Resend        | Emails transactionnels | US                    | 🔲 À vérifier     | SOC 2                    |
| Sentry        | Error tracking         | US + EU (configuré ?) | 🔲 À activer EU   | SOC 2 Type II            |

**Action immédiate :** Configurer Sentry sur le datacenter EU (`dsn.eu.sentry.io`) pour éviter le transfert de données hors UE.

### 4.4 Durées de Conservation & Politique de Purge

```sql
-- Purge automatique des simulations des comptes inactifs
-- À planifier via Supabase Cron ou Trigger.dev

-- Comptes inactifs depuis > 3 ans : anonymisation
UPDATE simulations
SET donnees_entree = jsonb_build_object('anonymized', true),
    resultats = jsonb_build_object('anonymized', true)
WHERE user_id IN (
  SELECT id FROM better_auth.users
  WHERE last_active < NOW() - INTERVAL '3 years'
);

-- Sessions expirées : suppression
DELETE FROM better_auth.sessions
WHERE expires_at < NOW() - INTERVAL '7 days';
```

### 4.5 DPA (Data Processing Agreements)

Actions à mener avant la mise en production publique :

- [ ] Vérifier que le DPA Supabase couvre bien les données financières
- [ ] Signer/activer le DPA Resend
- [ ] Configurer Sentry avec `tunnel` EU pour les données EU
- [ ] Documenter la liste des sous-traitants dans les CGU/Politique de confidentialité

### 4.6 Droits des Personnes

**Implémentations requises :**

```typescript
// src/app/api/v1/account/export/route.ts — Droit à la portabilité
export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  const simulations = await supabase.from('simulations').select('*').eq('user_id', user.id);

  // Export JSON ou CSV des données personnelles
  return new Response(
    JSON.stringify({
      user: { email: user.email, createdAt: user.createdAt },
      simulations: simulations.data,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="mes-donnees.json"',
      },
    }
  );
}

// src/app/api/v1/account/delete/route.ts — Droit à l'oubli
export async function DELETE(request: Request) {
  const user = await getCurrentUser(request);

  // 1. Anonymiser les simulations (garder les agrégats anonymes)
  await supabase
    .from('simulations')
    .update({ user_id: null, donnees_entree: { anonymized: true } })
    .eq('user_id', user.id);

  // 2. Supprimer le compte Better Auth
  await auth.deleteUser(user.id);

  // 3. Logger l'action dans audit_log
  await logAuditAction('user', user.id, 'DELETE', user.id);

  return new Response(null, { status: 204 });
}
```

### 4.7 Privacy by Design

**Patterns de code à appliquer systématiquement :**

1. **Collecte minimale** — Ne stocker que les données nécessaires au calcul. Pas de tracking comportemental par défaut.
2. **PII scrubbing avant envoi externe** — Avant tout envoi à Sentry ou futurs LLM :

```typescript
// src/lib/pii-scrubber.ts
const PII_FIELDS = ['email', 'nom', 'prenom', 'telephone', 'adresse'] as const;

export function scrubPII<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (PII_FIELDS.some((field) => key.toLowerCase().includes(field))) {
        return [key, '[REDACTED]'];
      }
      return [key, value];
    })
  ) as T;
}
```

3. **Chiffrement des simulations sensibles** — Envisager le chiffrement côté application pour les données financières dans `donnees_entree` si le modèle B2B évolue.
4. **Anonymisation vs Suppression** — Préférer l'anonymisation à la suppression pour conserver les agrégats statistiques.

### 4.8 Gestion des Violations (Procédure 72h CNIL)

En cas de violation de données détectée :

1. **< 1h** — Isoler le vecteur d'attaque (révoquer les tokens, bloquer l'IP)
2. **< 4h** — Évaluer le périmètre des données compromises
3. **< 24h** — Notifier le DPO / responsable légal
4. **< 72h** — [Notifier la CNIL](https://notifications.cnil.fr/notifications/index) si risque pour les personnes
5. **Si risque élevé** — Notifier les utilisateurs concernés directement

### 4.9 Cookie Consent & Tracking (Conformité CNIL 2022)

**Réglementation applicable :** Les cookies Analytics et Sentry nécessitent un consentement explicite selon les recommandations CNIL 2022.

**Implémentation minimale requise :**

- Banner de consentement conforme (accepter / refuser / personnaliser)
- Analytics (si activé) : désactivé par défaut jusqu'au consentement
- Sentry : cookies de session non essentiels → consentement requis

```typescript
// src/lib/consent.ts
export type ConsentState = {
  analytics: boolean;
  errorTracking: boolean;
  marketing: boolean;
};

export function initConsentManager(): void {
  const consent = getStoredConsent();
  if (consent?.analytics) initAnalytics();
  if (consent?.errorTracking) initSentry();
}
```

---

## 5. Accessibilité & Standards Web Modernes

### 5.1 Cible WCAG 2.1 Niveau AA

**Contexte :** L'audit technique note 7/10 en accessibilité sans cible formelle. La directive européenne sur l'accessibilité web (EUWA) impose WCAG 2.1 AA pour les services numériques.

**Cible formelle :** WCAG 2.1 niveau AA — mesurée via Lighthouse CI (score ≥ 90).

**Critères prioritaires pour Renta_Immo :**

| Critère WCAG                     | Niveau | Importance pour notre app                   |
| -------------------------------- | ------ | ------------------------------------------- |
| 1.1.1 Alternatives textuelles    | A      | Graphiques Recharts (alt text obligatoire)  |
| 1.3.1 Information et relations   | A      | Tableaux de résultats (headers th/td)       |
| 1.4.3 Contraste (minimum)        | AA     | Couleurs thème (ratio ≥ 4.5:1)              |
| 2.1.1 Clavier                    | A      | Navigation formulaire calculateur           |
| 2.4.3 Ordre de focus             | A      | Flux calculateur multi-étapes               |
| 3.3.1 Identification des erreurs | A      | Validation formulaire Zod → messages clairs |
| 3.3.2 Étiquettes et instructions | A      | Labels explicites sur tous les champs       |
| 4.1.2 Nom, rôle, valeur          | A      | Composants Radix UI (déjà conformes)        |

### 5.2 Core Web Vitals — Cibles Mesurables

| Métrique                        | Cible   | Description                            | Outil de mesure             |
| ------------------------------- | ------- | -------------------------------------- | --------------------------- |
| LCP (Largest Contentful Paint)  | < 2.5s  | Temps d'affichage du contenu principal | Lighthouse, Web Vitals      |
| INP (Interaction to Next Paint) | < 200ms | Réactivité aux interactions            | Web Vitals, Chrome DevTools |
| CLS (Cumulative Layout Shift)   | < 0.1   | Stabilité visuelle                     | Lighthouse                  |
| TTFB (Time to First Byte)       | < 600ms | Réponse serveur                        | Lighthouse                  |

**Intégration Lighthouse CI dans GitHub Actions :**

```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v11
  with:
    urls: |
      http://localhost:3000
      http://localhost:3000/calculateur
    budgetPath: ./lighthouse-budget.json
    uploadArtifacts: true
```

```json
// lighthouse-budget.json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "interactive", "budget": 3000 },
      { "metric": "first-contentful-paint", "budget": 1500 }
    ],
    "audits": [
      { "id": "accessibility", "minScore": 0.9 },
      { "id": "best-practices", "minScore": 0.9 }
    ]
  }
]
```

### 5.3 Budget de Performance

| Ressource                | Budget   | Action si dépassement                         |
| ------------------------ | -------- | --------------------------------------------- |
| Bundle JS initial (gzip) | < 200 KB | Vérifier les imports dynamiques, tree-shaking |
| Bundle CSS (gzip)        | < 20 KB  | Tailwind purge CSS activé                     |
| LCP image                | < 100 KB | Optimiser avec `next/image`, format WebP      |
| Total page weight        | < 500 KB | Lazy loading des Recharts (`dynamic()`)       |

**Vérification bundle actuelle :**

```bash
npm run analyze
# ANALYZE=true next build — génère le rapport webpack-bundle-analyzer
```

> [!NOTE]
> Recharts est déjà importé en `dynamic()` dans Dashboard. Maintenir ce pattern pour tout nouveau graphique ou composant lourd.

### 5.4 Tests Accessibilité Automatisés

```bash
npm install --save-dev @axe-core/playwright
```

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibilité WCAG 2.1 AA', () => {
  test('Page calculateur — zéro violation AA', async ({ page }) => {
    await page.goto('/calculateur');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations).toEqual([]);
  });

  test('Page simulations — zéro violation AA', async ({ page }) => {
    await page.goto('/simulations');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations).toEqual([]);
  });
});
```

### 5.5 Progressive Enhancement

**Service Worker (optionnel V3) :** Mettre en cache les assets statiques pour accès offline partiel (lecture des simulations sauvegardées sans connexion).

**Dégradation gracieuse :** Les formulaires doivent fonctionner sans JavaScript (formulaire HTML natif comme fallback). Next.js Server Actions facilite cette approche.

---

## 6. Observabilité & Résilience

### 6.1 Error Tracking — Sentry

**Configuration recommandée :**

```bash
npm install @sentry/nextjs
```

```typescript
// instrumentation.ts (déjà présent dans le projet)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Utiliser le DSN EU
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 0.1,

  // PII scrubbing obligatoire
  beforeSend(event) {
    // Supprimer les données financières des rapports d'erreur
    if (event.extra) {
      delete event.extra.donnees_entree;
      delete event.extra.revenus;
    }
    return event;
  },

  // Alertes critiques
  integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
});
```

**Alertes à configurer dans Sentry :**

- `CALCULATION_ERROR` → alerte immédiate (PagerDuty / email)
- `PDF_GENERATION_ERROR` → alerte si > 5 en 10 minutes
- `AUTH_FAILURE_RATE` → alerte si > 10% en 5 minutes
- `/api/calculate` P99 > 1000ms → alerte performance

### 6.2 Logs Structurés

**Principe :** Les logs `console.log` en production sont inexploitables. Adopter un format structuré JSON.

```typescript
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  [key: string]: unknown;
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, error?: Error, meta?: Record<string, unknown>) =>
    log('error', message, { ...meta, error: error?.message, stack: error?.stack }),
};

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: 'renta-immo',
    ...meta,
  };
  // En développement : lisible ; en production : JSON structuré
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}] ${message}`, meta ?? '');
  } else {
    console.log(JSON.stringify(entry));
  }
}
```

**Note :** Si la migration Docker se concrétise (§9), intégrer pino ou OpenTelemetry pour des traces distribuées vers Grafana/Loki.

### 6.3 Métriques Business

Métriques à collecter dès l'intégration Sentry :

```typescript
// src/app/api/v1/calculate/route.ts — métriques à instrumenter
const span = Sentry.startSpan({ name: 'calculate', op: 'http.server' }, async () => {
  Sentry.setMeasurement('calculation.duration_ms', duration);
  Sentry.setTag('regime_fiscal', input.fiscalite.regime);
  Sentry.setTag('has_credit', String(input.bien.montant_credit > 0));

  return result;
});
```

**Dashboard Sentry à créer :**

- Nb calculs/heure par régime fiscal (LMNP / Foncier / SCI)
- Taux d'erreur par endpoint
- Latence P50/P95/P99 de `/api/calculate`
- Volume simulations sauvegardées/jour

### 6.4 SLO/SLA Définis

| Service                        | SLO                    | Méthode de mesure     |
| ------------------------------ | ---------------------- | --------------------- |
| `/api/calculate`               | P99 < 500ms            | Sentry Performance    |
| `/api/pdf`                     | P95 < 2s               | Sentry Performance    |
| Chargement page `/calculateur` | LCP < 2.5s             | Lighthouse CI         |
| Uptime global                  | 99.9% (8.7h/an toléré) | UptimeRobot (gratuit) |
| Auth `/api/auth/*`             | P99 < 200ms            | Sentry Performance    |

### 6.5 Runbooks & Incident Response

**Playbook — Calcul lent (> 1s) :**

1. Vérifier Sentry pour erreurs Supabase (timeout connexion)
2. Vérifier `pg_stat_activity` pour requêtes bloquées
3. Vérifier ConfigService — rechargement BDD anormalement fréquent ?
4. Vérifier charge CPU instances Vercel (dashboard Vercel)
5. Solution temporaire : activer feature flag `USE_CACHED_CONFIG` si ConfigService en cause

**Playbook — Erreur PDF en masse :**

1. Vérifier version @react-pdf/renderer (changement breaking ?)
2. Vérifier mémoire disponible (PDF = memory-intensive)
3. Solution temporaire : désactiver le bouton PDF via feature flag BDD
4. Escalader si > 30% des PDFs échouent

---

## 7. Scalabilité & Performance

### 7.1 Cache Multicouche

```
Navigateur  → Cache HTTP (Cache-Control, ETag)
CDN Vercel  → Edge Cache (ISR, Route Cache)
Application → Redis/Vercel KV (ConfigService, rate limiting)
BDD         → PgBouncer (pool connexions), index composites
```

**ISR sur les pages publiques :**

```typescript
// src/app/page.tsx — page d'accueil statique avec revalidation 1h
export const revalidate = 3600;

// src/app/simulateur/page.tsx — page dynamique, pas d'ISR
export const dynamic = 'force-dynamic';
```

**Cache `/api/simulations` (liste) :**

```typescript
// Headers de cache côté API pour les données non personnelles
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
  },
});
```

### 7.2 Queue & Traitement Async

Pour tout traitement > 2 secondes (PDF complexe, import batch futur, rapport multi-biens) :

```
Options recommandées :
├── Trigger.dev v3 (open-source, self-hostable, TypeScript natif) — recommandé
├── Vercel Cron + Vercel Queue (intégré si on reste sur Vercel)
└── BullMQ + Redis (si self-hosted, plus de contrôle)
```

**Architecture cible avec Trigger.dev :**

```typescript
// src/trigger/pdf-generation.task.ts
import { task } from '@trigger.dev/sdk/v3';

export const generatePdfTask = task({
  id: 'generate-pdf',
  run: async (payload: { simulationId: string; userId: string }) => {
    const simulation = await loadSimulation(payload.simulationId);
    const pdf = await generatePDF(simulation);
    await uploadToStorage(pdf, payload.simulationId);
    await notifyUserPdfReady(payload.userId, payload.simulationId);
  },
});

// src/app/api/v1/pdf/route.ts — réponse immédiate, traitement async
export async function POST(request: Request) {
  const { simulationId } = await request.json();
  const run = await generatePdfTask.trigger({ simulationId, userId: user.id });
  return NextResponse.json({ jobId: run.id, status: 'queued' }, { status: 202 });
}
```

### 7.3 Base de Données — Index & Optimisation

```sql
-- Index composites prioritaires (à créer immédiatement)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_simulations_user_created
  ON simulations(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_simulations_user_regime
  ON simulations(user_id, (resultats->>'regime_fiscal'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_config_params_lookup
  ON config_params(annee_fiscale, bloc, cle)
  WHERE actif = true;

-- Activer pg_stat_statements pour identifier les requêtes lentes
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Partitionnement planifié (à déclencher si simulations > 100K lignes)
-- Ne pas implémenter maintenant — surveiller le comptage mensuel
```

### 7.4 Feature Flags

```typescript
// src/lib/features.ts — Feature flags hybrides (env vars + BDD)
type FeatureKey = 'COMPARATEUR_BIEN' | 'MODULE_PATRIMOINE' | 'PDF_ASYNC' | 'SCORING_IA';

// Résolution : env var > BDD config_params > défaut false
export async function isFeatureEnabled(key: FeatureKey): Promise<boolean> {
  const envKey = `NEXT_PUBLIC_FEATURE_${key}`;
  if (process.env[envKey] !== undefined) {
    return process.env[envKey] === 'true';
  }
  return ConfigService.getInstance().getFeatureFlag(key);
}
```

### 7.5 Pagination Curseur sur `/api/simulations`

```typescript
// src/app/api/v1/simulations/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor'); // last seen created_at ISO string
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100);

  let query = supabase
    .from('simulations')
    .select('id, nom, created_at, resultats')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit + 1); // +1 pour détecter s'il y a une page suivante

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data } = await query;
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;

  return NextResponse.json({
    items,
    nextCursor: hasMore ? items.at(-1)?.created_at : null,
  });
}
```

---

## 8. Actions Immédiates — Avant Prochaine Feature

Ces actions doivent être réalisées **avant** d'initier un nouveau développement significatif. Elles sont ordonnées par rapport valeur/effort.

### 8.1 🔴 Rate Limiting Distribué (Upstash Redis)

**Effort :** 1 jour | **Impact :** Critique en multi-instances

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/rate-limit.ts — remplacer l'implémentation in-memory
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

export const rateLimiters = {
  calculate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    prefix: 'rl:calculate',
  }),
  pdf: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    prefix: 'rl:pdf',
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '15 m'),
    prefix: 'rl:auth',
  }),
};
```

**Variables d'env à ajouter :**

```bash
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

### 8.2 🔴 Sentry Error Tracking

**Effort :** 0.5 jour | **Impact :** Critique pour la visibilité prod

```bash
npx @sentry/wizard@latest -i nextjs
```

Configurer dans `instrumentation.ts` (cf. §6.1 pour la config complète avec PII scrubbing).

**Variables d'env :**

```bash
SENTRY_DSN=https://...@o...ingest.de.sentry.io/... # DSN EU
SENTRY_AUTH_TOKEN=...  # Pour le upload des source maps
```

### 8.3 🔴 Cache Distribué ConfigService

**Effort :** 1 jour | **Impact :** Cohérence config entre instances

```typescript
// src/server/config/config-service.ts — ajouter le cache Upstash
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const CACHE_TTL = 300; // 5 minutes

async function getConfig(): Promise<ResolvedConfig> {
  const cached = await redis.get<ResolvedConfig>('config:current');
  if (cached) return cached;

  const config = await loadFromDatabase();
  await redis.set('config:current', config, { ex: CACHE_TTL });
  return config;
}

// Invalidation sur modification
async function invalidateConfigCache(): Promise<void> {
  await redis.del('config:current');
}
```

### 8.4 🔴 Index PostgreSQL Composites

**Effort :** 0.5 jour | **Impact :** Performance queries dès 10K simulations

```sql
-- supabase/migrations/YYYYMMDD_perf_indexes.sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_simulations_user_created
  ON simulations(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_config_params_lookup
  ON config_params(annee_fiscale, bloc, cle)
  WHERE actif = true;

-- Vérifier l'impact avec EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM simulations
WHERE user_id = 'xxx'
ORDER BY created_at DESC
LIMIT 20;
```

### 8.5 🔴 Pagination Curseur `/api/simulations`

**Effort :** 1 jour | **Impact :** Performance et UX frontend

Cf. implémentation complète en §7.5.

### 8.6 🟡 OpenAPI Spec

**Effort :** 2 jours | **Impact :** Contrats d'API formalisés, base pour futurs partenaires

```bash
npm install @asteasolutions/zod-to-openapi
```

```typescript
// src/lib/openapi/registry.ts
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
export const registry = new OpenAPIRegistry();

// src/app/api/v1/calculate/schema.ts
import { registry } from '@/lib/openapi/registry';
registry.registerPath({
  method: 'post',
  path: '/api/v1/calculate',
  summary: "Calculer la rentabilité d'un bien immobilier",
  request: { body: { content: { 'application/json': { schema: CalculateurInputSchema } } } },
  responses: { 200: { content: { 'application/json': { schema: CalculResultatsSchema } } } },
});
```

### 8.7 🟡 ESLint `import/no-cycle`

**Effort :** 0.5 jour | **Impact :** Détection précoce des imports circulaires

Cf. configuration complète en §2.1.

### 8.8 🟡 ADR — 3 Premières Décisions Documentées

**Effort :** 0.5 jour | **Impact :** Mémoire architecturale pour l'équipe

Créer `docs/adr/001-monolith-vs-microservices.md`, `002-better-auth-vs-supabase-auth.md`, `003-typescript-moteur-calcul.md`.

### 8.9 🟡 Queue Async Trigger.dev

**Effort :** 3 jours | **Impact :** PDF non-bloquant, base pour traitements futurs

Cf. architecture complète en §7.2.

---

## 9. Infrastructure & Migration Vercel → Self-Hosted

### 9.1 Dépendances Vercel Actuelles

| Dépendance            | Service             | Effort de remplacement | Alternative                            |
| --------------------- | ------------------- | ---------------------- | -------------------------------------- |
| Hosting SSR/SSG       | Vercel Hosting      | 🟡 Moyen               | Next.js standalone sur Docker          |
| Serverless Functions  | Vercel Functions    | 🟡 Moyen               | Node.js long-running (Fly.io, Railway) |
| Edge Middleware       | Vercel Edge Runtime | 🟠 Complexe            | Nginx + middleware Node.js             |
| Vercel KV (si adopté) | Upstash Redis       | 🟢 Facile              | Même Upstash via env vars              |
| CI/CD Preview URLs    | Vercel Preview      | 🟢 Facile              | GitHub Actions + staging env           |
| Domaine + SSL         | Vercel DNS          | 🟢 Facile              | Let's Encrypt + Cloudflare             |

**Bilan :** La principale dépendance est le runtime Vercel Serverless. L'adoption de `output: 'standalone'` est le premier verrou à lever.

### 9.2 `next.config.js` — Output Standalone

**Action immédiate — à activer maintenant, coût zéro :**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Produit .next/standalone/ déployable partout
  // ... reste de la config
};

module.exports = nextConfig;
```

Cela génère `.next/standalone/` : un bundle Node.js auto-suffisant déployable sans `node_modules`.

### 9.3 Dockerfile Production (Multi-Stage, Node.js 22 Alpine)

```dockerfile
# Dockerfile
FROM node:22-alpine AS base

# ─── Stage 1: Dependencies ────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─── Stage 2: Builder ─────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ─── Stage 3: Runner (image finale minimale) ──────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Sécurité : utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

**Endpoint de santé à créer :**

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### 9.4 Docker Compose Développement

```yaml
# docker-compose.yml
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
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run dev

  postgres:
    image: supabase/postgres:15.1.0.117
    environment:
      POSTGRES_DB: renta_immo
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:
```

### 9.5 Docker Compose Production

```yaml
# docker-compose.prod.yml
services:
  app:
    image: ghcr.io/YOUR_ORG/renta-immo:${VERSION:-latest}
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first # Zero-downtime rolling update
      restart_policy:
        condition: on-failure
        max_attempts: 3
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    healthcheck:
      test: ['CMD', 'wget', '-qO-', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 5s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - app

  redis:
    image: redis:7-alpine
    volumes:
      - redis_prod_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}

volumes:
  redis_prod_data:
```

### 9.6 Plan Migration en 6 Étapes

```
Étape 1 (< 1 jour)    : Activer output: "standalone" dans next.config.js
                         → Vérifier que le build Vercel fonctionne toujours

Étape 2 (1-2 jours)   : Créer le Dockerfile + docker-compose.yml dev
                         → Tester localement : docker compose up

Étape 3 (2-3 jours)   : Déployer sur Fly.io en staging
                         → fly launch (détecte Next.js standalone)
                         → Configurer les env vars, tester les routes principales

Étape 4 (3-5 jours)   : Migration base de données
                         → Exporter depuis Supabase cloud
                         → Importer dans Supabase self-hosted (ou Fly.io Postgres)
                         → Valider les migrations et RLS

Étape 5 (1-2 jours)   : Configurer le CI/CD Docker
                         → GitHub Actions : build → GHCR → déploiement Fly.io

Étape 6 (0.5 jour)    : Basculer le DNS production
                         → Vérifier HTTPS, redirections
                         → Monitorer 24h avant de couper Vercel
```

### 9.7 CI/CD Docker (GitHub Actions → GHCR)

```yaml
# .github/workflows/docker.yml
name: Docker Build & Deploy

on:
  push:
    branches: [master]
    tags: ['v*']

jobs:
  build-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=sha,prefix=sha-
            type=semver,pattern={{version}}

      - uses: docker/build-push-action@v5
        with:
          context: .
          target: runner
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_TELEMETRY_DISABLED=1
```

### 9.8 `.dockerignore`

```
node_modules
.next
.git
.github
tests/e2e/videos
tests/e2e/screenshots
*.md
.env*
!.env.example
docs/
```

---

## 10. Préparation IA — Anticiper sans sur-ingénierie

### 10.1 Pourquoi Préparer Maintenant

L'IA n'est pas planifiée à court terme. Mais adopter dès maintenant quelques **patterns architecturaux IA-ready** a un coût quasi nul et évite une refonte coûteuse plus tard. Ce qui change sans IA : rien. Ce qui change avec IA si les patterns sont en place : uniquement l'implémentation du service LLM.

**Ce que cette section N'EST PAS :** Une migration Python, une intégration LLM, l'ajout d'une dépendance. C'est de la préparation architecturale légère.

> [!NOTE]
> **Pourquoi TypeScript reste le bon choix pour les calculs :**
> Les calculs financiers immobiliers (PMT, TRI, amortissements, IS, PS) ne sont **pas** des calculs matriciels intensifs. Ils opèrent sur des scalaires et des tableaux de 300 lignes maximum. TypeScript + la précision actuelle est parfaitement adapté. Une migration Python introduirait 2 langages à maintenir, une latence réseau ajoutée de 50-200ms par calcul, et des risques de parité numérique (arrondis flottants différents). Ce coût est injustifié pour le problème actuel.

### 10.2 Patterns Architecturaux IA-Ready

**Pattern 1 — Abstraction LLMService injectable**

Définir une interface maintenant, implémenter "nothing" par défaut :

```typescript
// src/server/shared/ai/llm-service.interface.ts
export interface LLMService {
  generateNarrative(context: SimulationContext): Promise<string>;
  scoreRisk(features: RiskFeatures): Promise<RiskScore>;
}

// src/server/shared/ai/noop-llm-service.ts — implémentation par défaut
export class NoopLLMService implements LLMService {
  async generateNarrative(): Promise<string> {
    return ''; // IA non activée
  }
  async scoreRisk(features: RiskFeatures): Promise<RiskScore> {
    return { score: null, confidence: 0, source: 'noop' };
  }
}

// Injection via ConfigService ou DI léger
export function getLLMService(): LLMService {
  if (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
    // return new ClaudeService() ou OpenAIService() — implémentation future
  }
  return new NoopLLMService();
}
```

**Pattern 2 — Séparation du Prompt Layer**

Quand l'IA sera implémentée, les prompts doivent être versionnés et testables séparément du code :

```
src/server/shared/ai/
├── prompts/
│   ├── scoring-narratif.ts   ← Template de prompt (pas d'implémentation)
│   └── assistant-investisseur.ts
├── llm-service.interface.ts
└── noop-llm-service.ts       ← Seul fichier implémenté maintenant
```

**Pattern 3 — Contexte de simulation sérialisable**

Les données envoyées à un LLM futur doivent être sérialisables sans PII :

```typescript
// src/types/simulation-context.ts — déjà utilisable pour PDF, futur IA
export interface SimulationContext {
  regime_fiscal: 'LMNP' | 'Foncier' | 'SCI';
  rendement_brut: number;
  cashflow_mensuel: number;
  tri: number;
  score_global: number;
  // Pas d'email, pas de nom, pas d'adresse
}
```

### 10.3 Privacy by Design IA — PII Scrubbing Obligatoire

Toute donnée envoyée à un LLM externe doit passer par le scrubber PII (cf. §4.7). Règle à documenter dans l'ADR IA quand il sera rédigé :

```typescript
// Obligatoire avant tout appel LLM
const safeContext = scrubPII(simulationContext);
const narrative = await llmService.generateNarrative(safeContext);
```

### 10.4 Cas d'Usage Identifiés pour le Futur

| Cas d'usage                                  | Valeur      | Complexité | Horizon |
| -------------------------------------------- | ----------- | ---------- | ------- |
| Rapport narratif (résumé en langage naturel) | Élevée      | Faible     | V3      |
| Assistant chatbot investisseur               | Élevée      | Moyenne    | V3-V4   |
| Scoring prédictif marché local               | Très élevée | Élevée     | V4+     |
| Recommandations profil personnalisé          | Élevée      | Moyenne    | V3-V4   |

### 10.5 Gouvernance Future

Quand l'IA sera implémentée, prévoir :

- Budget tokens mensuel (AWS Budgets ou alertes Anthropic/OpenAI)
- Rate limiting des appels LLM (Upstash Redis déjà en place)
- Hallucination mitigation : jamais présenter un résultat LLM comme un calcul financier certifié
- Audit trail des appels IA (audit_log générique déjà prévu)

---

## 11. Developer Experience

### 11.1 Dev Container

Pour un environnement de développement reproductible (zéro "ça marche sur ma machine") :

```json
// .devcontainer/devcontainer.json
{
  "name": "Renta_Immo Dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:22",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "forwardPorts": [3000, 5432, 6379],
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "prisma.prisma"
      ]
    }
  }
}
```

### 11.2 Supabase Local

```bash
# Démarrer Supabase localement (évite de toucher la BDD de staging/prod)
npx supabase start

# Applique les migrations localement
npx supabase db reset

# Génère les types TypeScript depuis le schéma local
npx supabase gen types typescript --local > src/types/supabase.ts
```

**Avantages :** Développement offline, tests d'intégration isolés, migrations testées avant push.

### 11.3 Génération de Code Type-Safe

Une fois la spec OpenAPI générée (§8.6) :

```bash
npm install --save-dev openapi-typescript

# Génère les types depuis la spec OpenAPI
npx openapi-typescript ./openapi.json -o src/types/api.ts
```

Types générés utilisables dans les clients front et les tests :

```typescript
import type { paths } from '@/types/api';
type CalculateResponse =
  paths['/api/v1/calculate']['post']['responses']['200']['content']['application/json'];
```

### 11.4 Conventions Git — Conventional Commits

**Format obligatoire pour les commits :**

```
<type>(<scope>): <description>

Types : feat | fix | docs | refactor | test | chore | perf | ci
Scope : calculateur | fiscalite | auth | pdf | ui | api | db | infra

Exemples :
  feat(calculateur): ajouter simulation multi-bien
  fix(fiscalite): corriger taux PS LMNP LFSS 2026
  test(hcsf): ajouter test interpolation inversée
  chore(deps): mise à jour next 16.1.6
```

**Changesets pour CHANGELOG automatique (optionnel mais recommandé) :**

```bash
npm install --save-dev @changesets/cli
npx changeset init
```

### 11.5 Storybook (Optionnel V3)

Pour développer et documenter les composants UI en isolation :

```bash
npx storybook@latest init
```

Prioritaire si l'équipe frontend grandit. Facilite les tests visuels et les revues de design.

---

## 12. Multi-Tenancy — Anticipations sans Over-Engineering

### 12.1 Pourquoi Ne Pas L'Implémenter Maintenant

Le multi-tenancy (organisations = agences immobilières, CGP avec leurs clients) est à **horizon > 12 mois**. L'implémenter maintenant introduirait :

- Complexité RLS multipliée
- Coût de développement : 3-4 semaines de travail
- Tests supplémentaires sur chaque endpoint
- UX à repenser (sélection d'organisation, permissions)

**Verdict :** Pas maintenant. Mais ne pas se bloquer non plus.

### 12.2 Règles de Design pour Ne Pas Se Bloquer

**Règle 1 — Colonne `organization_id` nullable sur toute nouvelle table :**

```sql
-- Toute nouvelle table avec données B2B potentielles
CREATE TABLE future_table (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),  -- nullable intentionnel
  -- ...
);
```

**Règle 2 — Ne pas coupler la logique à `user_id` strict :**

```typescript
// ❌ À éviter — couplage fort à user_id
const simulations = await supabase.from('simulations').select('*').eq('user_id', currentUser.id);

// ✅ Préférer — abstraction qui pourra inclure l'org plus tard
const simulations = await simulationRepository.findByOwner({
  userId: currentUser.id,
  organizationId: currentUser.organizationId ?? null,
});
```

**Règle 3 — Pas de logique business couplée à l'identité utilisateur :**

Le moteur de calcul (`src/server/calculations/`) ne doit jamais dépendre de `user_id`. Il calcule des données financières, pas des données utilisateur.

### 12.3 Schéma Cible Quand le Besoin Devient Réel

```sql
-- À implémenter quand premier client B2B signé
CREATE TABLE organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom        TEXT NOT NULL,
  plan       TEXT NOT NULL DEFAULT 'starter', -- 'starter' | 'pro' | 'enterprise'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE organization_members (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'
  PRIMARY KEY (organization_id, user_id)
);

-- RLS par organisation
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_member_access" ON simulations
  USING (
    organization_id IS NULL AND user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

---

## 13. Roadmap Technique Priorisée

### Phase 0 — Fondations (< 1 mois)

_Réaliser avant toute nouvelle feature. Pas négociable._

- [x] **8.1** Rate limiting distribué Upstash Redis (1 jour) — ARCH-S01 ✅
- [x] **8.2** Sentry error tracking + PII scrubbing (0.5 jour) — ARCH-S02 ✅
- [x] **8.3** Cache distribué ConfigService Upstash (1 jour) — ARCH-S03 ✅
- [x] **8.4** Index PostgreSQL composites (0.5 jour) — ARCH-S04 ✅
- [x] **8.5** Pagination curseur `/api/simulations` (1 jour) — ARCH-S05 ✅
- [x] **9.2** `output: 'standalone'` dans `next.config.js` (0.5 jour) — ARCH-S06 ✅
- [ ] **8.6** OpenAPI spec (Zod → openapi) (2 jours)
- [ ] **8.7** ESLint `import/no-cycle` (0.5 jour)
- [ ] **8.8** ADR — 3 premières décisions documentées (0.5 jour)

**Total Phase 0 : ~7 jours-développeur**

### Phase 1 — Migration Infra (1-3 mois)

_En parallèle des features business_

- [ ] **9.3** Dockerfile production multi-stage (1 jour)
- [ ] **9.4** Docker Compose dev local complet (1 jour)
- [ ] **9.7** CI/CD Docker (GitHub Actions → GHCR) (1 jour)
- [ ] **11.1** Dev Container `.devcontainer/` (0.5 jour)
- [ ] **11.2** Supabase local pour développement isolé (0.5 jour)
- [ ] Déploiement staging sur Fly.io (2 jours)
- [ ] Tests E2E sur environment Docker (1 jour)

**Total Phase 1 : ~7 jours-développeur**

### Phase 2 — Scalabilité & Résilience (3-6 mois)

_Déclencher quand les métriques Phase 0 révèlent des goulots_

- [ ] **8.9** Queue async Trigger.dev (PDF non-bloquant) (3 jours)
- [ ] **6.4** SLO Dashboard Sentry (alertes définies) (1 jour)
- [ ] **7.3** Partitionnement `simulations` si > 100K lignes (2 jours)
- [ ] Migration DNS vers infra Docker (0.5 jour)
- [ ] Secrets management Doppler (1 jour)
- [ ] Audit trail générique `audit_log` (1 jour)

**Total Phase 2 : ~8.5 jours-développeur**

### Phase 3 — Standards & Qualité (Parallèle)

_Peut avancer en parallèle des phases 1 et 2_

- [ ] **4** RGPD complet : API droit à l'oubli, portabilité, cookie banner (3 jours)
- [ ] **5.2** Lighthouse CI dans GitHub Actions (1 jour)
- [ ] **5.4** Tests accessibilité axe-core Playwright (1 jour)
- [ ] **3.2** CodeQL SAST + Dependabot (1 jour)
- [ ] **3.5** Renforcement CSP (0.5 jour)
- [ ] **2.5** Couverture tests UI ≥ 60% (3 jours)

**Total Phase 3 : ~9.5 jours-développeur**

### Phase 4 — Croissance (6-12 mois)

_Déclencher sur signal business réel_

- [ ] **12** Multi-tenancy si premier client B2B (3-4 semaines)
- [ ] API publique versionnée v2 si demandes partenaires (2 semaines)
- [ ] **10** Intégration IA : rapport narratif v1 (1 semaine)
- [ ] **11.5** Storybook si équipe frontend > 2 (1 semaine)
- [ ] **9.6** Migration DNS production complète (1 jour)

---

## 14. Annexe — Checklist Nouvelle Feature

> Valider cette checklist avant chaque merge sur `master`.

```markdown
## Checklist Nouvelle Feature — Renta_Immo

### Conception

- [ ] ADR rédigé si décision architecturale non triviale (ex: nouveau provider, nouveau pattern)
- [ ] Domaine bien isolé (`src/app|server|components|stores|types/[feature]/`)
- [ ] Zéro import circulaire inter-domaines (ESLint import/no-cycle)
- [ ] `organization_id` nullable ajouté si table avec données utilisateur B2B potentielles
- [ ] Feature flag défini si rollout progressif nécessaire

### Sécurité

- [ ] Validation Zod sur tous les inputs API (pas de type `any`)
- [ ] Rate limiting configuré si endpoint public ou coûteux
- [ ] Pas de données financières ou PII dans les logs Sentry
- [ ] RLS configuré si nouvelle table avec données sensibles

### RGPD

- [ ] Nouvelle donnée personnelle inventoriée (§4.1)
- [ ] Base légale identifiée et documentée
- [ ] Durée de conservation définie
- [ ] Droit à l'effacement implémenté si nouvelle donnée utilisateur

### Base de données

- [ ] Migration SQL dans `supabase/migrations/` avec timestamp YYYYMMDD
- [ ] Index créés sur les colonnes filtrées fréquemment
- [ ] `EXPLAIN ANALYZE` vérifié sur les nouvelles requêtes
- [ ] `organization_id UUID` nullable ajouté si table B2B future

### API

- [ ] Endpoint versionnés (`/api/v1/`)
- [ ] Format d'erreur standard respecté (`{ error: string, code?: string }`)
- [ ] OpenAPI spec mise à jour (`docs/openapi.json`)
- [ ] Pagination curseur si endpoint retournant une liste

### Accessibilité

- [ ] Labels explicites sur tous les champs de formulaire
- [ ] Contraste des couleurs vérifié (ratio ≥ 4.5:1)
- [ ] Navigation clavier fonctionnelle
- [ ] Alt text sur les graphiques Recharts

### Tests

- [ ] Tests unitaires sur la logique métier (≥ 80% coverage)
- [ ] Tests d'intégration sur les nouvelles API Routes
- [ ] Tests E2E Playwright si nouveau parcours UI critique
- [ ] Tests de régression si calculs financiers modifiés
- [ ] Aucune régression : `npm test` vert avant merge

### Déploiement

- [ ] Variables d'env documentées dans `.env.example`
- [ ] Feature flag désactivé par défaut en production
- [ ] Sentry alerts configurées pour les nouvelles erreurs métier
- [ ] Migration SQL testée sur Supabase local avant push
- [ ] Rollback plan : la feature peut-elle être désactivée sans migration inversée ?
```

---

_Document maintenu par l'équipe Architecture — Mettre à jour après chaque décision technique majeure. La prochaine révision est prévue après la Phase 0 (< 1 mois)._
