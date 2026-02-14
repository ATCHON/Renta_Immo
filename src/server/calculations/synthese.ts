/**
 * Module de synthèse et scoring/**
 * Génère une synthèse score et des recommandations basées sur les résultats
 * 
 * @ref docs/core/specification-calculs.md#7-scoring-et-synthèse
 * @param resultats - Résultats des calculs
 * - Autofinancement : 0-30 points (cashflow mensuel)
 * - Rentabilité : 0-30 points (rentabilité nette)
 * - Conformité HCSF : 0-25 points (taux d'endettement)
 * - Bonus rentabilité : 0-15 points (si rentabilité >= 10%)
 */

import type {
  StructureData,
  BienData,
  RentabiliteCalculations,
  HCSFCalculations,
  FiscaliteCalculations,
  SyntheseCalculations,
  ScoreDetail,
  PointAttention,
  Recommandation,
  DPE,
} from './types';
import { SEUILS } from './types';

/**
 * Évaluations qualitatives
 */
const EVALUATIONS = {
  excellent: { min: 80, max: 100, label: 'Excellent' as const, color: 'green' },
  bon: { min: 60, max: 79, label: 'Bon' as const, color: 'blue' },
  moyen: { min: 40, max: 59, label: 'Moyen' as const, color: 'orange' },
  faible: { min: 0, max: 39, label: 'Faible' as const, color: 'red' },
};

// ========================================================================
// AUDIT-106 : Nouveau système de scoring (base 40 + ajustements)
// ========================================================================

const SCORE_BASE = 40;

/**
 * Interpolation linéaire entre deux bornes
 */
function interpoler(valeur: number, min: number, max: number, scoreMin: number, scoreMax: number): number {
  if (valeur <= min) return scoreMin;
  if (valeur >= max) return scoreMax;
  return scoreMin + (valeur - min) / (max - min) * (scoreMax - scoreMin);
}

/**
 * Ajustement cashflow net impôt (-20 / +20)
 */
export function ajustementCashflow(cashflowMensuel: number): number {
  if (cashflowMensuel >= 200) return 20;
  if (cashflowMensuel >= 0) return interpoler(cashflowMensuel, 0, 200, 0, 20);
  if (cashflowMensuel >= -200) return interpoler(cashflowMensuel, -200, 0, -20, 0);
  return -20;
}

/**
 * Ajustement rentabilité nette-nette (-15 / +20)
 */
export function ajustementRentabilite(rentabiliteNetteNette: number): number {
  if (rentabiliteNetteNette >= 7) return 20;
  if (rentabiliteNetteNette >= 3) return interpoler(rentabiliteNetteNette, 3, 7, 0, 20);
  if (rentabiliteNetteNette >= 0) return interpoler(rentabiliteNetteNette, 0, 3, -15, 0);
  return -15;
}

/**
 * Ajustement HCSF (-25 / +20)
 */
export function ajustementHcsf(tauxEndettement: number, conforme: boolean): number {
  if (!conforme && tauxEndettement > 50) return -25;
  if (tauxEndettement <= 25) return 20;
  if (tauxEndettement <= 35) return interpoler(tauxEndettement, 25, 35, 20, 0);
  if (tauxEndettement <= 50) return interpoler(tauxEndettement, 35, 50, 0, -15);
  return -25;
}

/**
 * Ajustement DPE (-10 / +5)
 */
export function ajustementDpe(dpe?: DPE): number {
  if (!dpe) return 0; // Neutre si non renseigné
  switch (dpe) {
    case 'A': case 'B': return 5;
    case 'C': case 'D': return 0;
    case 'E': return -3;
    case 'F': case 'G': return -10;
    default: return 0;
  }
}

/**
 * Ajustement ratio prix/loyer (-5 / +10)
 */
export function ajustementRatioPrixLoyer(prixAchat: number, loyerAnnuel: number): number {
  if (loyerAnnuel <= 0) return -5;
  const ratio = prixAchat / loyerAnnuel;
  if (ratio <= 15) return 10;
  if (ratio <= 20) return interpoler(ratio, 15, 20, 0, 10);
  if (ratio <= 25) return interpoler(ratio, 20, 25, -5, 0);
  return -5;
}

/**
 * Ajustement reste à vivre (-10 / +5)
 * Basé sur les revenus d'activité et les charges
 */
export function ajustementResteAVivre(revenusActivite?: number, totalChargesMensuelles?: number): number {
  if (!revenusActivite || revenusActivite <= 0) return 0; // Non calculable
  const charges = totalChargesMensuelles ?? 0;
  const resteAVivre = revenusActivite - charges;
  // Seuils : min = 800€/personne, confort = 1500€
  if (resteAVivre >= 1500) return 5;
  if (resteAVivre >= 800) return 0;
  return -10;
}

/**
 * AUDIT-110 : Constantes DPE réglementaires
 */
const DPE_INTERDICTIONS = {
  G: { annee: 2025, libelle: 'Interdit à la location depuis le 1er janvier 2025' },
  F: { annee: 2028, libelle: 'Interdit à la location à partir du 1er janvier 2028' },
  E: { annee: 2034, libelle: 'Interdit à la location à partir du 1er janvier 2034' },
};

const DPE_GEL_LOYER: string[] = ['F', 'G'];

/**
 * AUDIT-110 : Génère les alertes liées au DPE
 */
export function genererAlertesDpe(dpe?: DPE, horizon?: number): PointAttention[] {
  if (!dpe) return [];
  const alertes: PointAttention[] = [];
  const anneeActuelle = new Date().getFullYear();

  const interdiction = DPE_INTERDICTIONS[dpe as keyof typeof DPE_INTERDICTIONS];
  if (interdiction) {
    const dejaInterdit = anneeActuelle >= interdiction.annee;
    alertes.push({
      type: dejaInterdit ? 'error' : 'warning',
      categorie: 'general',
      message: 'DPE ' + dpe + ' : ' + interdiction.libelle,
      conseil: dejaInterdit
        ? "Ce bien ne peut pas être mis en location en l'état. Des travaux de rénovation énergétique sont obligatoires."
        : "Anticipez les travaux de rénovation énergétique avant l'échéance.",
    });

    if (!dejaInterdit && horizon) {
      const anneesRestantes = interdiction.annee - anneeActuelle;
      if (anneesRestantes < horizon) {
        alertes.push({
          type: 'warning',
          categorie: 'general',
          message: "L'interdiction de location interviendra dans " + anneesRestantes + " ans, avant la fin de votre horizon de projection (" + horizon + " ans)",
          conseil: 'Prévoyez un budget de rénovation énergétique pour maintenir la rentabilité du bien.',
        });
      }
    }
  }

  if (DPE_GEL_LOYER.includes(dpe)) {
    alertes.push({
      type: 'warning',
      categorie: 'general',
      message: "Gel des loyers : l'IRL ne s'applique pas aux logements classés F ou G",
      conseil: "L'évolution des loyers est bloquée tant que le DPE n'est pas amélioré.",
    });
  }

  return alertes;
}

/**
 * Calcule le score global selon la spécification métier (AUDIT-106)
 * Base 40 + ajustements par critère, borné entre 0 et 100
 */
export function calculerScoreGlobal(params: {
  cashflowMensuel: number;
  rentabiliteNetteNette: number;
  tauxEndettement: number;
  hcsfConforme: boolean;
  dpe?: DPE;
  prixAchat: number;
  loyerAnnuel: number;
  revenusActivite?: number;
  totalChargesMensuelles?: number;
}): ScoreDetail {
  const ajCashflow = round(ajustementCashflow(params.cashflowMensuel), 1);
  const ajRentabilite = round(ajustementRentabilite(params.rentabiliteNetteNette), 1);
  const ajHcsf = round(ajustementHcsf(params.tauxEndettement, params.hcsfConforme), 1);
  const ajDpe = ajustementDpe(params.dpe);
  const ajRatio = round(ajustementRatioPrixLoyer(params.prixAchat, params.loyerAnnuel), 1);
  const ajRav = ajustementResteAVivre(params.revenusActivite, params.totalChargesMensuelles);

  const sommeAjustements = ajCashflow + ajRentabilite + ajHcsf + ajDpe + ajRatio + ajRav;
  const total = Math.max(0, Math.min(100, SCORE_BASE + sommeAjustements));

  return {
    base: SCORE_BASE,
    ajustements: {
      cashflow: ajCashflow,
      rentabilite: ajRentabilite,
      hcsf: ajHcsf,
      dpe: ajDpe,
      ratio_prix_loyer: ajRatio,
      reste_a_vivre: ajRav,
    },
    total: round(total),
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
  fiscalite: FiscaliteCalculations,
  dpe?: DPE,
  horizon?: number
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

  // AUDIT-110 : Alertes DPE
  points.push(...genererAlertesDpe(dpe, horizon));

  return points;
}

/**
 * Génère les recommandations personnalisées
 */
export function genererRecommandations(
  structure: StructureData,
  rentabilite: RentabiliteCalculations,
  hcsf: HCSFCalculations,
  score: ScoreDetail,
  bien?: BienData,
  cashflowNetImpotMensuel?: number
): Recommandation[] {
  const recommandations: Recommandation[] = [];

  // Utiliser le cashflow net impôt si disponible, sinon le cashflow avant impôts
  const cfReference = cashflowNetImpotMensuel ?? rentabilite.cashflow_mensuel;

  // Recommandations cashflow négatif
  if (cfReference < 0) {
    recommandations.push({
      priorite: 'haute',
      categorie: 'financement',
      titre: 'Améliorer le cashflow',
      description: `Votre investissement nécessite un effort d'épargne de ${Math.abs(round(cfReference))}€/mois`,
      actions: [
        'Négocier un taux de crédit plus bas',
        'Allonger la durée du prêt',
        'Augmenter l\'apport personnel',
        'Revoir le prix d\'achat à la baisse',
      ],
    });
  } else if (cfReference > 0) {
    recommandations.push({
      priorite: 'info',
      categorie: 'cashflow',
      titre: 'Cashflow positif',
      description: `Votre investissement génère ${round(cfReference)}€/mois`,
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


  // AUDIT-110 : Recommandations DPE passoires
  if (bien?.dpe && ["F", "G"].includes(bien.dpe)) {
    recommandations.push({
      priorite: "haute",
      categorie: "general",
      titre: "Rénovation énergétique nécessaire",
      description: "Votre bien est classé DPE " + bien.dpe + " (passoire énergétique)",
      actions: [
        "Prévoir un budget de rénovation énergétique pour améliorer le DPE",
        "Vérifier l'éligibilité aux aides MaPrimeRénov'",
        "Consulter un diagnostiqueur pour estimer les travaux nécessaires",
        "Attention : le gel des loyers s'applique aux biens classés F et G",
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
 * Génère la synthèse complète de l'investissement (AUDIT-106 : nouveau scoring)
 */
export function genererSynthese(
  rentabilite: RentabiliteCalculations,
  hcsf: HCSFCalculations,
  fiscalite?: FiscaliteCalculations,
  structure?: StructureData,
  bien?: BienData
): SyntheseCalculations {
  const points_attention_messages: string[] = [];
  let scoreInterne = 0;

  // Score interne 0-4 (rétrocompatibilité)
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

  const critere_hcsf = evaluerCritere(hcsf.conforme, hcsf.taux_endettement);
  if (critere_hcsf.status === 'OK') {
    scoreInterne += 1;
  }

  if (rentabilite.rentabilite_nette >= SEUILS.RENTABILITE_BRUTE_BONNE) {
    scoreInterne += 1;
  }

  points_attention_messages.push(...hcsf.alertes);

  // Cashflow net impôt mensuel (pour scoring)
  const cashflowNetImpotMensuel = fiscalite
    ? Math.round((rentabilite.cashflow_annuel - fiscalite.impot_total) / 12)
    : rentabilite.cashflow_mensuel;

  // Rentabilité nette-nette (après impôts)
  const rentabiliteNetteNette = fiscalite?.rentabilite_nette_nette ?? rentabilite.rentabilite_nette;

  // Charges mensuelles HCSF pour reste à vivre
  const chargesMensuellesHcsf = hcsf.charges_detail?.total_mensuelles ?? 0;

  // Calcul du score détaillé sur 100 (AUDIT-106)
  const scoreDetail = calculerScoreGlobal({
    cashflowMensuel: cashflowNetImpotMensuel,
    rentabiliteNetteNette,
    tauxEndettement: hcsf.taux_endettement,
    hcsfConforme: hcsf.conforme,
    dpe: bien?.dpe,
    prixAchat: bien?.prix_achat ?? 0,
    loyerAnnuel: rentabilite.loyer_annuel,
    revenusActivite: structure?.revenus_activite,
    totalChargesMensuelles: chargesMensuellesHcsf,
  });

  const { evaluation, couleur } = genererEvaluation(scoreDetail.total);
  const recommandation = getRecommandationPrincipale(scoreInterne);

  const points_attention_detail = fiscalite
    ? genererPointsAttention(rentabilite, hcsf, fiscalite, bien?.dpe, 20)
    : [];

  const recommandations_detail = structure
    ? genererRecommandations(structure, rentabilite, hcsf, scoreDetail, bien, cashflowNetImpotMensuel)
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
