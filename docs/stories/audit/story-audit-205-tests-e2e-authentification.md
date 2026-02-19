# Story AUDIT-205 : Tests E2E — Flux d'authentification

> **Priorite** : P4-5 (Tests & DevOps)
> **Effort** : 1.5 jour
> **Statut** : A faire
> **Source** : Audit technique 2026-02-07, Section 5.2
> **Dependance** : AUDIT-201 (configuration Playwright avec webServer + helper auth.ts)

---

## 1. User Story

**En tant que** développeur
**Je veux** des tests E2E couvrant le flux complet d'authentification
**Afin de** détecter toute régression sur la connexion, l'inscription, la déconnexion et la protection des routes

---

## 2. Contexte

### 2.1 Périmètre actuel

Les 2 tests E2E existants (`simulation-complete.spec.ts`, `multi-scenarios.spec.ts`) naviguent directement vers `/calculateur` sans authentification — ils ne testent pas le flux auth et supposent qu'il n'y a pas de protection.

Or le middleware (`src/middleware.ts`) protège les routes `/simulations/*` et redirige vers `/auth/login`. Ce comportement n'est pas couvert par des tests automatisés.

### 2.2 Périmètre à couvrir

- Inscription via email/mot de passe
- Connexion via email/mot de passe
- Déconnexion
- Protection des routes (accès sans auth)
- Redirection post-login vers la page d'origine (`callbackUrl`)
- Cas d'erreur (mauvais mot de passe, email inexistant, email déjà utilisé)

> **Note Google OAuth** : L'OAuth Google ne peut pas être testé en E2E sans infrastructure dédiée (popup externe, secrets). Ces tests sont hors périmètre et documentés comme exclusion volontaire.

---

## 3. Critères d'acceptation

### 3.1 Accès aux routes protégées sans authentification

- [ ] Naviguer vers `/simulations` redirige vers `/auth/login`
- [ ] L'URL de callback est préservée : `/auth/login?callbackUrl=%2Fsimulations`
- [ ] Naviguer vers `/calculateur` est accessible sans authentification (pas de redirection)
- [ ] La page de login est rendue correctement (titre, champs email/password, bouton connexion)

### 3.2 Connexion avec email/mot de passe

- [ ] Se connecter avec des identifiants valides redirige vers `/calculateur` (ou `callbackUrl`)
- [ ] L'interface affiche le nom/email de l'utilisateur après connexion (dans le header)
- [ ] Se connecter avec un mauvais mot de passe affiche un message d'erreur
- [ ] Se connecter avec un email inexistant affiche un message d'erreur
- [ ] Le champ mot de passe est masqué (`type="password"`)

### 3.3 Inscription via email/mot de passe

- [ ] Naviguer vers la page d'inscription affiche le formulaire
- [ ] S'inscrire avec un email valide et un mot de passe > 8 caractères redirige vers le calculateur
- [ ] S'inscrire avec un email déjà utilisé affiche une erreur
- [ ] S'inscrire avec des mots de passe non concordants affiche une erreur de validation
- [ ] S'inscrire avec un email invalide affiche une erreur de validation

### 3.4 Déconnexion

- [ ] Cliquer sur "Déconnexion" depuis une session active déconnecte l'utilisateur
- [ ] Après déconnexion, naviguer vers `/simulations` redirige vers `/auth/login`
- [ ] La page d'accueil (ou login) est affichée après déconnexion

### 3.5 Redirection post-login

- [ ] Accéder à `/simulations?status=favorites` sans auth → login → retour vers `/simulations?status=favorites`
- [ ] L'URL de callback invalide (ex: `http://evil.com`) est ignorée → redirection vers `/` après login

---

## 4. Spécifications techniques

### 4.1 Structure des fichiers

```
tests/e2e/
├── auth/
│   ├── login.spec.ts           (nouveau)
│   ├── signup.spec.ts          (nouveau)
│   ├── logout.spec.ts          (nouveau)
│   └── protected-routes.spec.ts (nouveau)
├── helpers/
│   └── auth.ts                 (créé dans AUDIT-201)
├── multi-scenarios.spec.ts     (existant)
└── simulation-complete.spec.ts (existant)
```

### 4.2 Gestion de l'utilisateur de test

Les tests E2E nécessitent un utilisateur existant en base. Options :

**Option A — Utilisateur de test fixe** (recommandée pour simplicité)
Utiliser le compte de test existant : `test-auth-script@example.com` / `Password123!`
Ce compte doit exister dans la base de données de test/staging.

```typescript
// tests/e2e/helpers/auth.ts
export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'test-auth-script@example.com',
  password: process.env.E2E_TEST_PASSWORD ?? 'Password123!',
};
```

**Option B — Création via API** (plus isolée)
Créer l'utilisateur via une route API de test avant chaque suite, le supprimer après.

### 4.3 Pattern de test d'authentification

```typescript
// tests/e2e/auth/login.spec.ts
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
    await expect(page).toHaveURL(/\/(calculateur|simulations)/);
  });

  test('mot de passe incorrect affiche une erreur', async ({ page }) => {
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/mot de passe/i).fill('wrong-password');
    await page.getByRole('button', { name: /connexion/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
```

### 4.4 Nettoyage pour les tests d'inscription

Les tests de signup créent de nouveaux comptes — risque d'accumulation en base. Utiliser des emails générés dynamiquement et nettoyer après :

```typescript
test('inscription valide', async ({ page }) => {
  const email = `test-e2e-${Date.now()}@example.com`;
  // ... test ...
  // Nettoyage via API admin si possible
});
```

### 4.5 Variables d'environnement nécessaires

Ajouter dans `.env.test` (non commité) :

```
E2E_TEST_EMAIL=test-auth-script@example.com
E2E_TEST_PASSWORD=Password123!
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

---

## 5. Points d'attention

- Les tests d'inscription créent des données réelles en base — prévoir un mécanisme de nettoyage ou utiliser une base de données dédiée aux tests
- Ne pas stocker les mots de passe en clair dans le code versionné — utiliser des variables d'environnement
- Les timeouts doivent être généreux pour les tests d'auth (authentification asynchrone) : 10-20s
- Si Google OAuth est activé sur la page de login, vérifier que les tests ne cliquent pas dessus par erreur

---

## 6. Définition of Done

- [ ] 15+ tests E2E couvrant les scénarios 3.1 à 3.5
- [ ] Tous les tests passent localement avec `npm run test:e2e`
- [ ] Tous les tests passent en CI (serveur démarré via `webServer`)
- [ ] Aucun test ne dépend d'un état précédent (isolation garantie)
- [ ] Les credentials de test sont dans des variables d'environnement (pas dans le code)
- [ ] Non-régression sur les 2 tests E2E existants
