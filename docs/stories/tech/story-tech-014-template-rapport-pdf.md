# Story TECH-014 : Template rapport PDF

> **Version** : 1.1
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : ✅ Ready for Review
> **Type** : Feature
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)
> **Sprint** : Sprint 1

---

## 1. Description

**En tant qu'** utilisateur
**Je veux** un rapport PDF professionnel de ma simulation
**Afin de** le présenter à ma banque ou mon conseiller

---

## 2. Contexte

Le rapport PDF doit contenir toutes les informations clés de la simulation dans un format professionnel et lisible. Il servira de document de référence pour les démarches bancaires.

---

## 3. Structure du rapport

### Page 1 : Synthèse

- Logo / En-tête Renta_Immo
- Date de génération
- Score global avec jauge visuelle
- Indicateurs clés (rentabilité brute/nette, cashflow, taux HCSF)
- Verdict (Excellent / Bon / Moyen / Faible)

### Page 2 : Détail du bien

- Informations du bien (prix, surface, localisation)
- Financement (apport, crédit, mensualité)
- Exploitation (loyer, charges, vacance)

### Page 3 : Analyse financière

- Tableau récapitulatif des calculs
- Graphique cashflow (si possible)
- Comparaison régimes fiscaux

### Page 4 : Conformité HCSF

- Taux d'endettement calculé
- Seuil réglementaire (35%)
- Statut conformité
- Recommandations

### Pied de page

- Disclaimer légal
- "Généré par Renta_Immo - Simulation non contractuelle"
- Numéro de page

---

## 4. Composants à créer

```
src/lib/pdf/
├── templates/
│   └── RapportSimulation.tsx   # Template principal
├── components/
│   ├── Header.tsx              # En-tête avec logo
│   ├── Footer.tsx              # Pied de page
│   ├── ScoreGauge.tsx          # Jauge score visuelle
│   ├── KeyMetrics.tsx          # Indicateurs clés
│   ├── PropertyDetails.tsx     # Détails du bien
│   ├── FinancialTable.tsx      # Tableau financier
│   └── HcsfAnalysis.tsx        # Analyse HCSF
└── styles.ts                   # Styles centralisés
```

---

## 5. Critères d'acceptation

- [x] Template `RapportSimulation.tsx` créé
- [x] Toutes les sections du rapport implémentées
- [x] Styles professionnels (couleurs, typographie)
- [x] PDF généré correctement avec données de test
- [x] Format A4, lisible imprimé
- [x] Disclaimer légal présent

---

## 6. Dépendances

| Type | Dépendance |
|------|------------|
| Dépend de | TECH-013 (Setup react-pdf) |
| Bloque | TECH-015 (Route /api/pdf) |

---

## 7. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 5 |
| Priorité | P2 |
| Risque | Faible |

---

## 8. Maquette

```
┌─────────────────────────────────────┐
│  [LOGO]  RAPPORT DE SIMULATION      │
│          2026-02-04                 │
├─────────────────────────────────────┤
│                                     │
│   SCORE GLOBAL: 78/100  [████░░]    │
│   Verdict: BON                      │
│                                     │
│   ┌─────────┬─────────┬─────────┐   │
│   │ Renta.  │ Cashflow│  HCSF   │   │
│   │  7.2%   │ +180€/m │  28%    │   │
│   └─────────┴─────────┴─────────┘   │
│                                     │
├─────────────────────────────────────┤
│  Page 1/4    Simulation non contrac.│
└─────────────────────────────────────┘
```

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création initiale | John (PM) |
| 2026-02-04 | 1.1 | Implémentation complète | Dev Agent |

---

## Dev Agent Record

### Completed: 2026-02-04

**Implementation Notes:**

1. Created all PDF components as specified:
   - `ScoreGauge.tsx` - Visual circular gauge with derived verdict from score
   - `KeyMetrics.tsx` - Grid display of key financial indicators
   - `PropertyDetails.tsx` - Two-column layout for property/financing details
   - `FinancialTable.tsx` - Financial summary with projections (when available)
   - `HcsfAnalysis.tsx` - HCSF compliance status with per-associate breakdown

2. Created main template `RapportSimulation.tsx`:
   - 4-page layout following Nordic Minimal design
   - Page 1: Synthèse with score gauge and key metrics
   - Page 2: Property and financing details
   - Page 3: Financial analysis and legal structure
   - Page 4: HCSF compliance with disclaimer

3. Updated `index.ts` with all exports

4. Test validation:
   - Created `generate-rapport-test.tsx` with mock data
   - Generated test PDF successfully: 12.42 KB

**Files Created/Modified:**
- `src/lib/pdf/components/ScoreGauge.tsx` [NEW]
- `src/lib/pdf/components/KeyMetrics.tsx` [NEW]
- `src/lib/pdf/components/PropertyDetails.tsx` [NEW]
- `src/lib/pdf/components/FinancialTable.tsx` [NEW]
- `src/lib/pdf/components/HcsfAnalysis.tsx` [NEW]
- `src/lib/pdf/templates/RapportSimulation.tsx` [NEW]
- `src/lib/pdf/index.ts` [MODIFIED]
- `src/lib/pdf/__tests__/generate-rapport-test.tsx` [NEW]

