# Story TECH-006 : Synthèse et Scoring ✅ Done

> **Epic** : Epic 1 - Infrastructure Backend
> **Sprint** : 0.3 - Intégration
> **Points** : 3
> **Priorité** : P1 (Critique)
> **Statut** : ✅ Done
> **Dépendances** : TECH-003, TECH-004, TECH-005

---

## 1. User Story

**En tant qu'** utilisateur
**Je veux** obtenir un score global et des recommandations personnalisées
**Afin de** prendre une décision éclairée sur mon investissement

---

## 2. Contexte

### 2.1 Objectif

Implémenter le module de synthèse qui agrège tous les résultats de calcul pour produire :
- Un score global sur 100 points
- Une évaluation qualitative (Excellent/Bon/Moyen/Faible)
- Des points d'attention
- Des recommandations personnalisées

### 2.2 Fichier cible

```
src/server/calculations/synthese.ts
```

### 2.3 Critères de scoring

| Critère | Points max | Description |
|---------|------------|-------------|
| Autofinancement | 30 | Cashflow positif |
| Rentabilité | 30 | Rentabilité nette ≥ 7% |
| Conformité HCSF | 25 | Taux endettement < 35% |
| Bonus rentabilité | 15 | Rentabilité nette ≥ 10% |
| **Total** | **100** | |

### 2.4 Échelle d'évaluation

| Score | Évaluation | Couleur |
|-------|------------|---------|
| 80-100 | Excellent | Vert |
| 60-79 | Bon | Bleu |
| 40-59 | Moyen | Orange |
| 0-39 | Faible | Rouge |

---

## 3. Critères d'Acceptation

### 3.1 Fonctions principales

- [ ] `calculerScoreAutofinancement(cashflow)` - Score cashflow
- [ ] `calculerScoreRentabilite(rentabiliteNette)` - Score rentabilité
- [ ] `calculerScoreHcsf(tauxEndettement, conforme)` - Score HCSF
- [ ] `calculerScoreGlobal(criteres)` - Agrégation
- [ ] `genererEvaluation(score)` - Qualificatif
- [ ] `genererPointsAttention(data)` - Liste des alertes
- [ ] `genererRecommandations(data)` - Conseils personnalisés
- [ ] `genererSynthese(data)` - Orchestration

### 3.2 Scoring

- [ ] Score autofinancement : 0-30 points selon cashflow
- [ ] Score rentabilité : 0-30 points selon rentabilité nette
- [ ] Score HCSF : 0-25 points selon conformité
- [ ] Bonus rentabilité : 0-15 points si ≥ 10%
- [ ] Score global sur 100

### 3.3 Recommandations

- [ ] Recommandations si cashflow négatif
- [ ] Recommandations si rentabilité < 7%
- [ ] Recommandations si HCSF non conforme
- [ ] Recommandations d'optimisation fiscale

### 3.4 Qualité

- [ ] TypeScript compile sans erreur
- [ ] JSDoc complet
- [ ] Recommandations contextuelles et pertinentes

---

## 4. Spécifications Techniques

### 4.1 Fichier `src/server/calculations/synthese.ts`

```typescript
/**
 * Module de synthèse et scoring de l'investissement
 * Agrège les résultats pour produire un score global et des recommandations
 */

import type {
  CalculationInput,
  SyntheseResultats,
  PointAttention,
  Recommandation,
} from './types';
import type { RentabiliteComplete } from './rentabilite';
import type { FiscaliteDetail } from './fiscalite';
import type { HcsfDetail } from './hcsf';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Détail du scoring
 */
export interface ScoreDetail {
  /** Score autofinancement (0-30) */
  autofinancement: number;
  /** Score rentabilité (0-30) */
  rentabilite: number;
  /** Score conformité HCSF (0-25) */
  hcsf: number;
  /** Bonus rentabilité ≥10% (0-15) */
  bonus_rentabilite: number;
  /** Score global (0-100) */
  total: number;
}

/**
 * Évaluation qualitative
 */
export type Evaluation = 'Excellent' | 'Bon' | 'Moyen' | 'Faible';

/**
 * Synthèse complète
 */
export interface SyntheseComplete extends SyntheseResultats {
  /** Détail du scoring */
  score_detail: ScoreDetail;
  /** Points d'attention détaillés */
  points_attention_detail: PointAttention[];
  /** Recommandations détaillées */
  recommandations_detail: Recommandation[];
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SCORING = {
  // Autofinancement (30 points max)
  AUTOFINANCEMENT_MAX: 30,
  CASHFLOW_EXCELLENT: 200, // €/mois pour score max
  CASHFLOW_SEUIL_POSITIF: 0,

  // Rentabilité (30 points max)
  RENTABILITE_MAX: 30,
  RENTABILITE_CIBLE: 7, // %
  RENTABILITE_EXCELLENT: 10, // %

  // HCSF (25 points max)
  HCSF_MAX: 25,
  HCSF_SEUIL: 35, // %
  HCSF_CONFORTABLE: 30, // %

  // Bonus (15 points max)
  BONUS_MAX: 15,
  BONUS_SEUIL: 10, // % rentabilité pour bonus
} as const;

const EVALUATIONS: Record<string, { min: number; max: number; label: Evaluation; color: string }> = {
  excellent: { min: 80, max: 100, label: 'Excellent', color: 'green' },
  bon: { min: 60, max: 79, label: 'Bon', color: 'blue' },
  moyen: { min: 40, max: 59, label: 'Moyen', color: 'orange' },
  faible: { min: 0, max: 39, label: 'Faible', color: 'red' },
};

// ============================================================================
// CALCULS DE SCORE
// ============================================================================

/**
 * Calcule le score d'autofinancement
 *
 * @param cashflowMensuel - Cashflow mensuel en €
 * @returns Score de 0 à 30
 *
 * @example
 * calculerScoreAutofinancement(200) // => 30 (max)
 * calculerScoreAutofinancement(0) // => 15 (seuil)
 * calculerScoreAutofinancement(-200) // => 0
 */
export function calculerScoreAutofinancement(cashflowMensuel: number): number {
  if (cashflowMensuel <= -SCORING.CASHFLOW_EXCELLENT) {
    return 0;
  }

  if (cashflowMensuel >= SCORING.CASHFLOW_EXCELLENT) {
    return SCORING.AUTOFINANCEMENT_MAX;
  }

  // Score linéaire entre -200€ et +200€
  const ratio = (cashflowMensuel + SCORING.CASHFLOW_EXCELLENT) / (2 * SCORING.CASHFLOW_EXCELLENT);
  return Math.round(ratio * SCORING.AUTOFINANCEMENT_MAX);
}

/**
 * Calcule le score de rentabilité
 *
 * @param rentabiliteNette - Rentabilité nette en %
 * @returns Score de 0 à 30
 *
 * @example
 * calculerScoreRentabilite(10) // => 30 (max)
 * calculerScoreRentabilite(7) // => 21
 * calculerScoreRentabilite(3) // => 9
 */
export function calculerScoreRentabilite(rentabiliteNette: number): number {
  if (rentabiliteNette <= 0) {
    return 0;
  }

  if (rentabiliteNette >= SCORING.RENTABILITE_EXCELLENT) {
    return SCORING.RENTABILITE_MAX;
  }

  // Score linéaire jusqu'à 10%
  const ratio = rentabiliteNette / SCORING.RENTABILITE_EXCELLENT;
  return Math.round(ratio * SCORING.RENTABILITE_MAX);
}

/**
 * Calcule le score HCSF
 *
 * @param tauxEndettement - Taux d'endettement en %
 * @param conforme - Conformité HCSF
 * @returns Score de 0 à 25
 *
 * @example
 * calculerScoreHcsf(25, true) // => 25 (max, très confortable)
 * calculerScoreHcsf(33, true) // => 20 (conforme mais serré)
 * calculerScoreHcsf(40, false) // => 0 (non conforme)
 */
export function calculerScoreHcsf(tauxEndettement: number, conforme: boolean): number {
  if (!conforme) {
    return 0;
  }

  if (tauxEndettement <= SCORING.HCSF_CONFORTABLE) {
    return SCORING.HCSF_MAX;
  }

  // Score dégressif entre 30% et 35%
  const depassement = tauxEndettement - SCORING.HCSF_CONFORTABLE;
  const penalite = (depassement / 5) * 5; // -5 points max
  return Math.max(SCORING.HCSF_MAX - 5 - Math.round(penalite), SCORING.HCSF_MAX - 10);
}

/**
 * Calcule le bonus rentabilité
 *
 * @param rentabiliteNette - Rentabilité nette en %
 * @returns Score de 0 à 15
 */
export function calculerBonusRentabilite(rentabiliteNette: number): number {
  if (rentabiliteNette < SCORING.BONUS_SEUIL) {
    return 0;
  }

  // Bonus progressif au-delà de 10%
  const surplus = rentabiliteNette - SCORING.BONUS_SEUIL;
  const bonus = Math.min(surplus * 3, SCORING.BONUS_MAX); // +3 points par % au-delà de 10%
  return Math.round(bonus);
}

/**
 * Calcule le score global
 *
 * @param cashflowMensuel - Cashflow mensuel
 * @param rentabiliteNette - Rentabilité nette en %
 * @param tauxEndettement - Taux d'endettement en %
 * @param hcsfConforme - Conformité HCSF
 * @returns Détail du scoring
 */
export function calculerScoreGlobal(
  cashflowMensuel: number,
  rentabiliteNette: number,
  tauxEndettement: number,
  hcsfConforme: boolean
): ScoreDetail {
  const autofinancement = calculerScoreAutofinancement(cashflowMensuel);
  const rentabilite = calculerScoreRentabilite(rentabiliteNette);
  const hcsf = calculerScoreHcsf(tauxEndettement, hcsfConforme);
  const bonus_rentabilite = calculerBonusRentabilite(rentabiliteNette);

  return {
    autofinancement,
    rentabilite,
    hcsf,
    bonus_rentabilite,
    total: autofinancement + rentabilite + hcsf + bonus_rentabilite,
  };
}

// ============================================================================
// ÉVALUATION
// ============================================================================

/**
 * Génère l'évaluation qualitative
 *
 * @param score - Score global (0-100)
 * @returns Évaluation et couleur
 */
export function genererEvaluation(score: number): { evaluation: Evaluation; color: string } {
  if (score >= EVALUATIONS.excellent.min) {
    return { evaluation: 'Excellent', color: 'green' };
  }
  if (score >= EVALUATIONS.bon.min) {
    return { evaluation: 'Bon', color: 'blue' };
  }
  if (score >= EVALUATIONS.moyen.min) {
    return { evaluation: 'Moyen', color: 'orange' };
  }
  return { evaluation: 'Faible', color: 'red' };
}

// ============================================================================
// POINTS D'ATTENTION
// ============================================================================

/**
 * Génère les points d'attention
 */
export function genererPointsAttention(
  rentabilite: RentabiliteComplete,
  fiscalite: FiscaliteDetail,
  hcsf: HcsfDetail
): PointAttention[] {
  const points: PointAttention[] = [];

  // Cashflow négatif
  if (rentabilite.cashflow.cashflow_mensuel < 0) {
    points.push({
      type: 'warning',
      categorie: 'cashflow',
      message: `Cashflow négatif de ${Math.abs(rentabilite.cashflow.cashflow_mensuel)}€/mois`,
      conseil: 'Vous devrez compléter chaque mois pour couvrir les charges',
    });
  }

  // Rentabilité faible
  if (rentabilite.rentabilite.rentabilite_nette < 5) {
    points.push({
      type: 'warning',
      categorie: 'rentabilite',
      message: `Rentabilité nette faible (${rentabilite.rentabilite.rentabilite_nette.toFixed(2)}%)`,
      conseil: 'Vérifiez le prix d\'achat ou négociez les frais',
    });
  }

  // HCSF non conforme
  if (!hcsf.conforme) {
    points.push({
      type: 'error',
      categorie: 'financement',
      message: `Taux d'endettement (${hcsf.taux_endettement}%) supérieur au seuil HCSF (35%)`,
      conseil: 'Le financement risque d\'être refusé. Augmentez l\'apport ou réduisez le montant emprunté',
    });
  } else if (hcsf.taux_endettement > 33) {
    points.push({
      type: 'info',
      categorie: 'financement',
      message: `Taux d'endettement proche du seuil (${hcsf.taux_endettement}%)`,
      conseil: 'Marge de manœuvre limitée pour de futurs emprunts',
    });
  }

  // Alertes fiscales
  fiscalite.alertes.forEach((alerte) => {
    points.push({
      type: 'info',
      categorie: 'fiscalite',
      message: alerte,
    });
  });

  // Alertes HCSF
  hcsf.alertes.forEach((alerte) => {
    if (!points.some((p) => p.message === alerte)) {
      points.push({
        type: 'warning',
        categorie: 'financement',
        message: alerte,
      });
    }
  });

  return points;
}

// ============================================================================
// RECOMMANDATIONS
// ============================================================================

/**
 * Génère les recommandations personnalisées
 */
export function genererRecommandations(
  data: CalculationInput,
  rentabilite: RentabiliteComplete,
  fiscalite: FiscaliteDetail,
  hcsf: HcsfDetail,
  score: ScoreDetail
): Recommandation[] {
  const recommandations: Recommandation[] = [];

  // Recommandations cashflow
  if (rentabilite.cashflow.cashflow_mensuel < 0) {
    recommandations.push({
      priorite: 'haute',
      categorie: 'financement',
      titre: 'Améliorer le cashflow',
      description: 'Votre investissement nécessite un effort d\'épargne mensuel',
      actions: [
        'Négocier un taux de crédit plus bas',
        'Allonger la durée du prêt',
        'Augmenter l\'apport personnel',
        'Revoir le prix d\'achat à la baisse',
      ],
    });
  } else if (rentabilite.cashflow.cashflow_mensuel > 0) {
    recommandations.push({
      priorite: 'info',
      categorie: 'cashflow',
      titre: 'Cashflow positif',
      description: `Votre investissement génère ${rentabilite.cashflow.cashflow_mensuel.toFixed(0)}€/mois`,
      actions: [
        'Constituer une épargne de précaution (3-6 mois de charges)',
        'Envisager un réinvestissement futur',
      ],
    });
  }

  // Recommandations rentabilité
  if (rentabilite.rentabilite.rentabilite_nette < 7) {
    recommandations.push({
      priorite: 'moyenne',
      categorie: 'rentabilite',
      titre: 'Optimiser la rentabilité',
      description: `Rentabilité nette de ${rentabilite.rentabilite.rentabilite_nette.toFixed(2)}% (cible: 7%)`,
      actions: [
        'Négocier le prix d\'achat',
        'Vérifier le potentiel locatif du marché',
        'Optimiser les charges (assurances, copropriété)',
        'Envisager des travaux pour augmenter le loyer',
      ],
    });
  }

  // Recommandations fiscales
  if (data.structure.type_detention === 'nom_propre') {
    const revenusBruts = rentabilite.indicateurs.revenus_locatifs_annuels;

    if (revenusBruts > 15000 && data.structure.regime_fiscal === 'micro_foncier') {
      recommandations.push({
        priorite: 'haute',
        categorie: 'fiscalite',
        titre: 'Régime fiscal à revoir',
        description: 'Le micro-foncier n\'est pas possible au-delà de 15 000€/an',
        actions: [
          'Passer au régime réel (déduction des charges)',
          'Étudier le passage en LMNP si possible',
        ],
      });
    }

    if (data.structure.tmi && data.structure.tmi >= 0.30) {
      recommandations.push({
        priorite: 'moyenne',
        categorie: 'fiscalite',
        titre: 'Optimisation fiscale possible',
        description: `TMI de ${(data.structure.tmi * 100).toFixed(0)}% : l'imposition sera significative`,
        actions: [
          'Étudier le régime LMNP pour l\'amortissement',
          'Simuler une SCI à l\'IS pour comparer',
          'Consulter un expert-comptable',
        ],
      });
    }
  }

  // Recommandations HCSF
  if (!hcsf.conforme) {
    recommandations.push({
      priorite: 'haute',
      categorie: 'financement',
      titre: 'Conformité HCSF requise',
      description: 'Le dossier risque d\'être refusé par les banques',
      actions: [
        'Augmenter l\'apport (réduire le montant emprunté)',
        'Trouver un co-emprunteur',
        'Reporter le projet et augmenter les revenus',
        'Cibler un bien moins cher',
      ],
    });
  }

  // Recommandations générales selon le score
  if (score.total >= 80) {
    recommandations.push({
      priorite: 'info',
      categorie: 'general',
      titre: 'Excellent investissement',
      description: 'Ce projet présente de très bons indicateurs',
      actions: [
        'Vérifier le bien sur place avant de vous engager',
        'Faire réaliser les diagnostics obligatoires',
        'Anticiper les travaux éventuels',
      ],
    });
  } else if (score.total < 40) {
    recommandations.push({
      priorite: 'haute',
      categorie: 'general',
      titre: 'Projet à reconsidérer',
      description: 'Les indicateurs sont insuffisants pour un investissement serein',
      actions: [
        'Revoir les paramètres du projet',
        'Chercher un autre bien avec un meilleur potentiel',
        'Consulter un professionnel de l\'investissement',
      ],
    });
  }

  return recommandations;
}

// ============================================================================
// ORCHESTRATEUR
// ============================================================================

/**
 * Génère la synthèse complète de l'investissement
 *
 * @param data - Données d'entrée validées
 * @param rentabilite - Résultats rentabilité
 * @param fiscalite - Résultats fiscalité
 * @param hcsf - Résultats HCSF
 * @returns Synthèse complète avec score et recommandations
 */
export function genererSynthese(
  data: CalculationInput,
  rentabilite: RentabiliteComplete,
  fiscalite: FiscaliteDetail,
  hcsf: HcsfDetail
): SyntheseComplete {
  // Calcul du score
  const scoreDetail = calculerScoreGlobal(
    rentabilite.cashflow.cashflow_mensuel,
    rentabilite.rentabilite.rentabilite_nette,
    hcsf.taux_endettement,
    hcsf.conforme
  );

  // Évaluation qualitative
  const { evaluation, color } = genererEvaluation(scoreDetail.total);

  // Points d'attention
  const pointsAttention = genererPointsAttention(rentabilite, fiscalite, hcsf);

  // Recommandations
  const recommandations = genererRecommandations(
    data,
    rentabilite,
    fiscalite,
    hcsf,
    scoreDetail
  );

  return {
    score_global: scoreDetail.total,
    evaluation,
    couleur: color,
    score_detail: scoreDetail,
    points_attention: pointsAttention.map((p) => p.message),
    points_attention_detail: pointsAttention,
    recommandations: recommandations.map((r) => r.titre),
    recommandations_detail: recommandations,
  };
}
```

---

## 5. Types à ajouter dans `types.ts`

```typescript
/**
 * Point d'attention
 */
export interface PointAttention {
  type: 'error' | 'warning' | 'info';
  categorie: 'cashflow' | 'rentabilite' | 'financement' | 'fiscalite' | 'general';
  message: string;
  conseil?: string;
}

/**
 * Recommandation
 */
export interface Recommandation {
  priorite: 'haute' | 'moyenne' | 'info';
  categorie: 'cashflow' | 'rentabilite' | 'financement' | 'fiscalite' | 'general';
  titre: string;
  description: string;
  actions: string[];
}
```

---

## 6. Cas de Test

### 6.1 Test Scoring Autofinancement

| Cashflow | Score attendu |
|----------|---------------|
| +300€ | 30 (max) |
| +200€ | 30 (max) |
| +100€ | 22-23 |
| 0€ | 15 |
| -100€ | 7-8 |
| -200€ | 0 |

### 6.2 Test Scoring Rentabilité

| Rentabilité nette | Score attendu |
|-------------------|---------------|
| 12% | 30 + 6 bonus = 36 |
| 10% | 30 + 0 bonus = 30 |
| 7% | 21 |
| 5% | 15 |
| 3% | 9 |

### 6.3 Test Scoring HCSF

| Taux endettement | Conforme | Score attendu |
|------------------|----------|---------------|
| 25% | Oui | 25 (max) |
| 30% | Oui | 25 |
| 33% | Oui | 20 |
| 35% | Oui | 15 |
| 40% | Non | 0 |

### 6.4 Test Évaluation

| Score | Évaluation | Couleur |
|-------|------------|---------|
| 85 | Excellent | green |
| 70 | Bon | blue |
| 50 | Moyen | orange |
| 30 | Faible | red |

### 6.5 Cas complet

**Entrée** :
- Cashflow : +150€/mois
- Rentabilité nette : 8%
- Taux endettement : 28%
- HCSF conforme : Oui

**Score attendu** :
- Autofinancement : 26
- Rentabilité : 24
- HCSF : 25
- Bonus : 0
- **Total : 75** → Évaluation : **Bon**

---

## 7. Intégration avec l'Orchestrateur

### 7.1 Mise à jour de `index.ts`

```typescript
import { calculerRentabilite } from './rentabilite';
import { calculerFiscalite } from './fiscalite';
import { analyserHcsf } from './hcsf';
import { genererSynthese } from './synthese';

export function performCalculations(input: unknown): CalculationResult | CalculationError {
  // ... validation ...

  // Étape 2 - Calculs de rentabilité
  const rentabilite = calculerRentabilite(data);

  // Étape 3 - Calculs fiscaux
  const fiscalite = calculerFiscalite(data, rentabilite);

  // Étape 4 - Analyse HCSF
  const hcsf = analyserHcsf(data, rentabilite.financement, data.exploitation.loyer_mensuel);

  // Étape 5 - Synthèse et scoring
  const synthese = genererSynthese(data, rentabilite, fiscalite, hcsf);

  // Collecter toutes les alertes
  const alertes = [
    ...synthese.points_attention,
    ...fiscalite.alertes,
    ...hcsf.alertes,
  ];

  return {
    success: true,
    resultats: {
      rentabilite: rentabilite.rentabilite,
      cashflow: rentabilite.cashflow,
      financement: rentabilite.financement,
      charges: rentabilite.charges,
      fiscalite,
      hcsf,
      synthese,
    },
    alertes: [...new Set(alertes)], // Dédupliquer
    timestamp: new Date().toISOString(),
  };
}
```

---

## 8. Checklist de Développement

### 8.1 Préparation

- [ ] TECH-003, TECH-004, TECH-005 complétées
- [ ] Types RentabiliteComplete, FiscaliteDetail, HcsfDetail disponibles
- [ ] Comprendre les critères de scoring

### 8.2 Implémentation

- [ ] Créer `synthese.ts`
- [ ] Implémenter `calculerScoreAutofinancement()`
- [ ] Implémenter `calculerScoreRentabilite()`
- [ ] Implémenter `calculerScoreHcsf()`
- [ ] Implémenter `calculerBonusRentabilite()`
- [ ] Implémenter `calculerScoreGlobal()`
- [ ] Implémenter `genererEvaluation()`
- [ ] Implémenter `genererPointsAttention()`
- [ ] Implémenter `genererRecommandations()`
- [ ] Implémenter `genererSynthese()`
- [ ] Ajouter types dans `types.ts`
- [ ] Mettre à jour `index.ts`

### 8.3 Validation

- [ ] `npm run type-check` passe
- [ ] `npm run lint` passe
- [ ] Tests avec cas de référence
- [ ] Recommandations pertinentes et contextuelles
- [ ] Code review demandée

---

## 9. Definition of Done

- [ ] Fichier `synthese.ts` créé et complet
- [ ] Score global calculé correctement (0-100)
- [ ] Évaluation qualitative générée
- [ ] Points d'attention pertinents
- [ ] Recommandations contextuelles et actionnables
- [ ] Types ajoutés dans `types.ts`
- [ ] `index.ts` mis à jour et fonctionnel
- [ ] TypeScript compile sans erreur
- [ ] JSDoc complet
- [ ] Code review approuvée

---

## 10. Références

| Document | Lien |
|----------|------|
| Story précédente | [TECH-005 - HCSF](./story-tech-005-analyse-hcsf.md) |
| Story suivante | [TECH-007 - Tests régression](./story-tech-007-tests-regression.md) |
| Architecture | [docs/architecture.md](../architecture.md) - Section 6.1.6 |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
