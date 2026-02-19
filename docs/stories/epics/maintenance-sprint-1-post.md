# Maintenance Sprint 1 : Correctifs et Améliorations (Post-Sprint)

> **Type** : Maintenance / Tech Debt | **Date** : 2026-02-15
> **Statut** : Completed

## Contexte

Suite au déploiement des stories du Sprint 1 (V2-S01 à V2-S08), plusieurs incohérences visuelles et besoins de clarification ont été identifiés lors de la recette.

## Correctifs Traités

### FIX-01 : Cohérence Cashflow (Tableau & Recommandations)

**Problème :**

- Le tableau affichait "Cash-flow" avec la valeur brute (avant impôt), mais les KPI affichaient le net.
- Les recommandations "Améliorer le cashflow" se basaient parfois sur le brut, créant une contradiction visuelle (recommandation positive alors que le KPI était négatif).

**Solution :**

- **Tableau de projection** :
  - Renommé colonne "Cash-flow" en "CF Brut".
  - Ajout colonnes "Impôts" et "CF Net" pour une transparence totale.
- **Moteur de recommandation (`synthese.ts`)** :
  - Utilise désormais strictement le `cashflowNetImpotMensuel` pour déterminer les conseils (priorité haute si < 0).

### FIX-02 : Cohérence Graphe Patrimoine

**Problème :**

- Le graphe "Patrimoine Net" montrait `Valeur Bien - Capital Restant`.
- Cela ignorait le "drain" de trésorerie (cashflow négatif cumulé). Un projet avec un fort effort d'épargne semblait très enrichissant alors que l'investisseur perdait de l'argent chaque mois.

**Solution :**

- **Formule mise à jour** : `Patrimoine Net = (Valeur Bien - Capital Restant) + Cashflow Net Cumulé`.
- Si le cashflow est négatif, il vient réduire le patrimoine net, reflétant l'effort d'épargne réel.

### DOC-01 : Pédagogie & Tooltips

**Problème :**

- Les utilisateurs ne comprenaient pas toujours ce que représentaient les barres ou les courbes (ex: "Cumulé" vs "Annuel").

**Solution :**

- **Tooltips interactifs** ajoutés sur les légendes des graphes (au survol).
- **Page "En savoir plus"** mise à jour avec :
  - La nouvelle formule du patrimoine net.
  - Une section "Lecture des graphiques" expliquant chaque série de données.

## Fichiers Modifiés

- `src/server/calculations/synthese.ts`
- `src/components/results/ProjectionTable.tsx`
- `src/hooks/useChartData.ts`
- `src/components/results/CashflowChart.tsx`
- `src/components/results/PatrimoineChart.tsx`
- `src/app/en-savoir-plus/page.tsx`

## Validation

- **Tests unitaires** : 140 tests passés (0 régression).
- **Recette visuelle** : Tooltips fonctionnels, tableau complet, graphe patrimoine cohérent avec le KPI "Enrichissement".
