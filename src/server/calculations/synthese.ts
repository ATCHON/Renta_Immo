/**
 * Module de synthèse et scoring
 * Génère un score global et des recommandations d'investissement
 */

import type {
  RentabiliteCalculations,
  HCSFCalculations,
  SyntheseCalculations,
} from './types';
import { SEUILS } from './types';

/**
 * Évalue un critère et retourne son statut
 */
function evaluerCritere(
  condition: boolean,
  valeur: number
): { status: 'OK' | 'KO'; valeur: number } {
  return {
    status: condition ? 'OK' : 'KO',
    valeur: round(valeur, 2),
  };
}

/**
 * Génère la synthèse et le scoring de l'investissement
 */
export function genererSynthese(
  rentabilite: RentabiliteCalculations,
  hcsf: HCSFCalculations
): SyntheseCalculations {
  const points_attention: string[] = [];
  let score = 0;

  // Critère 1 : Autofinancement (cash-flow >= 0)
  const critere_autofinancement = evaluerCritere(
    rentabilite.cashflow_mensuel >= 0,
    rentabilite.cashflow_mensuel
  );
  if (critere_autofinancement.status === 'OK') {
    score += 1;
  } else {
    points_attention.push(
      `Cash-flow négatif : ${round(rentabilite.cashflow_mensuel)} €/mois`
    );
  }

  // Critère 2 : Rentabilité nette >= 7%
  const critere_rentabilite = evaluerCritere(
    rentabilite.rentabilite_nette >= SEUILS.RENTABILITE_BRUTE_MIN,
    rentabilite.rentabilite_nette
  );
  if (critere_rentabilite.status === 'OK') {
    score += 1;
  } else {
    points_attention.push(
      `Rentabilité nette faible : ${round(rentabilite.rentabilite_nette, 2)}% (< ${SEUILS.RENTABILITE_BRUTE_MIN}%)`
    );
  }

  // Critère 3 : Conformité HCSF
  const critere_hcsf = evaluerCritere(hcsf.conforme, hcsf.taux_endettement);
  if (critere_hcsf.status === 'OK') {
    score += 1;
  } else {
    points_attention.push(
      `Non conforme HCSF : taux d'endettement ${hcsf.taux_endettement}% (> ${SEUILS.TAUX_ENDETTEMENT_MAX}%)`
    );
  }

  // Bonus : Rentabilité > 10%
  if (rentabilite.rentabilite_nette >= SEUILS.RENTABILITE_BRUTE_BONNE) {
    score += 1;
  }

  // Ajout des alertes HCSF aux points d'attention
  points_attention.push(...hcsf.alertes);

  // Évaluation globale
  const { evaluation, recommandation } = getEvaluationEtRecommandation(score);

  // Score global sur 100
  const score_global = calculateScoreGlobal(
    rentabilite.cashflow_mensuel,
    rentabilite.rentabilite_nette,
    hcsf.conforme
  );

  return {
    score_global,
    evaluation,
    recommandation,
    points_attention,
    criteres: {
      autofinancement: critere_autofinancement,
      rentabilite: critere_rentabilite,
      hcsf: critere_hcsf,
    },
  };
}

/**
 * Calcule le score global sur 100
 */
function calculateScoreGlobal(
  cashflowMensuel: number,
  rentabiliteNette: number,
  conformeHCSF: boolean
): number {
  let score = 50; // Score de base

  // Cash-flow : -15 à +15 points
  if (cashflowMensuel >= 0) {
    // Bonus croissant jusqu'à 500€/mois
    const bonus = Math.min(15, (cashflowMensuel / 500) * 15);
    score += bonus;
  } else {
    // Malus croissant
    const malus = Math.min(15, (Math.abs(cashflowMensuel) / 300) * 15);
    score -= malus;
  }

  // Rentabilité nette : -10 à +20 points
  if (rentabiliteNette >= 10) {
    score += 20;
  } else if (rentabiliteNette >= 7) {
    score += 10;
  } else if (rentabiliteNette >= 5) {
    score += 0;
  } else {
    score -= 10;
  }

  // Conformité HCSF : +/-15 points
  score += conformeHCSF ? 15 : -15;

  // Borner entre 0 et 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Retourne l'évaluation et la recommandation selon le score
 */
function getEvaluationEtRecommandation(scoreInterne: number): {
  evaluation: 'Excellent' | 'Bon' | 'Moyen' | 'Faible';
  recommandation: string;
} {
  if (scoreInterne >= 4) {
    return {
      evaluation: 'Excellent',
      recommandation:
        'Investissement très viable. Tous les indicateurs sont au vert : autofinancement positif, bonne rentabilité et conformité HCSF.',
    };
  }

  if (scoreInterne === 3) {
    return {
      evaluation: 'Bon',
      recommandation:
        'Investissement viable. La majorité des critères sont respectés. Vérifiez les points d\'attention avant de vous engager.',
    };
  }

  if (scoreInterne === 2) {
    return {
      evaluation: 'Moyen',
      recommandation:
        'Investissement à optimiser. Plusieurs critères ne sont pas satisfaits. Envisagez de négocier le prix ou d\'augmenter le loyer.',
    };
  }

  return {
    evaluation: 'Faible',
    recommandation:
      'Investissement risqué. La majorité des critères ne sont pas respectés. Reconsidérez ce projet ou cherchez des optimisations significatives.',
  };
}

/**
 * Arrondit un nombre à un nombre de décimales
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
