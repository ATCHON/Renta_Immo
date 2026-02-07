# Story TECH-022 : Configuration couverture de tests

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : 📋 Backlog
> **Type** : Dette Technique / QA
> **Epic** : Epic 2 - Fonctionnalités MVP (DoD)

---

## 1. Description

**En tant que** équipe de développement
**Je veux** mesurer la couverture de tests du code
**Afin de** garantir la qualité et identifier les zones non testées

---

## 2. Contexte

Lors de la validation DoD de l'Epic 2, l'exécution de `npm run test -- --coverage` a échoué car le package `@vitest/coverage-v8` n'est pas installé. La couverture de tests est un critère de qualité important.

---

## 3. Tâches

### 3.1 Installer le package de couverture

```bash
npm install -D @vitest/coverage-v8
```

### 3.2 Configurer Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.test.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        // Modules calculs : objectif 80%
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

### 3.3 Ajouter script npm

```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage"
  }
}
```

### 3.4 Documenter les résultats

- Générer le premier rapport de couverture
- Identifier les zones sous-testées
- Créer des stories pour améliorer la couverture si < 80%

---

## 4. Critères d'acceptation

- [ ] Package `@vitest/coverage-v8` installé
- [ ] Configuration Vitest mise à jour
- [ ] Script `npm run test:coverage` fonctionne
- [ ] Rapport HTML généré dans `coverage/`
- [ ] Couverture modules calculs mesurée

---

## 5. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 1 |
| Priorité | P3 |
| Risque | Faible |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création (DoD Epic 2) | John (PM) |
