# Prompt Phase 4 — Migration Bugs, Audits, Tests & Plans

> **Usage** : Exécuter après la Phase 3.
> **Sources** : `docs/bugs/`, `docs/audit/`, `docs/tests/`, `docs/plans/`

---

## PROMPT COMPLET

```
Tu vas migrer les bugs, audits, tests et plans de Renta_Immo vers Notion.
IDs des bases :
- DB Bugs : {BUGS_DB_ID}
- DB Audits : {AUDITS_DB_ID}
- DB Tests : {TESTS_DB_ID}
- DB Sprints : {SPRINTS_DB_ID}
- DB Stories : {STORIES_DB_ID}
- DB Épics : {EPICS_DB_ID}

---

## SECTION A : Audits

Crée les entrées dans la DB Audits :

### Audit 1 : Audit Méthodologies Calculs
- Titre : "Audit Méthodologies de Calculs — Phase 1 & 2"
- Date : 2026-02-07
- Type : Fonctionnel
- Statut : Terminé
- Fichier doc : docs/audit/audit-methodologies-calculs-2026-02-07.md
- Stories générées : AUDIT-100, AUDIT-101, AUDIT-102, AUDIT-103, AUDIT-104, AUDIT-105, AUDIT-106, AUDIT-107, AUDIT-108, AUDIT-109, AUDIT-110
- Épic lié : audit-calculs
- Résumé : "Audit complet des méthodes de calcul du simulateur. Identifié 11 stories correctrices et évolutives."

### Audit 2 : Audit Technique
- Titre : "Audit Technique — Dette Technique & Dépendances"
- Date : 2026-02-07
- Type : Technique
- Statut : Terminé
- Fichier doc : docs/audit/technique/audit-technique-2026-02-07.md
- Épic lié : upgrade-01

### Audit 3 : Audit UX
- Titre : "Audit UX — Interface Utilisateur"
- Date : 2026-02-06
- Type : UX
- Statut : Terminé
- Fichier doc : docs/ux/audit-ux-2026-02-06.md

### Audit 4 : Rapport Audit Simulateur
- Titre : "Rapport Audit Simulateur — Conformité Calculs"
- Date : 2026-02-18
- Type : Fonctionnel
- Statut : Terminé
- Fichier doc : docs/audit/fonctionnel/rapport-audit-simulateur-2026-02-18.md
- Stories générées : AUDIT-201, AUDIT-202, AUDIT-203, AUDIT-204, AUDIT-205, AUDIT-206

### Audit 5 : Revue Audit
- Titre : "Revue Audit — Modules Fonctionnels"
- Type : Fonctionnel
- Statut : Terminé
- Fichier doc : docs/audit/fonctionnel/revue-audit.md

### Audit 6 : Étude Impact Dépendances
- Titre : "Étude Impact — Mise à jour Dépendances"
- Type : Technique
- Statut : Terminé
- Fichier doc : docs/audit/technique/etude-impact-dependances.md
- Épic lié : upgrade-01

---

## SECTION B : Tests

Crée les entrées dans la DB Tests :

### Test 1 : Sprint 1 — Tests Unitaires
- Titre : "Tests Sprint 1 — Calculs Unitaires"
- Sprint : Sprint 1
- Type : Unit, Régression
- Statut : Passé
- Fichier doc : docs/tests/sprint1-tests.md
- Fichier résultats : docs/tests/sprint1-resultats.md

### Test 2 : Sprint 2 — Tests UI
- Titre : "Tests Sprint 2 — Interface & API"
- Sprint : Sprint 2
- Type : Integration, E2E
- Statut : Passé
- Fichier doc : docs/tests/sprint2-tests.md
- Fichiers résultats : docs/tests/test-report-sprint1-sprint2.md, docs/tests/test-report-sprint2-real.md, docs/tests/test-report-sprint2-ui-complement.md

### Test 3 : Sprint 3 — Tests Complets
- Titre : "Tests Sprint 3 — Régression & Corrections"
- Sprint : Sprint 3
- Type : Unit, Integration, E2E, Régression
- Statut : Passé
- Fichier doc : docs/tests/sprint3-tests.md
- Fichiers résultats : docs/tests/sprint3-resultats.md, docs/tests/sprint3-corrections-resume.md

### Test 4 : Sprint 4 — Tests Backoffice
- Titre : "Tests Sprint 4 — Backoffice & Paramètres"
- Sprint : Sprint 4
- Type : Unit, Integration
- Statut : Passé
- Fichier doc : docs/tests/sprint4-tests.md
- Fichier résultats : docs/tests/sprint4-resultats.md

### Test 5 : Tests Integration — Conformité Fiscale
- Titre : "Tests Intégration — Conformité Fiscale LMNP"
- Sprint : Sprint 4+
- Type : Integration, Régression
- Statut : En cours
- Fichier doc : docs/plans/2026-02-23-integration-tests-conformite-fiscale.md
- Fichiers spec : docs/tests/test-integration/00-index.md, 01-config-reference.md, 02-scenarios-specification.md
- Story liée : AUDIT-203, AUDIT-204

---

## SECTION C : Sprints & Plans

Crée les entrées dans la DB Sprints & Plans :

### Sprint 1 — MVP Initial
- Titre : "Sprint 1 — Fondations MVP"
- Type : Sprint
- Statut : Terminé
- Épics inclus : epic-1, epic-2
- Fichier doc : docs/stories/epics/sprint-planning.md

### Sprint Post-1 — Maintenance
- Titre : "Sprint Post-1 — Maintenance & Hotfix"
- Type : Maintenance
- Statut : Terminé
- Fichier doc : docs/stories/epics/maintenance-sprint-1-post.md

### Sprint Audit — Méthodologies Calculs
- Titre : "Sprint Audit — Corrections Méthodologies"
- Type : Sprint
- Statut : Terminé
- Épics inclus : audit-calculs
- Fichier doc : docs/stories/epics/sprint-planning-audit-calculs.md

### Sprint V2 — Vue d'ensemble
- Titre : "V2 — 4 Sprints Planifiés"
- Type : Plan
- Statut : En cours
- Épics inclus : V2-01, V2-02, V2-03, V2-04, V2-05, V2-06, V2-07, V2-08
- Fichier doc : docs/stories/epics/sprint-planning-v2.md

### Plan DevOps & Tests 2026-02-19
- Titre : "Plan — Audit Tests & DevOps"
- Type : Plan
- Statut : En cours
- Fichier doc : docs/plans/2026-02-19-audit-tests-devops.md

### Plan Conformité Fiscale 2026-02-23
- Titre : "Plan — Intégration Tests Conformité Fiscale"
- Type : Plan
- Statut : En cours
- Fichier doc : docs/plans/2026-02-23-integration-tests-conformite-fiscale.md

---

## SECTION D : Bugs

Lis les fichiers suivants et extrait les bugs identifiés :
- docs/bugs/fix-bugs.md
- docs/bugs/rapport-test-e2e.md

Pour chaque bug identifié, crée une entrée dans la DB Bugs avec :
- ID généré (BUG-001, BUG-002…)
- Titre du bug
- Statut (Résolu si corrigé dans le fichier)
- Priorité (déduite du contexte)
- Sprint découverte (déduit des dates/sprints mentionnés)
- Lien vers la story corrective si applicable

---

## RÉSULTAT ATTENDU

| Section | Nb entrées créées | Statut |
|---------|------------------|--------|
| Audits | 6 | — |
| Tests | 5 | — |
| Sprints/Plans | 6 | — |
| Bugs | À déterminer | — |
```
