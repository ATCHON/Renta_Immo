# Guide de contribution - Renta Immo

Merci de votre intérêt pour contribuer à Renta Immo ! Ce guide vous aidera à démarrer rapidement et à suivre les meilleures pratiques du projet.

## Table des matières

- [Workflow de développement](#workflow-de-développement)
- [Convention de commits](#convention-de-commits)
- [Tests](#tests)
- [Variables d'environnement](#variables-denvironnement)
- [CI automatique](#ci-automatique)
- [Architecture](#architecture)

---

## Workflow de développement

### 1. Fork et clone du repository

```bash
# Fork le repo sur GitHub, puis clonez votre fork
git clone https://github.com/VOTRE-USERNAME/Renta_Immo.git
cd Renta_Immo

# Ajoutez le repo original comme upstream
git remote add upstream https://github.com/ATCHON/Renta_Immo.git
```

### 2. Créer une branche de fonctionnalité

```bash
# Synchronisez avec upstream
git fetch upstream
git checkout master
git merge upstream/master

# Créez une nouvelle branche
git checkout -b feature/ma-nouvelle-fonctionnalite
```

**Convention de nommage des branches :**
- `feature/description` - Nouvelles fonctionnalités
- `fix/description` - Corrections de bugs
- `test/description` - Ajout ou amélioration de tests
- `docs/description` - Modifications de documentation
- `refactor/description` - Refactoring sans changement fonctionnel

### 3. Développer localement

```bash
# Installez les dépendances
npm install

# Copiez le template d'environnement
cp .env.local.example .env.local
# Éditez .env.local avec vos valeurs (voir section Variables d'environnement)

# Lancez le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour voir l'application.

### 4. Tester votre code

Avant de commiter, **assurez-vous que tous les tests passent** :

```bash
# Qualité du code
npm run lint              # ESLint
npm run type-check        # TypeScript
npm run format:check      # Prettier

# Tests unitaires
npm run test              # Exécution des 230 tests
npm run test:coverage     # Avec rapport de couverture

# Build Next.js
npm run build             # Vérifier que le build passe
```

### 5. Commiter vos changements

Suivez la [convention de commits](#convention-de-commits) :

```bash
git add .
git commit -m "feat(calculations): ajout calcul déficit foncier"
```

### 6. Pousser et créer une Pull Request

```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

Allez sur GitHub et créez une Pull Request vers la branche `master` du repo `ATCHON/Renta_Immo`.

**Template de PR :**
```markdown
## Description
[Décrivez brièvement les changements]

## Type de changement
- [ ] Bug fix (correction non-breaking)
- [ ] Nouvelle fonctionnalité (changement non-breaking ajoutant une fonctionnalité)
- [ ] Breaking change (correction ou fonctionnalité causant un changement de comportement existant)
- [ ] Documentation

## Checklist
- [ ] Mon code suit les conventions du projet
- [ ] J'ai effectué une auto-revue de mon code
- [ ] J'ai commenté mon code, notamment dans les zones difficiles
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] Mes changements ne génèrent aucun nouveau warning
- [ ] J'ai ajouté des tests prouvant que ma correction fonctionne ou que ma fonctionnalité marche
- [ ] Les tests unitaires passent localement avec mes changements
- [ ] Le build Next.js passe sans erreur
```

---

## Convention de commits

Nous utilisons la convention **Conventional Commits** pour un historique git propre et sémantique.

### Format

```
type(scope): message

[body optionnel]

[footer optionnel]
```

### Types autorisés

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(calculations): ajout scoring dual profil` |
| `fix` | Correction de bug | `fix(hcsf): correction interpolation inversée` |
| `test` | Ajout ou modification de tests | `test(deficit): ajout 12 tests déficit foncier` |
| `docs` | Documentation uniquement | `docs(readme): mise à jour installation` |
| `refactor` | Refactoring sans changement fonctionnel | `refactor(store): extraction constantes` |
| `perf` | Amélioration de performance | `perf(api): optimisation requêtes DB` |
| `style` | Formatage, trailing spaces, etc. | `style(components): application Prettier` |
| `chore` | Maintenance, dépendances, config | `chore(deps): mise à jour Next.js 14.2.23` |
| `ci` | Modifications CI/CD | `ci(workflow): ajout caching Next.js` |

### Scopes courants

- `calculations` - Moteur de calculs
- `api` - Routes API Next.js
- `components` - Composants React
- `stores` - Stores Zustand
- `auth` - Authentification Better Auth
- `db` - Supabase / Base de données
- `tests` - Tests unitaires/e2e
- `hcsf` - Vérification HCSF
- `scoring` - Système de scoring
- `deficit` - Déficit foncier
- `lmp` - Statut LMP/LMNP

### Exemples complets

```bash
# Feature avec body explicatif
git commit -m "feat(scoring): implémentation profils Rentier/Patrimonial

Ajout de pondérations différenciées par profil :
- Rentier : priorité cashflow (50%) et TRI (30%)
- Patrimonial : priorité plus-value (40%) et TRI (30%)

Closes #V2-S16"

# Fix simple
git commit -m "fix(hcsf): correction reste à vivre HCSF"

# Test avec scope précis
git commit -m "test(lmp): ajout tests alertes seuil 23k€"

# Documentation
git commit -m "docs(contributing): ajout guide contributeur"

# Refactoring
git commit -m "refactor(calculations): extraction constantes LMP"
```

---

## Tests

### Tests unitaires (Vitest)

Le projet compte **230 tests unitaires** couvrant :
- Moteur de calculs (`src/server/calculations/`)
- Stores Zustand (`src/stores/`)
- API routes (`src/app/api/`)
- Utilitaires et helpers

**Commandes :**

```bash
# Exécuter tous les tests
npm run test

# Mode watch (re-exécute automatiquement)
npm run test:watch

# Avec couverture
npm run test:coverage

# Tests de régression uniquement
npm run test:regression
npm run test:regression:watch
```

**Écrire un nouveau test :**

Les tests sont dans `tests/unit/` et suivent la structure :

```typescript
import { describe, it, expect } from 'vitest';
import { maFonction } from '@/server/calculations/ma-fonction';

describe('maFonction', () => {
  it('devrait calculer correctement avec des valeurs normales', () => {
    const resultat = maFonction({ input: 100 });
    expect(resultat).toBe(150);
  });

  it('devrait gérer les cas limites', () => {
    expect(maFonction({ input: 0 })).toBe(0);
    expect(maFonction({ input: -10 })).toBe(0);
  });
});
```

**Couverture attendue :**
- Fonctions de calculs : **100%**
- API routes : **>80%**
- Stores : **>70%**
- Global : **>75%**

### Tests E2E (Playwright)

Les tests E2E sont en cours de stabilisation (2 tests disponibles).

```bash
# Installation (première fois)
npx playwright install

# Exécuter les tests E2E
npm run test:e2e

# Mode debug
npm run test:e2e:debug
```

---

## Variables d'environnement

### Développement local

Créez un fichier `.env.local` à la racine du projet :

**Obtenir les valeurs Supabase :**
1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. **Settings** → **API**
4. Copiez `Project URL` et `anon/public` key

**Générer BETTER_AUTH_SECRET :**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CI/CD (GitHub Actions)

Les secrets doivent être configurés dans GitHub :

Voir [Configuration CI](#ci-automatique) pour plus de détails.

---

## CI automatique

Le projet utilise **GitHub Actions** pour valider automatiquement chaque Pull Request.

### Workflow CI

À chaque push sur une PR, le workflow CI exécute 3 jobs parallélisés :

#### 1. Quality Checks
- ✅ **ESLint** : Vérification des règles de linting
- ✅ **TypeScript** : Vérification des types
- ✅ **Prettier** : Vérification du formatage

#### 2. Unit Tests
- ✅ **Vitest** : Exécution des 230 tests unitaires
- ✅ **Coverage** : Génération du rapport de couverture
- 💬 **Commentaire PR** : Statistiques de couverture automatiques

#### 3. Build
- ✅ **Next.js Build** : Compilation de l'application
- ✅ **Artifacts** : Upload des fichiers de build

**Matrix Testing :** Tous les jobs sont exécutés sur Node.js 18.x et 20.x pour garantir la compatibilité.

### Optimisations

- 🚀 **Caching npm** : Dépendances mises en cache entre les runs
- 🚀 **Caching Next.js** : Build cache pour accélération 30-50%
- 🎯 **Path filtering** : Skip CI sur modifications docs uniquement

### Vérifier le statut CI

- Badge CI dans le README : ![CI](https://github.com/ATCHON/Renta_Immo/actions/workflows/ci.yml/badge.svg)
- GitHub Actions tab : https://github.com/ATCHON/Renta_Immo/actions
- Sur votre PR : Les checks apparaissent automatiquement

**⚠️ Important :** Toutes les PRs doivent avoir le CI au vert avant merge.

---

## Architecture

### Structure du projet

```
Renta_Immo/
├── src/
│   ├── app/                 # Pages et routes Next.js (App Router)
│   │   ├── api/             # API routes (calculate, pdf, simulations)
│   │   ├── calculateur/     # Pages du simulateur
│   │   ├── dashboard/       # Dashboard utilisateur
│   │   └── auth/            # Pages d'authentification
│   ├── components/          # Composants React réutilisables
│   │   ├── ui/              # Composants UI génériques
│   │   ├── forms/           # Formulaires (React Hook Form + Zod)
│   │   ├── results/         # Composants d'affichage résultats
│   │   └── charts/          # Graphiques (Recharts)
│   ├── server/              # Code serveur
│   │   └── calculations/    # Moteur de calculs (pure TypeScript)
│   ├── stores/              # Stores Zustand (état global)
│   ├── hooks/               # Custom hooks React
│   ├── lib/                 # Utilitaires et clients
│   │   ├── auth.ts          # Better Auth configuration
│   │   ├── supabase/        # Client Supabase
│   │   └── utils.ts         # Helpers génériques
│   └── types/               # Types TypeScript
├── tests/
│   ├── unit/                # Tests unitaires Vitest
│   │   ├── api/             # Tests API routes
│   │   ├── calculations/    # Tests moteur calculs (112 tests)
│   │   ├── stores/          # Tests stores Zustand
│   │   └── lib/             # Tests utilitaires
│   └── e2e/                 # Tests E2E Playwright
├── docs/                    # Documentation projet
│   ├── architecte/          # Architecture technique
│   ├── devs-guide/          # Guides développeurs
│   └── sprints/             # Spécifications sprints
└── scripts/                 # Scripts utilitaires (migrations, etc.)
```

### Stack technique

- **Frontend** : Next.js 14 (App Router), React 18, TypeScript 5.7, Tailwind CSS
- **État** : Zustand (store global), React Hook Form (formulaires)
- **Backend** : Next.js API Routes, Supabase (PostgreSQL)
- **Auth** : Better Auth (PAS Supabase Auth)
- **Tests** : Vitest (unitaires), Playwright (E2E)
- **Déploiement** : Vercel (frontend + API), Supabase (DB EU-West)

### Documentation complète

Pour une compréhension approfondie de l'architecture :

- 📘 **Architecture Fullstack** : `docs/architecte/architecture-fullstack.md`
- 📗 **Guide Développeurs** : `docs/devs-guide/guidance-devs-2026-01-29.md`
- 📙 **Spécifications Sprints** : `docs/sprints/sprint-*.md`

---

## Dépendances automatiques (Dependabot)

Le projet utilise **Dependabot** pour les mises à jour automatiques des dépendances npm (tous les lundis à 6h).

Les PRs Dependabot sont automatiquement labellisées `dependencies` et `automerge`.

**Workflow :**
1. Dependabot crée une PR chaque lundi
2. Le CI s'exécute automatiquement
3. Si tous les tests passent, merger la PR
4. Si des tests échouent, investiguer et corriger

---

## Besoin d'aide ?

- 💬 **Questions** : Ouvrez une [Discussion GitHub](https://github.com/ATCHON/Renta_Immo/discussions)
- 🐛 **Bugs** : Créez une [Issue GitHub](https://github.com/ATCHON/Renta_Immo/issues)
- 📧 **Contact** : [Email du mainteneur]

**Merci de contribuer à Renta Immo ! 🚀**
