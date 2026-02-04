# Story TECH-012 : Documenter le benchmark de performance API

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : 📋 Backlog
> **Type** : Documentation / QA
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)

---

## 1. Description

**En tant que** équipe technique
**Je veux** documenter les performances de l'API `/api/calculate`
**Afin de** prouver le respect du critère DoD "Performance < 500ms"

---

## 2. Contexte

Le critère DoD de l'Epic 1 exige une performance < 500ms pour l'API de calcul. Ce critère n'a pas été formellement mesuré et documenté.

---

## 3. Tâches

### 3.1 Créer un script de benchmark

```typescript
// scripts/benchmark-api.ts
// Mesurer les temps de réponse sur N requêtes
// Avec différents datasets (simple, complexe, multi-associés)
```

### 3.2 Définir les cas de test

| Cas | Description | Cible |
|-----|-------------|-------|
| Simple | Nom propre, 1 bien, financement standard | < 100ms |
| Moyen | SCI IS, 2 associés, projection 10 ans | < 300ms |
| Complexe | SCI IS, 4 associés, tous régimes comparés | < 500ms |

### 3.3 Documenter les résultats

Créer `docs/performance-benchmark.md` avec :
- Méthodologie
- Résultats mesurés
- Environnement de test
- Recommandations

---

## 4. Critères d'acceptation

- [ ] Script de benchmark créé et exécutable
- [ ] 3+ cas de test documentés
- [ ] Temps moyen < 500ms démontré
- [ ] Documentation ajoutée dans `docs/`

---

## 5. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 2 |
| Priorité | P4 |
| Risque | Faible |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création (dette technique DoD Epic 1) | John (PM) |
