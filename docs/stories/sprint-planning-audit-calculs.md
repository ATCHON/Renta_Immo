# Sprint Planning - Audit Methodologies Calculs

> **Date** : 7 Fevrier 2026
> **Source** : Audit methodologies calculs 2026-02-07

---

## Resume des stories

| Story | Titre | Priorite | Effort | Phase |
|-------|-------|----------|--------|-------|
| AUDIT-100 | Fiscalite dans les projections | P0 | 2-3j | Phase 1 |
| AUDIT-101 | Part terrain parametree | P1 | 0.5j | Phase 1 |
| AUDIT-102 | Effet levier apport=0 | P1 | 0.5h | Phase 1 |
| AUDIT-103 | Deficit foncier | P2 | 1-2j | Phase 2 |
| AUDIT-104 | Amortissement par composants | P2 | 1j | Phase 2 |
| AUDIT-105 | Plus-value a la revente | P2 | 2j | Phase 2 |
| AUDIT-106 | Scoring specification | P2 | 1j | Phase 2 |

**Effort total** : ~9-11 jours

---

## Phase 1 - Corrections prioritaires (fiabilite)

> **Objectif** : Corriger les resultats faux presentes a l'utilisateur
> **Effort** : ~3-4 jours

| Ordre | Story | Titre | Effort | Dependances |
|-------|-------|-------|--------|-------------|
| 1 | AUDIT-102 | Effet levier apport=0 | 0.5h | - |
| 2 | AUDIT-101 | Part terrain parametree | 0.5j | - |
| 3 | AUDIT-100 | Fiscalite dans les projections | 2-3j | - |

### Graphe de dependances

```
AUDIT-102 (Effet levier)      ──► Independant
AUDIT-101 (Part terrain)      ──► Independant
AUDIT-100 (Fiscalite projections) ──► Prerequis pour Phase 2
```

### Definition of Done Phase 1

- [ ] L'effet de levier ne retourne plus de valeur aberrante
- [ ] La part terrain est adaptee au type de bien
- [ ] Les projections integrent l'impot annuel
- [ ] Le TRI est un TRI investisseur reel (apres impots)
- [ ] Le cashflow cumule et l'enrichissement total sont corrects
- [ ] Tests de non-regression passes

---

## Phase 2 - Enrichissements metier (precision)

> **Objectif** : Completer les calculs metier manquants
> **Effort** : ~5-6 jours
> **Prerequis** : Phase 1 terminee (AUDIT-100 en particulier)

| Ordre | Story | Titre | Effort | Dependances |
|-------|-------|-------|--------|-------------|
| 1 | AUDIT-103 | Deficit foncier | 1-2j | AUDIT-100 |
| 2 | AUDIT-104 | Amortissement par composants | 1j | AUDIT-101 |
| 3 | AUDIT-105 | Plus-value a la revente | 2j | AUDIT-100 |
| 4 | AUDIT-106 | Scoring specification | 1j | AUDIT-100 |

### Graphe de dependances

```
AUDIT-100 (Phase 1)
    │
    ├──► AUDIT-103 (Deficit foncier)
    ├──► AUDIT-105 (Plus-value revente)
    └──► AUDIT-106 (Scoring spec)

AUDIT-101 (Phase 1)
    │
    └──► AUDIT-104 (Amortissement composants)
```

### Definition of Done Phase 2

- [ ] Deficit foncier calcule et integre dans la comparaison des regimes
- [ ] Amortissement par composants disponible en option
- [ ] Plus-value a la revente calculee pour chaque horizon
- [ ] Scoring conforme a la specification metier
- [ ] Tests unitaires pour chaque nouvelle fonctionnalite

---

## Phase 3 - Evolutions (backlog)

Voir `backlog-audit-evolutions-p3.md` pour le detail des 10 evolutions identifiees.

Items les plus susceptibles d'etre planifies prochainement :
- E1 : Reste a vivre HCSF (0.5j)
- E2 : Frais de revente dans TRI (0.5j)
- E5 : Reintegration amortissements LMNP (1j, a integrer avec AUDIT-105)

---

## Risques

| Story | Risque | Mitigation |
|-------|--------|------------|
| AUDIT-100 | Complexite de l'integration fiscale annuelle | Reutiliser le module fiscal existant, ne pas dupliquer la logique |
| AUDIT-100 | Impact performance (calcul fiscal * horizon annees) | Profiler, le calcul fiscal est rapide (~1ms), pas de risque reel |
| AUDIT-105 | Complexite des baremes de plus-value | Tester exhaustivement les abattements par duree |
| AUDIT-106 | Rupture UX (scores differents apres mise a jour) | Communiquer le changement, montrer le detail du score |
