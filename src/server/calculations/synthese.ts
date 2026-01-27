/**
 * Module de synthèse et scoring
 * Génère un score global et des recommandations d'investissement
 *
 * Système de scoring (100 points max) :
 * - Autofinancement : 0-30 points (cashflow mensuel)
 * - Rentabilité : 0-30 points (rentabilité nette)
 * - Conformité HCSF : 0-25 points (taux d'endettement)
 * - Bonus rentabilité : 0-15 points (si rentabilité >= 10%)
 */

import type {
  StructureData,
  RentabiliteCalculations,
  HCSFCalculations,
  FiscaliteCalculations,
  SyntheseCalculations,
  ScoreDetail,
  PointAttention,
  Recommandation,
} from './types';
import { SEUILS } from './types';

/**
 * Constantes de scoring
 */
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

/**
 * Évaluations qualitatives
 */
const EVALUATIONS = {
  excellent: { min: 80, max: 100, label: 'Excellent' as const, color: 'green' },
  bon: { min: 60, max: 79, label: 'Bon' as const, color: 'blue' },
  moyen: { min: 40, max: 59, label: 'Moyen' as const, color: 'orange' },
  faible: { min: 0, max: 39, label: 'Faible' as const, color: 'red' },
};

/**
 * Calcule le score d'autofinancement (0-30 points)
 * Score linéaire basé sur le cashflow mensuel
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
 * Calcule le score de rentabilité (0-30 points)
 * Score progressif jusqu'à 10% de rentabilité nette
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
 * Calcule le score HCSF (0-25 points)
 * Score basé sur la conformité et le confort du taux
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
  const penalite = (depassement / 5) * 5;
  return Math.max(SCORING.HCSF_MAX - 5 - Math.round(penalite), SCORING.HCSF_MAX - 10);
}

/**
 * Calcule le bonus rentabilité (0-15 points)
 * Bonus accordé si rentabilité >= 10%
 */
export function calculerBonusRentabilite(rentabiliteNette: number): number {
  if (rentabiliteNette < SCORING.BONUS_SEUIL) {
    return 0;
  }

  // Bonus progressif au-delà de 10% (+3 points par % au-delà)
  const surplus = rentabiliteNette - SCORING.BONUS_SEUIL;
  const bonus = Math.min(surplus * 3, SCORING.BONUS_MAX);
  return Math.round(bonus);
}

/**
 * Calcule le score global détaillé
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

/**
 * Génère l'évaluation qualitative
 */
export function genererEvaluation(score: number): {
  evaluation: 'Excellent' | 'Bon' | 'Moyen' | 'Faible';
  couleur: string;
} {
  if (score >= EVALUATIONS.excellent.min) {
    return { evaluation: 'Excellent', couleur: 'green' };
  }
  if (score >= EVALUATIONS.bon.min) {
    return { evaluation: 'Bon', couleur: 'blue' };
  }
  if (score >= EVALUATIONS.moyen.min) {
    return { evaluation: 'Moyen', couleur: 'orange' };
  }
  return { evaluation: 'Faible', couleur: 'red' };
}

/**
 * Génère les points d'attention détaillés
 */
export function genererPointsAttention(
  rentabilite: RentabiliteCalculations,
  hcsf: HCSFCalculations,
  fiscalite: FiscaliteCalculations
): PointAttention[] {
  const points: PointAttention[] = [];

  // Cashflow négatif
  if (rentabilite.cashflow_mensuel < 0) {
    points.push({
      type: 'warning',
      categorie: 'cashflow',
      message: `Cashflow négatif de ${Math.abs(round(rentabilite.cashflow_mensuel))}€/mois`,
      conseil: 'Vous devrez compléter chaque mois pour couvrir les charges',
    });
  }

  // Cashflow très négatif
  if (rentabilite.cashflow_mensuel < SEUILS.CASHFLOW_CRITIQUE) {
    points.push({
      type: 'error',
      categorie: 'cashflow',
      message: `Cashflow très négatif : ${round(rentabilite.cashflow_mensuel)}€/mois`,
      conseil: 'Effort d\'épargne trop important, revoyez les paramètres du projet',
    });
  }

  // Rentabilité faible
  if (rentabilite.rentabilite_nette < 5) {
    points.push({
      type: 'warning',
      categorie: 'rentabilite',
      message: `Rentabilité nette faible : ${round(rentabilite.rentabilite_nette, 2)}%`,
      conseil: 'Vérifiez le prix d\'achat ou négociez les frais',
    });
  }

  // HCSF non conforme
  if (!hcsf.conforme) {
    points.push({
      type: 'error',
      categorie: 'financement',
      message: `Taux d'endettement (${hcsf.taux_endettement}%) > seuil HCSF (35%)`,
      conseil: 'Le financement risque d\'être refusé. Augmentez l\'apport ou réduisez le montant',
    });
  } else if (hcsf.taux_endettement > SEUILS.TAUX_ENDETTEMENT_ALERTE) {
    points.push({
      type: 'info',
      categorie: 'financement',
      message: `Taux d'endettement proche du seuil : ${hcsf.taux_endettement}%`,
      conseil: 'Marge de manœuvre limitée pour de futurs emprunts',
    });
  }

  // Alertes HCSF supplémentaires
  hcsf.alertes.forEach((alerte) => {
    if (!points.some((p) => p.message === alerte)) {
      points.push({
        type: 'warning',
        categorie: 'financement',
        message: alerte,
      });
    }
  });

  // Alertes fiscales (si disponibles via l'interface étendue)
  const fiscaliteDetail = fiscalite as FiscaliteCalculations & { alertes?: string[] };
  if (fiscaliteDetail.alertes) {
    fiscaliteDetail.alertes.forEach((alerte) => {
      points.push({
        type: 'info',
        categorie: 'fiscalite',
        message: alerte,
      });
    });
  }

  return points;
}

/**
 * Génère les recommandations personnalisées
 */
export function genererRecommandations(
  structure: StructureData,
  rentabilite: RentabiliteCalculations,
  hcsf: HCSFCalculations,
  score: ScoreDetail
): Recommandation[] {
  const recommandations: Recommandation[] = [];

  // Recommandations cashflow négatif
  if (rentabilite.cashflow_mensuel < 0) {
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
  } else if (rentabilite.cashflow_mensuel > 0) {
    recommandations.push({
      priorite: 'info',
      categorie: 'cashflow',
      titre: 'Cashflow positif',
      description: `Votre investissement génère ${round(rentabilite.cashflow_mensuel)}€/mois`,
      actions: [
        'Constituer une épargne de précaution (3-6 mois de charges)',
        'Envisager un réinvestissement futur',
      ],
    });
  }

  // Recommandations rentabilité faible
  if (rentabilite.rentabilite_nette < SEUILS.RENTABILITE_BRUTE_MIN) {
    recommandations.push({
      priorite: 'moyenne',
      categorie: 'rentabilite',
      titre: 'Optimiser la rentabilité',
      description: `Rentabilité nette de ${round(rentabilite.rentabilite_nette, 2)}% (cible : 7%)`,
      actions: [
        'Négocier le prix d\'achat',
        'Vérifier le potentiel locatif du marché',
        'Optimiser les charges (assurances, copropriété)',
        'Envisager des travaux pour augmenter le loyer',
      ],
    });
  }

  // Recommandations fiscales pour nom propre
  if (structure.type === 'nom_propre') {
    const revenusBruts = rentabilite.loyer_annuel;

    if (revenusBruts > 15000 && structure.regime_fiscal === 'micro_foncier') {
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

    if (structure.tmi && structure.tmi >= 30) {
      recommandations.push({
        priorite: 'moyenne',
        categorie: 'fiscalite',
        titre: 'Optimisation fiscale possible',
        description: `TMI de ${structure.tmi}% : l'imposition sera significative`,
        actions: [
          'Étudier le régime LMNP pour l\'amortissement',
          'Simuler une SCI à l\'IS pour comparer',
          'Consulter un expert-comptable',
        ],
      });
    }
  }

  // Recommandations HCSF non conforme
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
 * Génère la recommandation textuelle principale
 */
function getRecommandationPrincipale(scoreInterne: number): string {
  if (scoreInterne >= 4) {
    return 'Investissement très viable. Tous les indicateurs sont au vert : autofinancement positif, bonne rentabilité et conformité HCSF.';
  }
  if (scoreInterne === 3) {
    return 'Investissement viable. La majorité des critères sont respectés. Vérifiez les points d\'attention avant de vous engager.';
  }
  if (scoreInterne === 2) {
    return 'Investissement à optimiser. Plusieurs critères ne sont pas satisfaits. Envisagez de négocier le prix ou d\'augmenter le loyer.';
  }
  return 'Investissement risqué. La majorité des critères ne sont pas respectés. Reconsidérez ce projet ou cherchez des optimisations significatives.';
}

/**
 * Génère la synthèse complète de l'investissement
 */
export function genererSynthese(
  rentabilite: RentabiliteCalculations,
  hcsf: HCSFCalculations,
  fiscalite?: FiscaliteCalculations,
  structure?: StructureData
): SyntheseCalculations {
  const points_attention_messages: string[] = [];
  let scoreInterne = 0;

  // Critère 1 : Autofinancement (cash-flow >= 0)
  const critere_autofinancement = evaluerCritere(
    rentabilite.cashflow_mensuel >= 0,
    rentabilite.cashflow_mensuel
  );
  if (critere_autofinancement.status === 'OK') {
    scoreInterne += 1;
  } else {
    points_attention_messages.push(
      `Cash-flow négatif : ${round(rentabilite.cashflow_mensuel)} €/mois`
    );
  }

  // Critère 2 : Rentabilité nette >= 7%
  const critere_rentabilite = evaluerCritere(
    rentabilite.rentabilite_nette >= SEUILS.RENTABILITE_BRUTE_MIN,
    rentabilite.rentabilite_nette
  );
  if (critere_rentabilite.status === 'OK') {
    scoreInterne += 1;
  } else {
    points_attention_messages.push(
      `Rentabilité nette faible : ${round(rentabilite.rentabilite_nette, 2)}% (< ${SEUILS.RENTABILITE_BRUTE_MIN}%)`
    );
  }

  // Critère 3 : Conformité HCSF
  const critere_hcsf = evaluerCritere(hcsf.conforme, hcsf.taux_endettement);
  if (critere_hcsf.status === 'OK') {
    scoreInterne += 1;
  } else {
    points_attention_messages.push(
      `Non conforme HCSF : taux d'endettement ${hcsf.taux_endettement}% (> ${SEUILS.TAUX_ENDETTEMENT_MAX}%)`
    );
  }

  // Bonus : Rentabilité > 10%
  if (rentabilite.rentabilite_nette >= SEUILS.RENTABILITE_BRUTE_BONNE) {
    scoreInterne += 1;
  }

  // Ajout des alertes HCSF aux points d'attention
  points_attention_messages.push(...hcsf.alertes);

  // Calcul du score détaillé sur 100
  const scoreDetail = calculerScoreGlobal(
    rentabilite.cashflow_mensuel,
    rentabilite.rentabilite_nette,
    hcsf.taux_endettement,
    hcsf.conforme
  );

  // Évaluation qualitative
  const { evaluation, couleur } = genererEvaluation(scoreDetail.total);

  // Recommandation principale
  const recommandation = getRecommandationPrincipale(scoreInterne);

  // Points d'attention détaillés
  const points_attention_detail = fiscalite
    ? genererPointsAttention(rentabilite, hcsf, fiscalite)
    : [];

  // Recommandations détaillées
  const recommandations_detail = structure
    ? genererRecommandations(structure, rentabilite, hcsf, scoreDetail)
    : [];

  return {
    score_global: scoreDetail.total,
    evaluation,
    couleur,
    recommandation,
    points_attention: points_attention_messages,
    score_detail: scoreDetail,
    points_attention_detail,
    recommandations_detail,
    criteres: {
      autofinancement: critere_autofinancement,
      rentabilite: critere_rentabilite,
      hcsf: critere_hcsf,
    },
  };
}

/**
 * Arrondit un nombre à un nombre de décimales
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
