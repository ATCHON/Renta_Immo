# Plan UX - Refonte Page Resultats

## Statut : IMPLEMENTE (2026-02-08)

## Changements effectues

### Phase 1 : Pipeline de donnees
- **`src/types/calculateur.ts`** : 3 nouvelles interfaces (`ScoreDetailResultat`, `PointAttentionDetail`, `RecommandationDetail`) + `SyntheseResultat` enrichi avec champs optionnels
- **`src/server/calculations/index.ts`** : Mapping API passe `evaluation`, `couleur`, `score_detail`, `points_attention_detail`, `recommandations_detail`

### Phase 2 : ScorePanel
- **`src/components/results/ScorePanel.tsx`** (NOUVEAU) : Score colore par plage, badge evaluation, barre de legende 4 segments, decomposition des 6 ajustements en barres horizontales, recommandation textuelle

### Phase 3 : Architecture de l'information
- **`src/components/results/InputRecap.tsx`** (NOUVEAU) : Grille 4 colonnes (bien/financement/exploitation/structure)
- **`src/components/results/PointsAttention.tsx`** (NOUVEAU) : Alertes structurees avec priorite visuelle (error/warning/info)
- **`src/components/results/RecommandationsPanel.tsx`** (NOUVEAU) : Cards recommandations par priorite, fallback legacy

### Phase 4 : Graphiques ameliores
- **`src/components/results/CashflowChart.tsx`** : ComposedChart, couleurs design system, legende, ligne cumulative, ReferenceLine equilibre, tooltip enrichi, 350px
- **`src/components/results/PatrimoineChart.tsx`** : Couleurs design system, gradient patrimoine net, ReferenceLine fin credit, tooltip enrichi, 350px
- **`src/hooks/useChartData.ts`** : `cashflowCumule`, `breakEvenYear`, `loanEndYear`

### Phase 5 : Coherence visuelle
- **`src/components/results/Dashboard.tsx`** : MetricCard avec statuts contextuels, titres de sections, graphiques sortis du Collapsible, nouvel ordre des sections

## Nouvel ordre des sections (Dashboard.tsx)
1. Header (adresse, boutons)
2. ScenarioTabs
3. InputRecap (NOUVEAU)
4. ScorePanel (NOUVEAU)
5. KPI Cards (MetricCard)
6. PointsAttention (NOUVEAU)
7. InvestmentBreakdown + OperationalBalance
8. FiscalComparator
9. HCSFIndicator + RecommandationsPanel (remplace Expertise Strategique)
10. Graphiques (visibles, hors Collapsible)
11. Collapsible : Financement & Amortissement
12. Collapsible : Projections detaillees (table uniquement)
13. Lien Methodologie

## Retrocompatibilite
- Tous les nouveaux champs dans `SyntheseResultat` sont optionnels (`?`)
- Anciennes simulations sauvegardees fonctionnent (fallbacks dans les composants)
- 112 tests existants restent verts
