# Prompt Phase 3 — Migration des Stories vers Notion

> **Usage** : Exécuter après la Phase 2. Remplacer les IDs par ceux obtenus en Phase 1 et 2.
> **Volume** : ~109 stories réparties en 7 catégories

---

## PROMPT COMPLET

```
Tu vas migrer toutes les stories du projet Renta_Immo vers la base de données Notion "📖 Stories".
ID de la DB Stories : {STORIES_DB_ID}
ID de la DB Épics : {EPICS_DB_ID}

Pour chaque story, crée une entrée dans la DB Stories avec :
- Toutes les propriétés renseignées
- La relation avec l'épic correspondant
- Le contenu de la story en corps de page (contexte, objectifs, critères d'acceptation)

Procède catégorie par catégorie dans l'ordre indiqué.

---

## CATÉGORIE 1 : Stories Métier V2 (26 stories)

Épic associé : V2-01 à V2-08 (selon le contenu)
Type : Métier
Source : docs/stories/metier/v2-s01 à v2-s26

| ID | Fichier | Épic | Priorité | Complexité | Statut |
|----|---------|------|----------|------------|--------|
| V2-S01 | v2-s01-formule-prix-acquisition.md | V2-01 | P0 | M | Done |
| V2-S02 | v2-s02-bareme-abattements-pv.md | V2-01 | P0 | S | Done |
| V2-S03 | v2-s03-bareme-surtaxe-pv.md | V2-01 | P0 | S | Done |
| V2-S04 | v2-s04-audit-taux-ps.md | V2-01 | P0 | S | Done |
| V2-S05 | v2-s05-reintegration-amort-lmnp.md | V2-01 | P0 | M | Done |
| V2-S06 | v2-s06-propagation-taux-occupation.md | V2-02 | P0 | M | Done |
| V2-S07 | v2-s07-slider-taux-occupation.md | V2-02 | P1 | S | Done |
| V2-S08 | v2-s08-tests-regression-vacance.md | V2-02 | P1 | S | Done |
| V2-S09 | v2-s09-micro-bic-categories.md | V2-03 | P1 | S | Todo |
| V2-S10 | v2-s10-cfe-charges-lmnp.md | V2-03 | P1 | S | Todo |
| V2-S11 | v2-s11-frais-comptabilite-lmnp.md | V2-03 | P1 | XS | Todo |
| V2-S12 | v2-s12-audit-oga-cga.md | V2-03 | P2 | S | Todo |
| V2-S13 | v2-s13-dpe-inflation-loyers.md | V2-04 | P1 | M | Todo |
| V2-S14 | v2-s14-dpe-revalorisation-bien.md | V2-04 | P1 | M | Todo |
| V2-S15 | v2-s15-deficit-foncier-majore.md | V2-05 | P1 | M | Todo |
| V2-S16 | v2-s16-scoring-patrimonial.md | V2-06 | P2 | L | Backlog |
| V2-S17 | v2-s17-alerte-seuil-lmp.md | V2-06 | P2 | S | Backlog |
| V2-S18 | v2-s18-hcsf-ponderation-configurable.md | V2-07 | P2 | M | Backlog |
| V2-S19 | v2-s19-schema-config-param.md | V2-08 | P1 | M | Backlog |
| V2-S20 | v2-s20-api-crud-params.md | V2-08 | P1 | M | Backlog |
| V2-S21 | v2-s21-interface-admin-params.md | V2-08 | P1 | L | Backlog |
| V2-S22 | v2-s22-migration-constantes-bdd.md | V2-08 | P1 | M | Backlog |
| V2-S23 | v2-s23-alertes-dispositifs-temporaires.md | V2-08 | P2 | S | Backlog |
| V2-S24 | v2-s24-mode-dry-run.md | V2-08 | P2 | S | Backlog |
| V2-S25 | v2-s25-regroupement-constantes-techniques.md | V2-08 | P2 | S | Backlog |
| V2-S26 | v2-s26-audit-global.md | V2-08 | P3 | M | Backlog |

---

## CATÉGORIE 2 : Stories Tech MVP (25 stories)

Épic associé : epic-1 (001-009, 017-025) et epic-2 (010-016)
Type : Tech
Source : docs/stories/tech/story-tech-001 à 025

| ID | Fichier | Épic | Priorité | Complexité | Statut |
|----|---------|------|----------|------------|--------|
| TECH-001 | story-tech-001-structure-calculs.md | epic-1 | P1 | M | Done |
| TECH-002 | story-tech-002-validation-entrees.md | epic-1 | P1 | S | Done |
| TECH-003 | story-tech-003-calculs-rentabilite.md | epic-1 | P1 | M | Done |
| TECH-004 | story-tech-004-calculs-fiscalite.md | epic-1 | P1 | L | Done |
| TECH-005 | story-tech-005-analyse-hcsf.md | epic-1 | P1 | M | Done |
| TECH-006 | story-tech-006-synthese-scoring.md | epic-1 | P1 | M | Done |
| TECH-007 | story-tech-007-tests-regression.md | epic-1 | P2 | M | Done |
| TECH-008 | story-tech-008-api-route.md | epic-1 | P1 | S | Done |
| TECH-009 | story-tech-009-integration-frontend.md | epic-1 | P1 | L | Done |
| TECH-010 | story-tech-010-dette-any-types.md | epic-2 | P2 | M | Done |
| TECH-011 | story-tech-011-eslint-warning.md | epic-2 | P2 | S | Done |
| TECH-012 | story-tech-012-benchmark-performance.md | epic-2 | P3 | M | Done |
| TECH-013 | story-tech-013-setup-react-pdf.md | epic-2 | P1 | M | Done |
| TECH-014 | story-tech-014-template-rapport-pdf.md | epic-2 | P1 | L | Done |
| TECH-015 | story-tech-015-route-api-pdf.md | epic-2 | P1 | S | Done |
| TECH-016 | story-tech-016-integration-ui-pdf.md | epic-2 | P1 | S | Done |
| TECH-017 | story-tech-017-setup-supabase.md | epic-1 | P1 | M | Done |
| TECH-018 | story-tech-018-schema-bdd.md | epic-1 | P1 | M | Done |
| TECH-019 | story-tech-019-client-supabase.md | epic-1 | P1 | S | Done |
| TECH-020 | story-tech-020-api-crud-simulations.md | epic-1 | P1 | M | Done |
| TECH-021 | story-tech-021-integration-ui-simulations.md | epic-1 | P1 | L | Done |
| TECH-022 | story-tech-022-test-coverage.md | epic-1 | P2 | M | Done |
| TECH-023 | story-tech-023-tests-e2e.md | epic-1 | P2 | L | Done |
| TECH-024 | story-tech-024-complement.md | epic-1 | P2 | M | Done |
| TECH-025 | story-tech-025-better-auth-implementation.md | epic-1 | P1 | L | Done |

---

## CATÉGORIE 3 : Stories Audit Fonctionnel (11 stories)

Épic associé : audit-calculs
Type : Audit
Source : docs/stories/audit/story-audit-100 à 110

| ID | Fichier | Priorité | Complexité | Statut |
|----|---------|----------|------------|--------|
| AUDIT-100 | story-audit-100-fiscalite-projections.md | P0 | M | Done |
| AUDIT-101 | story-audit-101-part-terrain-parametree.md | P1 | XS | Done |
| AUDIT-102 | story-audit-102-effet-levier-apport-zero.md | P1 | XS | Done |
| AUDIT-103 | story-audit-103-deficit-foncier.md | P2 | M | Done |
| AUDIT-104 | story-audit-104-amortissement-composants.md | P2 | M | Done |
| AUDIT-105 | story-audit-105-plus-value-revente.md | P2 | L | Done |
| AUDIT-106 | story-audit-106-scoring-specification.md | P2 | M | Done |
| AUDIT-107 | story-audit-107-reste-a-vivre-hcsf.md | P3 | S | Backlog |
| AUDIT-108 | story-audit-108-frais-revente-tri.md | P3 | S | Backlog |
| AUDIT-109 | story-audit-109-assurance-capital-restant-du.md | P3 | S | Backlog |
| AUDIT-110 | story-audit-110-dpe-alertes-passoires.md | P3 | S | Backlog |

---

## CATÉGORIE 4 : Stories Audit Technique / Tests (7 stories)

Épic associé : audit-calculs
Type : Audit
Source : docs/stories/audit/story-audit-201 à 206 + corrections

| ID | Fichier | Priorité | Complexité | Statut |
|----|---------|----------|------------|--------|
| AUDIT-001 | story-audit-corrections.md | P1 | S | Done |
| AUDIT-201 | story-audit-201-config-vitest-playwright.md | P1 | M | Done |
| AUDIT-202 | story-audit-202-precommit-husky-lintstaged.md | P1 | S | Done |
| AUDIT-203 | story-audit-203-tests-api-simulations.md | P1 | M | En cours |
| AUDIT-204 | story-audit-204-tests-hooks-utilitaires.md | P1 | M | En cours |
| AUDIT-205 | story-audit-205-tests-e2e-authentification.md | P2 | L | Backlog |
| AUDIT-206 | story-audit-206-tests-e2e-simulations-pdf-filtres.md | P2 | L | Backlog |

---

## CATÉGORIE 5 : Stories Upgrade (3 stories)

Épic associé : upgrade-01
Type : Upgrade
Source : docs/stories/upgrade/

| ID | Fichier | Priorité | Complexité | Statut |
|----|---------|----------|------------|--------|
| UPGRADE-001 | story-upgrade-001-eslint-v10.md | P1 | M | Backlog |
| UPGRADE-002 | story-upgrade-002-tailwind-v4.md | P1 | L | Backlog |
| UPGRADE-003 | story-upgrade-003-react19-nextjs16.md | P2 | XL | Backlog |

---

## CATÉGORIE 6 : Stories Métier Sprint (12 stories)

Épic associé : epic-2 (fonctionnalités MVP)
Type : Métier
Source : docs/stories/metier/ (fichiers non-v2)

| ID | Fichier | Priorité | Complexité | Statut |
|----|---------|----------|------------|--------|
| S-2.3.1 | 2.3.1.simulation-pluriannuelle.md | P1 | L | Done |
| S-2.3.2 | 2.3.2.tableau-amortissement-credit.md | P1 | M | Done |
| S-2.3.3 | 2.3.3.evolution-loyer-irl.md | P1 | S | Done |
| S-2.3.4 | 2.3.4.evolution-charges.md | P1 | S | Done |
| S-2.5.3 | 2.5.3-comparateur-fiscal.md | P1 | L | Done |
| S-2.6.1 | 2.6.1-multi-scenarios.md | P2 | L | Done |
| S-2.6.3 | 2.6.3-graphiques-evolution.md | P2 | M | Done |
| S-2.6.4 | 2.6.4-formulaire-regimes-ui.md | P2 | M | Done |
| S4.3 | S4.3.effort-epargne-hcsf.md | P2 | M | Done |
| S4.4 | S4.4.effet-levier.md | P2 | M | Done |
| S5.1 | S5.1.charges-recuperables.md | P2 | S | Done |
| S5.3 | S5.3.comparaison-regimes-fiscaux.md | P2 | L | Done |
| S5.4 | S5.4.optimisation-sci-is.md | P2 | L | Done |
| S6.1 | S6.1.multi-scenarios.md | P2 | L | Done |
| S6.3 | S6.3.graphiques-evolution.md | P2 | M | Done |
| S6.4 | S6.4.formulaire-regimes-ui.md | P2 | M | Done |

---

## FORMAT PAR STORY

Pour chaque story :
1. Crée l'entrée dans la DB avec toutes les propriétés
2. Lis le fichier source pour extraire :
   - Le contexte / description
   - Les critères d'acceptation (liste de cases à cocher)
   - Les fichiers impactés (src/)
   - Les dépendances vers d'autres stories
3. Remplis le corps de la page Notion avec ce contenu

---

## RÉSULTAT ATTENDU

Après chaque catégorie, confirme :
- Nombre de stories créées
- Nombre de relations Épics établies
- Stories avec statut "Bloqué" détectées
```

---

## Notes de migration

- Les stories avec `[x]` dans les critères d'acceptation → **Done**
- Les stories sans cases cochées → statut conservé du fichier source
- Les fichiers `handoff-sm-regles-metier-v2.md` et `backlog-audit-evolutions-p3.md` contiennent des items à créer comme **Backlog** stories individuelles
