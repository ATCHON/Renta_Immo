# Story AUDIT-206 : Tests E2E — CRUD simulations, PDF & filtres

> **Priorite** : P4-6 (Tests & DevOps)
> **Effort** : 2 jours
> **Statut** : A faire
> **Source** : Audit technique 2026-02-07, Section 5.2
> **Dependance** : AUDIT-201 (configuration Playwright), AUDIT-205 (helper auth.ts)

---

## 1. User Story

**En tant que** développeur
**Je veux** des tests E2E couvrant les opérations CRUD sur les simulations, la génération PDF et les filtres
**Afin de** garantir que les fonctionnalités principales de l'application fonctionnent de bout en bout

---

## 2. Contexte

### 2.1 Périmètre actuel

Les tests E2E existants couvrent uniquement le parcours de saisie du calculateur jusqu'aux résultats (`simulation-complete.spec.ts`) et les multi-scénarios (`multi-scenarios.spec.ts`). Les fonctionnalités de la page Simulations (liste, gestion) ne sont pas testées.

### 2.2 Périmètre à couvrir

**CRUD simulations** :

- Sauvegarder une simulation depuis les résultats
- Voir la liste des simulations
- Renommer une simulation
- Mettre en favori / retirer des favoris
- Archiver / désarchiver
- Supprimer

**Génération PDF** :

- Télécharger le rapport PDF depuis les résultats

**Filtres & pagination** :

- Filtrer par statut (favoris, archivés, actifs)
- Rechercher par nom
- Changer l'ordre de tri
- Navigation entre pages (si plusieurs simulations)

**Cas d'erreur** :

- Validation du formulaire calculateur
- Erreurs réseau simulées (graceful degradation)

---

## 3. Critères d'acceptation

### 3.1 Sauvegarde d'une simulation

- [ ] Depuis la page résultats, cliquer "Sauvegarder" ouvre un modal/formulaire de nommage
- [ ] Entrer un nom et confirmer crée la simulation et affiche un toast de confirmation
- [ ] La simulation apparaît dans la liste sur `/simulations`
- [ ] Sauvegarder sans nom affiche une erreur de validation

### 3.2 Liste et navigation simulations

- [ ] La page `/simulations` affiche les simulations de l'utilisateur
- [ ] Cliquer sur une simulation ouvre la vue détail
- [ ] La vue détail affiche les résultats (score, cash-flow, rentabilité)

### 3.3 Actions sur une simulation

- [ ] **Renommer** : éditer le nom, sauvegarder → nouveau nom affiché
- [ ] **Favori** : cliquer l'icône étoile → la simulation passe en favori (icône remplie)
- [ ] **Retirer des favoris** : recliquer → icône vide, simulation retirée des favoris
- [ ] **Archiver** : l'action retire la simulation de la liste active
- [ ] **Désarchiver** : depuis le filtre "archivées", désarchiver remet la simulation en liste active
- [ ] **Supprimer** : une confirmation est demandée, puis la simulation disparaît de la liste

### 3.4 Filtres et recherche

- [ ] Filtre "Favoris" n'affiche que les simulations marquées comme favorites
- [ ] Filtre "Archivées" n'affiche que les simulations archivées
- [ ] Le filtre "Tous" affiche toutes les simulations non archivées
- [ ] La recherche par nom filtre les résultats en temps réel (debounce ~300ms)
- [ ] Une recherche sans résultat affiche un message "Aucune simulation trouvée"
- [ ] Les filtres sont dans l'URL (ex: `/simulations?status=favorites&search=Paris`) — partageables
- [ ] Naviguer en arrière restaure les filtres précédents

### 3.5 Tri

- [ ] Trier par "Date de création" (défaut décroissant)
- [ ] Trier par "Score" affiche les meilleures simulations en premier
- [ ] Trier par "Rentabilité nette"
- [ ] Le tri est combinable avec le filtre de statut

### 3.6 Génération PDF

- [ ] Depuis la page résultats, cliquer "Télécharger le rapport" déclenche un téléchargement
- [ ] Le fichier téléchargé est un PDF (content-type `application/pdf`)
- [ ] Le bouton affiche un état de chargement pendant la génération
- [ ] En cas d'échec API, un toast d'erreur est affiché (pas de crash silencieux)

### 3.7 Validation formulaire calculateur

- [ ] Passer l'étape 1 sans remplir le prix d'achat affiche une erreur de validation
- [ ] Un prix négatif est rejeté
- [ ] Un loyer à 0 est accepté (cas particulier : local commercial en travaux)
- [ ] Un taux d'intérêt supérieur à 20% affiche un avertissement (pas bloquant)

---

## 4. Spécifications techniques

### 4.1 Structure des fichiers

```
tests/e2e/
├── auth/                         (AUDIT-205)
├── simulations/
│   ├── crud.spec.ts              (nouveau — create, rename, favorite, archive, delete)
│   ├── filters.spec.ts           (nouveau — filtres, tri, pagination, recherche)
│   └── pdf.spec.ts               (nouveau — génération et téléchargement PDF)
├── calculateur/
│   └── validation.spec.ts        (nouveau — erreurs de validation formulaire)
├── helpers/
│   └── auth.ts                   (AUDIT-201/205)
├── multi-scenarios.spec.ts       (existant)
└── simulation-complete.spec.ts   (existant)
```

### 4.2 Pattern de setup authentifié

Tous les tests de simulations nécessitent une session authentifiée. Utiliser `beforeEach` avec le helper :

```typescript
import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from '../helpers/auth';

test.describe('CRUD Simulations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
  });

  // ... tests ...
});
```

Ou mieux, utiliser les `storageState` de Playwright pour réutiliser la session :

```typescript
// playwright.config.ts — ajouter un projet "setup" qui se connecte une fois
// puis réutiliser le storageState dans les autres projets
```

### 4.3 Test de téléchargement PDF

```typescript
test('télécharger le rapport PDF', async ({ page }) => {
  // Naviguer vers une simulation existante
  await page.goto('/simulations');
  await page.getByTestId('simulation-card').first().click();

  // Attendre le bouton PDF et capturer le téléchargement
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /télécharger/i }).click();
  const download = await downloadPromise;

  // Vérifier le nom et l'existence du fichier
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  const path = await download.path();
  expect(path).toBeTruthy();
});
```

### 4.4 Test de filtres dans l'URL

```typescript
test("les filtres sont reflétés dans l'URL", async ({ page }) => {
  await page.goto('/simulations');

  // Activer le filtre favoris
  await page.getByRole('button', { name: /favoris/i }).click();
  await expect(page).toHaveURL(/status=favorites/);

  // Naviguer en arrière → filtres restaurés
  await page.goBack();
  await page.goForward();
  await expect(page).toHaveURL(/status=favorites/);
  await expect(page.getByRole('button', { name: /favoris/i })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});
```

### 4.5 Données de test

Pour éviter des dépendances entre tests, chaque test qui crée une simulation doit la supprimer après :

```typescript
test.afterEach(async ({ page }) => {
  // Nettoyer les simulations créées pendant le test
  // Via l'UI ou via une route API de cleanup
});
```

Alternativement, utiliser une simulation pré-existante en base (via seed) pour les tests de lecture seule.

### 4.6 Gestion du timeout pour la génération PDF

La génération PDF peut être lente (3-10s). Configurer un timeout approprié :

```typescript
test('génération PDF', async ({ page }) => {
  test.setTimeout(30000); // 30s pour la génération
  // ...
});
```

---

## 5. Cas d'erreur à tester

### 5.1 Suppression avec confirmation

```typescript
test('supprimer une simulation demande confirmation', async ({ page }) => {
  // Ouvrir le menu d'actions
  await page.getByTestId('simulation-actions').first().click();
  await page.getByRole('menuitem', { name: /supprimer/i }).click();

  // Vérifier que la confirmation est demandée
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/êtes-vous sûr/i)).toBeVisible();

  // Annuler → la simulation est toujours là
  await page.getByRole('button', { name: /annuler/i }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
```

### 5.2 Erreur réseau lors de la sauvegarde

```typescript
test('erreur réseau lors de la sauvegarde affiche un toast', async ({ page }) => {
  // Intercepter la requête et forcer une erreur
  await page.route('**/api/simulations', (route) => route.abort('failed'));

  // Tenter de sauvegarder
  await page.getByRole('button', { name: /sauvegarder/i }).click();
  await page.getByLabel(/nom/i).fill('Ma simulation');
  await page.getByRole('button', { name: /confirmer/i }).click();

  // Vérifier le toast d'erreur
  await expect(page.getByRole('status')).toBeVisible(); // toast
  await expect(page.getByText(/erreur/i)).toBeVisible();
});
```

---

## 6. Définition of Done

- [ ] 30+ tests E2E couvrant les scénarios 3.1 à 3.7
- [ ] Tous les tests passent localement avec `npm run test:e2e`
- [ ] Tous les tests passent en CI (Chromium + Firefox)
- [ ] Les tests sont isolés (chaque test nettoie ses données)
- [ ] Le test PDF vérifie le téléchargement réel
- [ ] Les cas d'erreur réseau sont couverts avec `page.route()`
- [ ] Non-régression sur les 2 tests E2E existants et les tests d'auth (AUDIT-205)
- [ ] Durée totale de la suite E2E < 5 minutes (workers parallèles Playwright)
