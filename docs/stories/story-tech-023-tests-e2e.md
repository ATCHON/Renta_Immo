# Story TECH-023 : Tests E2E principaux scénarios

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : 📋 Backlog
> **Type** : QA
> **Epic** : Epic 2 - Fonctionnalités MVP (DoD)

---

## 1. Description

**En tant que** équipe QA
**Je veux** des tests end-to-end automatisés
**Afin de** valider les parcours utilisateur critiques

---

## 2. Contexte

Le DoD de l'Epic 2 exige des tests E2E pour les scénarios principaux. Actuellement, seuls des tests unitaires existent (32 tests). Les tests E2E permettront de valider l'intégration complète.

---

## 3. Scénarios à couvrir

### 3.1 Parcours principal : Simulation complète

```gherkin
Feature: Simulation de rentabilité

  Scenario: Simulation nom propre location nue
    Given je suis sur la page d'accueil
    When je remplis le formulaire bien (150000€, ancien)
    And je remplis le financement (30000€ apport, 20 ans)
    And je remplis l'exploitation (750€ loyer)
    And je choisis "Nom propre" et "Location nue micro-foncier"
    And je clique sur "Calculer"
    Then je vois les résultats avec rentabilité brute
    And je vois le score global
    And je vois le cashflow mensuel
```

### 3.2 Multi-scénarios

```gherkin
Scenario: Comparaison de scénarios
    Given j'ai une simulation active
    When je clique sur "Dupliquer"
    Then j'ai 2 onglets de scénario
    When je modifie le loyer du scénario 2
    And je recalcule
    Then les deux scénarios ont des résultats différents
```

### 3.3 Comparateur fiscal

```gherkin
Scenario: Comparaison des régimes fiscaux
    Given j'ai une simulation avec résultats
    When je consulte le comparateur fiscal
    Then je vois les 5 régimes comparés
    And le régime optimal est mis en évidence
```

### 3.4 Projections

```gherkin
Scenario: Visualisation des projections
    Given j'ai une simulation avec résultats
    When je consulte les graphiques
    Then je vois l'évolution du cashflow sur 20 ans
    And je vois l'évolution du patrimoine
```

---

## 4. Stack technique recommandée

| Option | Description | Avantages |
|--------|-------------|-----------|
| **Playwright** | Framework E2E moderne | Rapide, multi-navigateur, API intuitive |
| Cypress | Alternative populaire | Grande communauté, dashboard |

**Recommandation** : Playwright (meilleure intégration Next.js)

---

## 5. Structure fichiers

```
e2e/
├── fixtures/
│   └── simulation-data.json
├── tests/
│   ├── simulation-complete.spec.ts
│   ├── multi-scenarios.spec.ts
│   ├── fiscal-comparator.spec.ts
│   └── projections.spec.ts
└── playwright.config.ts
```

---

## 6. Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  baseURL: 'http://localhost:3000',
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 7. Critères d'acceptation

- [ ] Playwright installé et configuré
- [ ] 4 scénarios E2E implémentés (voir section 3)
- [ ] Tests passent en local
- [ ] Tests passent en CI (GitHub Actions)
- [ ] Temps d'exécution < 2 minutes
- [ ] Screenshots sur échec

---

## 8. Dépendances

| Type | Dépendance |
|------|------------|
| Optionnel | CI/CD configuré pour exécuter les tests |

---

## 9. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 5 |
| Priorité | P3 |
| Risque | Moyen |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création (DoD Epic 2) | John (PM) |
