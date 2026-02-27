# Prompt Phase 2 — Migration des Épics vers Notion

> **Usage** : Exécuter après la Phase 1. Remplacer `{EPICS_DB_ID}` par l'ID de la DB Épics.
> **Source** : `docs/stories/epics/`

---

## PROMPT COMPLET

```
Tu vas migrer les épics du projet Renta_Immo vers la base de données Notion "🎯 Épics".
ID de la DB Épics : {EPICS_DB_ID}

Lis chaque fichier source indiqué et crée l'entrée Notion correspondante.

---

## ÉPICS À CRÉER

### ÉPIC : epic-1 — Infrastructure Backend MVP
- Source : docs/stories/epics/epic-1-infrastructure-backend.md
- Phase : MVP
- Statut : Terminé
- Priorité : Critique
- Sprint : Sprint 1, Sprint 2, Sprint 3

### ÉPIC : epic-2 — Fonctionnalités MVP
- Source : docs/stories/epics/epic-2-fonctionnalites-mvp.md
- Phase : MVP
- Statut : Terminé
- Priorité : Critique
- Sprint : Sprint 1, Sprint 2, Sprint 3

### ÉPIC : upgrade-01 — Mise à jour Dépendances
- Source : docs/stories/epics/epic-upgrade-01-dependances.md
- Phase : Upgrade
- Statut : En cours
- Priorité : Haute
- Sprint : Backlog

### ÉPIC : V2-01 — Corrections Critiques Plus-Value
- Source : docs/stories/epics/epic-v2-01-corrections-plus-value.md
- Phase : V2
- Statut : Terminé
- Priorité : Critique
- Sprint : Sprint 1

### ÉPIC : V2-02 — Vacance Locative
- Source : docs/stories/epics/epic-v2-02-vacance-locative.md
- Phase : V2
- Statut : Terminé
- Priorité : Critique
- Sprint : Sprint 1

### ÉPIC : V2-03 — Conformité Fiscale LMNP
- Source : docs/stories/epics/epic-v2-03-conformite-fiscale-lmnp.md
- Phase : V2
- Statut : En cours
- Priorité : Critique
- Sprint : Sprint 2

### ÉPIC : V2-04 — DPE & Projections
- Source : docs/stories/epics/epic-v2-04-dpe-projections.md
- Phase : V2
- Statut : En cours
- Priorité : Critique
- Sprint : Sprint 2

### ÉPIC : V2-05 — Déficit Foncier
- Source : docs/stories/epics/epic-v2-05-deficit-foncier.md
- Phase : V2
- Statut : En cours
- Priorité : Haute
- Sprint : Sprint 2

### ÉPIC : V2-06 — Scoring Dual Profil
- Source : docs/stories/epics/epic-v2-06-scoring-dual-profil.md
- Phase : V2
- Statut : Backlog
- Priorité : Normale
- Sprint : Sprint 3

### ÉPIC : V2-07 — HCSF Ajustable
- Source : docs/stories/epics/epic-v2-07-hcsf-ajustable.md
- Phase : V2
- Statut : Backlog
- Priorité : Normale
- Sprint : Sprint 3

### ÉPIC : V2-08 — Backoffice Config
- Source : docs/stories/epics/epic-v2-08-backoffice-config.md
- Phase : V2
- Statut : Backlog
- Priorité : Haute
- Sprint : Sprint 4+

### ÉPIC : sprint4-backoffice — Sprint 4 Backoffice Architecture
- Source : docs/stories/epics/sprint4-backoffice-architecture.md
- Phase : V2
- Statut : Backlog
- Priorité : Haute
- Sprint : Sprint 4+

### ÉPIC : audit-calculs — Audit Méthodologies Calculs
- Source : docs/stories/epics/sprint-planning-audit-calculs.md
- Phase : Audit
- Statut : Terminé
- Priorité : Critique
- Sprint : Sprint 1

### ÉPIC : maintenance-post1 — Maintenance Post-Sprint 1
- Source : docs/stories/epics/maintenance-sprint-1-post.md
- Phase : Maintenance
- Statut : Terminé
- Priorité : Normale
- Sprint : Sprint 1

---

## FORMAT DE CRÉATION

Pour chaque épic, crée une page dans la DB avec :
1. L'entrée dans la DB avec toutes les propriétés renseignées
2. Une sous-page contenant : objectif, liste des stories (IDs), fichiers impactés

---

## RÉSULTAT ATTENDU

Confirme la création de chaque épic avec son ID Notion.
Retourne un tableau récapitulatif :
| ID Épic | Titre | ID Notion | Statut création |
|---------|-------|-----------|----------------|
```

---

## Statuts de référence par épic (état actuel dans les docs)

| Épic | Statut actuel dans /docs |
|------|--------------------------|
| epic-1, epic-2 | Terminé (MVP livré) |
| upgrade-01 | En attente (dépendances blocantes) |
| V2-01, V2-02 | Terminé (Sprint V2 Sprint 1) |
| V2-03, V2-04, V2-05 | En cours (Sprint V2 Sprint 2) |
| V2-06, V2-07 | Backlog (Sprint V2 Sprint 3) |
| V2-08, sprint4 | Backlog (Sprint 4+) |
| audit-calculs | Terminé (Phase 1 + Phase 2) |
