# Story UX-S03 : Dashboard Résultats & Projections 20 ans

> **Priorité** : P1
> **Effort** : L (3–4 jours)
> **Statut** : ✅ DONE — Sprint 3
> **Type** : Feature / UI
> **Epic** : UX Migration — Phase 3 : Dashboard Résultats
> **Branche** : `feature/verdant-simulator`
> **Dépendances** : UX-S00 ✅, UX-BE04 ✅ (TAEG exact disponible)

---

## 1. User Story

**En tant que** utilisateur ayant complété la simulation
**Je veux** consulter un dashboard de résultats visuel et structuré avec navigation par onglets
**Afin de** analyser facilement la rentabilité de mon investissement selon plusieurs axes (synthèse, projections, fiscalité, crédit).

---

## 2. Contexte

### 2.1 Maquettes de référence

- **Dashboard** : `tableau_de_bord_de_r_sultats_complet/` → [screen.png](docs/ux/stitch/v1/stitch_nordic_minimalist/tableau_de_bord_de_r_sultats_complet/screen.png) | [code.html](docs/ux/stitch/v1/stitch_nordic_minimalist/tableau_de_bord_de_r_sultats_complet/code.html)
  - Score panel, KPI cards, sidebar navigation, charts
- **Projections** : `20_year_financial_projections/` → [screen.png](docs/ux/stitch/v1/stitch_nordic_minimalist/20_year_financial_projections/screen.png) | [code.html](docs/ux/stitch/v1/stitch_nordic_minimalist/20_year_financial_projections/code.html)
  - Year-by-year table, Wealth Evolution chart

### 2.2 Décision de navigation — State local (validée par Winston)

> [!NOTE]
> **Décision validée** : Les onglets de navigation des résultats sont gérés via **state local** dans `Dashboard.tsx` (`useState`), sans routes URL séparées. Cela simplifie la Phase 3 et évite de gérer la persistance entre routes.
>
> Avantage du routage URL (liens partageables, historique browser) → reporté en V2. L'état Zustand persist via localStorage, donc les données sont accessibles en cas de refresh.

**Structure des onglets** :

| Onglet         | Contenu                                                                   | État       |
| -------------- | ------------------------------------------------------------------------- | ---------- |
| Analyse        | Dashboard complet (score, KPIs, charts, fiscal comparator, amortissement) | ✅ Phase 3 |
| Projections    | Projection 20 ans (Wealth Evolution, Cumul Cash-Flow, Year-by-Year)       | ✅ Phase 3 |
| Données marché | Placeholder « Bientôt disponible »                                        | 🔒 V2      |
| Propriétés     | Placeholder « Bientôt disponible »                                        | 🔒 V2      |

### 2.3 Données disponibles (et manquantes)

| KPI                          | Source                                        | Disponibilité                 |
| ---------------------------- | --------------------------------------------- | ----------------------------- |
| TAEG                         | `FinancementResultat.taeg` (BE-03+04)         | ✅ Après Phase 1 backend      |
| Coût total crédit            | `FinancementResultat.cout_total_credit`       | ✅ Déjà disponible            |
| Effort d'épargne mensuel     | `RentabiliteResultat.effort_epargne_mensuel?` | ✅ Déjà calculé               |
| Patrimoine net courbe 20 ans | `ProjectionData.projections[].patrimoineNet`  | ✅ Données existent           |
| TRI                          | `ProjectionData.totaux.tri`                   | ✅ Déjà calculé               |
| NPV/VAN                      | Non calculé                                   | ❌ V2 — documenter comme stub |

> ⚠️ Vérifier les noms exacts des champs dans `src/types/calculateur.ts` pour `RentabiliteResultat` et `ProjectionData`.

---

## 3. Critères d'acceptation

### 3.1 Refonte `Dashboard.tsx`

- [ ] Navigation par onglets (4 onglets, les 2 derniers sont des stubs)
- [ ] Layout : sidebar de navigation verticale à gauche (Overview, Performance, Projections, Taxation, Credit) sur desktop
- [ ] Sur mobile : onglets horizontaux en top
- [ ] L'onglet actif est géré via `useState<'analyse' | 'projections' | 'marche' | 'proprietes'>`

### 3.2 Refonte `ScorePanel.tsx`

- [ ] Score circulaire grand format (SVG progress circle)
- [ ] Badge textuel sous le score : `EXCELLENT` (≥ 80), `BON` (60–79), `MOYEN` (40–59), `FAIBLE` (< 40)
- [ ] Couleur du score : emerald si ≥ 70, orange si 40–69, rouge si < 40
- [ ] Taille minimum : 120px × 120px

### 3.3 Refonte `MetricCard.tsx`

- [ ] Style tonal (fond `--color-surface`, pas de bordures `border`)
- [ ] Séparation par tonalité (fond légèrement différencié entre les cartes, pas de lignes divisoires)
- [ ] Micro-animation au hover : légère élévation `translateY(-2px)` + shadow

### 3.4 Refonte des charts (Recharts)

> [!NOTE]
> Recharts ne lit pas les CSS custom properties nativement. Utiliser les constantes depuis `src/styles/verdant-tokens.ts` (créées en Phase 0).

- [ ] **`CashflowChart.tsx`** : Bar chart avec barres `VerdantColors.primary` en positif, rouge `VerdantColors.error` en négatif
- [ ] **`PatrimoineChart.tsx`** : Line chart avec gradient fill (`linearGradient` Recharts : `VerdantColors.primary` → transparent)
- [ ] Les légendes et tooltips sont en français

### 3.5 Refonte `FiscalComparator.tsx`

- [ ] Liste verticale (remplace le tableau actuel)
- [ ] Le régime recommandé (meilleur TRI) porte un badge vert `RECOMMANDÉ`
- [ ] Chaque ligne montre : régime, rendement net-net projeté, TRI

### 3.6 Refonte `AmortizationTable.tsx`

- [ ] Style accordéon : les premières années sont visibles, le reste se déplie via « Voir le tableau complet 20 ans »
- [ ] Le bouton de dépliage est un lien textuel (pas un bouton plein)

### 3.7 Refonte `ProjectionTable.tsx`

- [ ] Toggle « Annuel / Trimestriel » (state local)
- [ ] Year-by-Year Breakdown avec colonnes : Année, Cash-flow net, Patrimoine, Remb. capital
- [ ] KPIs charts juxtaposés au-dessus du tableau (ligne « Cumul cash-flow » + ligne « Évolution patrimoine »)

### 3.8 Refonte `DownloadPdfButton.tsx`

- [ ] Bouton principal style pill emerald : « Télécharger le rapport PDF »
- [ ] Bouton secondaire ghost : « Sauvegarder le brouillon »
  - Si non connecté : redirige vers `/auth/login`
  - Si connecté : appelle `POST /api/simulations` (déjà implémenté ✅)

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                                        | Action | Détail                               |
| ---------------------------------------------- | ------ | ------------------------------------ |
| `src/components/results/Dashboard.tsx`         | MODIFY | Layout sidebar + onglets state local |
| `src/components/results/ScorePanel.tsx`        | MODIFY | Score grand format, badge            |
| `src/components/results/MetricCard.tsx`        | MODIFY | Style tonal sans bordures            |
| `src/components/results/CashflowChart.tsx`     | MODIFY | Couleurs VerdantColors               |
| `src/components/results/PatrimoineChart.tsx`   | MODIFY | Gradient fill Recharts               |
| `src/components/results/FiscalComparator.tsx`  | MODIFY | Liste + badge RECOMMANDÉ             |
| `src/components/results/AmortizationTable.tsx` | MODIFY | Accordéon                            |
| `src/components/results/ProjectionTable.tsx`   | MODIFY | Toggle Annuel/Trimestriel            |
| `src/components/results/DownloadPdfButton.tsx` | MODIFY | Pill + Save Draft                    |

### 4.2 Pas de NPV dans cette phase

La maquette affiche `$4,820,500 Projected NPV` — **hors scope**. Remplacer par une card `TRI` (qui existe déjà) ou laisser la zone vide avec un commentaire `// V2 : Calcul VAN`.

---

## 5. Tests

### 5.1 TU à créer/modifier

- `tests/unit/components/results/Dashboard.test.tsx` — vérifier le rendu des 4 onglets
- `tests/unit/components/results/ScorePanel.test.tsx` — vérifier les badges EXCELLENT/BON/MOYEN/FAIBLE
- `tests/unit/components/results/FiscalComparator.test.tsx` — vérifier le badge RECOMMANDÉ sur le meilleur régime

### 5.2 Commandes

```bash
# Suite complète — vérification zéro régression
npm run test

# E2E — parcours complet simulateur → résultats
npm run test:e2e

# Vérification non-régression des valeurs affichées
# 1. Lancer une simulation de référence (noter les KPIs)
# 2. Déployer la phase 3
# 3. Lancer la même simulation et comparer les valeurs
# → Toute divergence est une régression BLOQUANTE

# Lighthouse Accessibility + SEO
# mcp_chrome-devtools_lighthouse_audit sur /calculateur/resultats
```

---

## 6. Definition of Done

- [ ] 4 onglets fonctionnels (Analyse, Projections, + 2 stubs V2)
- [ ] Score panel avec badges
- [ ] Charts en couleurs Verdant
- [ ] `FiscalComparator` avec badge RECOMMANDÉ
- [ ] Save Draft redirige vers login si non connecté
- [ ] Valeurs KPIs **identiques** avant/après migration (zéro régression calcul)
- [ ] `npm run test` : 530+ TU verts
- [ ] TU créés pour les nouveaux comportements
- [ ] Aucun `any` TypeScript
- [ ] PR mergée depuis `feature/verdant-results`

---

## Changelog

| Date       | Version | Description                                       | Auteur    |
| ---------- | ------- | ------------------------------------------------- | --------- |
| 2026-03-25 | 1.0     | Création — Plan UX Sally + Plan technique Winston | John (PM) |
