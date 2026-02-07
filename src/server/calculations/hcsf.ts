/**
 * Module d'analyse HCSF (Haut Conseil de Stabilité Financière)
 * Calcul du taux d'endettement selon les normes bancaires
 *
 * Règles HCSF (2024) :
 * - Taux d'endettement maximum : 35%
 * - Durée de crédit maximum : 25 ans (300 mois)
 * - Calcul des revenus locatifs pondérés à 70%
 */

import type { CalculationInput, HCSFCalculations, AssocieData, FinancementCalculations } from './types';
import { CONSTANTS } from '@/config/constants';

// ============================================================================
// TYPES LOCAUX (selon spécification TECH-005)
// ============================================================================

/**
 * Constantes HCSF réglementaires - exportées pour la page "En savoir plus"
 */
export const HCSF_CONSTANTES = {
  /** Taux d'endettement maximum */
  TAUX_MAX: 0.35, // 35%
  /** Seuil d'alerte (proche du max) */
  TAUX_ALERTE: 0.33, // 33%
  /** Pondération des revenus locatifs */
  PONDERATION_LOCATIFS: 0.70, // 70%
  /** Durée max du crédit en mois */
  DUREE_MAX_MOIS: 300, // 25 ans
  /** Durée max du crédit en années */
  DUREE_MAX_ANNEES: 25,
} as const;

/**
 * Détail du calcul HCSF pour un associé
 */
export interface AssocieHcsf {
  nom?: string;
  parts: number;
  revenus_annuels: number;
  credits_existants_mensuels: number;
  charges_fixes_mensuelles: number;
  quote_part_mensualite_credit: number;
  revenus_locatifs_ponderes_mensuels: number;
  revenus_totaux_ponderes_mensuels: number;
  charges_totales_mensuelles: number;
  taux_endettement: number;
  conforme: boolean;
  alertes: string[];
}

/**
 * Détail du calcul HCSF pour la sortie globale
 */
interface HcsfDetail extends HCSFCalculations {
  /** Détail complet par associé (pour SCI IS) */
  par_associe?: AssocieHcsf[];
}

// ============================================================================
// CALCULS DE BASE
// ============================================================================

/**
 * Calcule le taux d'endettement
 */
export function calculerTauxEndettement(
  revenusMensuels: number,
  chargesMensuelles: number
): number {
  if (revenusMensuels <= 0) {
    return chargesMensuelles > 0 ? 1 : 0;
  }
  return chargesMensuelles / revenusMensuels;
}

/**
 * Calcule les revenus avec pondération HCSF
 */
export function calculerRevenusPonderes(
  revenusActiviteMensuels: number,
  revenusProjetBrutsMensuels: number,
  loyersActuelsMensuels: number = 0
): { bruts: number; ponderes: number; total: number } {
  const projetPonderes = revenusProjetBrutsMensuels * HCSF_CONSTANTES.PONDERATION_LOCATIFS;
  const actuelsPonderes = loyersActuelsMensuels * HCSF_CONSTANTES.PONDERATION_LOCATIFS;

  return {
    bruts: revenusProjetBrutsMensuels + loyersActuelsMensuels,
    ponderes: projetPonderes + actuelsPonderes,
    total: revenusActiviteMensuels + projetPonderes + actuelsPonderes,
  };
}

/**
 * Calcule la capacité d'emprunt résiduelle en euros.
 */
function calculerCapaciteResiduelle(
  revenusTotauxPonderesMensuels: number,
  chargesExistantesMensuelles: number,
  nouvelleChargeMensuelle: number
): number {
  const chargeMaximaleAutorisee = revenusTotauxPonderesMensuels * HCSF_CONSTANTES.TAUX_MAX;
  const chargesActuellesAvecNouveauCredit = chargesExistantesMensuelles + nouvelleChargeMensuelle;
  const margeMensuelleDisponible = Math.max(0, chargeMaximaleAutorisee - chargesActuellesAvecNouveauCredit);

  // Conversion en capital empruntable : 20 ans (240 mois), taux 3.5%
  const tauxMensuel = 0.035 / 12;
  const dureeMois = 240;

  if (tauxMensuel === 0) {
    return margeMensuelleDisponible * dureeMois;
  }

  const facteurActualisation = (1 - Math.pow(1 + tauxMensuel, -dureeMois)) / tauxMensuel;
  return margeMensuelleDisponible * facteurActualisation;
}

// ============================================================================
// MODE NOM PROPRE
// ============================================================================

/**
 * Calcule le HCSF en mode nom propre
 * 
 * @ref docs/core/specification-calculs.md#62-calcul-du-taux-dendettement
 * @ref docs/core/specification-calculs.md#63-revenus-pondérés-mode-nom-propre
 */
export function calculerHcsfNomPropre(
  data: CalculationInput,
  mensualiteNouveauCredit: number,
  loyerMensuelBrut: number
): HcsfDetail {
  const alertes: string[] = [];

  // Vérification durée du crédit
  if (data.financement.duree_emprunt > HCSF_CONSTANTES.DUREE_MAX_ANNEES) {
    alertes.push(
      `Durée du crédit (${data.financement.duree_emprunt} ans) supérieure au maximum HCSF (25 ans)`
    );
  }

  const revenusActiviteMensuelsEstimes = data.structure.revenus_activite && data.structure.revenus_activite > 0
    ? data.structure.revenus_activite
    : estimerRevenusDepuisTmi(data.structure.tmi ?? 0);

  const revenusPonderes = calculerRevenusPonderes(
    revenusActiviteMensuelsEstimes,
    loyerMensuelBrut,
    data.structure.loyers_actuels || 0
  );

  const creditsExistantsMensuels = data.structure.credits_immobiliers || 0;
  const autresChargesMensuelles = data.structure.autres_charges || 0;
  const chargesFixesMensuelles = 0; // On pourrait ajouter d'autres charges ici si besoin
  const chargesTotalesMensuelles =
    creditsExistantsMensuels + autresChargesMensuelles + chargesFixesMensuelles + mensualiteNouveauCredit;

  const tauxEndettement = calculerTauxEndettement(
    revenusPonderes.total,
    chargesTotalesMensuelles
  );

  const conforme = tauxEndettement <= HCSF_CONSTANTES.TAUX_MAX;

  if (!conforme) {
    alertes.push(
      `Taux d'endettement (${formatPourcent(tauxEndettement)}) supérieur au seuil HCSF (${formatPourcent(HCSF_CONSTANTES.TAUX_MAX)})`
    );
  } else if (tauxEndettement > HCSF_CONSTANTES.TAUX_ALERTE) {
    alertes.push(
      `Taux d'endettement (${formatPourcent(tauxEndettement)}) proche du seuil HCSF (${formatPourcent(HCSF_CONSTANTES.TAUX_ALERTE)})`
    );
  }

  const capaciteResiduelle = calculerCapaciteResiduelle(
    revenusPonderes.total,
    creditsExistantsMensuels + chargesFixesMensuelles,
    mensualiteNouveauCredit
  );

  return {
    structure: 'nom_propre',
    taux_endettement: arrondir(tauxEndettement * 100, 2),
    conforme,
    details_associes: [],
    alertes,
    revenus_detail: {
      salaires_estimatif_mensuels: arrondir(revenusActiviteMensuelsEstimes),
      locatifs_bruts_mensuels: arrondir(loyerMensuelBrut),
      locatifs_ponderes_mensuels: arrondir(revenusPonderes.ponderes),
      total_mensuels: arrondir(revenusPonderes.total),
    },
    charges_detail: {
      credits_existants_mensuels: arrondir(creditsExistantsMensuels),
      nouveau_credit_mensuel: arrondir(mensualiteNouveauCredit),
      autres_charges_mensuelles: arrondir(autresChargesMensuelles),
      charges_fixes_mensuelles: arrondir(chargesFixesMensuelles),
      total_mensuelles: arrondir(chargesTotalesMensuelles),
    },
    capacite_emprunt_residuelle: arrondir(capaciteResiduelle),
  };
}

// ============================================================================
// MODE SCI IS
// ============================================================================

/**
 * Calcule le HCSF en mode SCI IS (par associé)
 * 
 * @ref docs/core/specification-calculs.md#67-mode-sci-is-par-associé
 */
export function calculerHcsfSciIs(
  data: CalculationInput,
  mensualiteNouveauCredit: number,
  loyerMensuelBrut: number
): HcsfDetail {
  const alertes: string[] = [];
  const associes = data.structure.associes ?? [];

  // Vérification durée du crédit
  if (data.financement.duree_emprunt > HCSF_CONSTANTES.DUREE_MAX_ANNEES) {
    alertes.push(
      `Durée du crédit (${data.financement.duree_emprunt} ans) supérieure au maximum HCSF (25 ans)`
    );
  }

  if (associes.length === 0) {
    alertes.push('Aucun associé défini pour la SCI. Impossible de calculer le HCSF par associé.');
    return {
      structure: 'sci_is',
      taux_endettement: 0,
      conforme: false,
      details_associes: [],
      alertes,
      revenus_detail: {
        salaires_estimatif_mensuels: 0,
        locatifs_bruts_mensuels: 0,
        locatifs_ponderes_mensuels: 0,
        total_mensuels: 0,
      },
      charges_detail: {
        credits_existants_mensuels: 0,
        nouveau_credit_mensuel: 0,
        charges_fixes_mensuelles: 0,
        total_mensuelles: 0,
      },
      capacite_emprunt_residuelle: 0,
    };
  }

  const resultatsAssocies: AssocieHcsf[] = associes.map((associe) =>
    calculerHcsfPourAssocie(associe, mensualiteNouveauCredit, loyerMensuelBrut)
  );

  let tousConformes = true;
  let tauxEndettementGlobal = 0;

  resultatsAssocies.forEach((resAssocie) => {
    alertes.push(...resAssocie.alertes);
    if (!resAssocie.conforme) {
      tousConformes = false;
    }
    if (resAssocie.taux_endettement > tauxEndettementGlobal) {
      tauxEndettementGlobal = resAssocie.taux_endettement;
    }
  });

  // Totaux pour l'affichage global
  const totalRevenusActiviteMensuels = resultatsAssocies.reduce(
    (sum, a) => sum + a.revenus_annuels / 12,
    0
  );
  const totalCreditsExistantsMensuels = resultatsAssocies.reduce(
    (sum, a) => sum + a.credits_existants_mensuels,
    0
  );
  const totalChargesFixesMensuelles = resultatsAssocies.reduce(
    (sum, a) => sum + a.charges_fixes_mensuelles,
    0
  );

  // Capacité résiduelle pour l'associé le plus contraint
  const associePlusContraint = resultatsAssocies.reduce((prev, curr) =>
    curr.taux_endettement > prev.taux_endettement ? curr : prev
  );

  let capaciteResiduelleGlobale = 0;
  if (associePlusContraint) {
    const revenusMensuelsAssocieContraint = associePlusContraint.revenus_totaux_ponderes_mensuels;
    const chargesExistantesAssocieContraint =
      associePlusContraint.credits_existants_mensuels + associePlusContraint.charges_fixes_mensuelles;
    const nouvelleChargeAssocieContraint = associePlusContraint.quote_part_mensualite_credit;

    capaciteResiduelleGlobale = calculerCapaciteResiduelle(
      revenusMensuelsAssocieContraint,
      chargesExistantesAssocieContraint,
      nouvelleChargeAssocieContraint
    );
  }

  return {
    structure: 'sci_is',
    taux_endettement: arrondir(tauxEndettementGlobal, 2),
    conforme: tousConformes,
    details_associes: resultatsAssocies.map((a) => ({
      nom: a.nom ?? 'Associé',
      taux_endettement: a.taux_endettement,
      conforme: a.conforme,
    })),
    par_associe: resultatsAssocies,
    alertes,
    revenus_detail: {
      salaires_estimatif_mensuels: arrondir(totalRevenusActiviteMensuels),
      locatifs_bruts_mensuels: arrondir(loyerMensuelBrut),
      locatifs_ponderes_mensuels: arrondir(loyerMensuelBrut * HCSF_CONSTANTES.PONDERATION_LOCATIFS),
      total_mensuels: arrondir(
        totalRevenusActiviteMensuels + loyerMensuelBrut * HCSF_CONSTANTES.PONDERATION_LOCATIFS
      ),
    },
    charges_detail: {
      credits_existants_mensuels: arrondir(totalCreditsExistantsMensuels),
      nouveau_credit_mensuel: arrondir(mensualiteNouveauCredit),
      charges_fixes_mensuelles: arrondir(totalChargesFixesMensuelles),
      total_mensuelles: arrondir(
        resultatsAssocies.reduce((sum, a) => sum + a.charges_totales_mensuelles, 0)
      ),
    },
    capacite_emprunt_residuelle: arrondir(capaciteResiduelleGlobale),
  };
}

/**
 * Calcule le HCSF pour un associé spécifique
 */
function calculerHcsfPourAssocie(
  associe: AssocieData,
  mensualiteNouveauCredit: number,
  loyerMensuelBrut: number
): AssocieHcsf {
  const alertes: string[] = [];
  const parts = associe.parts / 100;

  const quotePartMensualiteCredit = mensualiteNouveauCredit * parts;
  const revenusActiviteMensuels = associe.revenus; // Revenus déjà mensuels selon le type
  const revenusLocatifsBrutsMensuels = loyerMensuelBrut * parts;

  const revenusPonderes = calculerRevenusPonderes(
    revenusActiviteMensuels,
    revenusLocatifsBrutsMensuels
  );

  const creditsExistantsMensuels = associe.mensualites;
  const chargesFixesMensuelles = associe.charges;
  const chargesTotalesMensuelles =
    creditsExistantsMensuels + chargesFixesMensuelles + quotePartMensualiteCredit;

  const tauxEndettement = calculerTauxEndettement(revenusPonderes.total, chargesTotalesMensuelles);

  const conforme = tauxEndettement <= CONSTANTS.HCSF.TAUX_MAX;

  if (!conforme) {
    alertes.push(
      `${associe.nom ?? 'Associé'} : Taux d'endettement (${formatPourcent(tauxEndettement)}) > seuil HCSF (${formatPourcent(CONSTANTS.HCSF.TAUX_MAX)})`
    );
  } else if (tauxEndettement > (CONSTANTS.HCSF.TAUX_MAX * 0.95)) { // ~33%
    alertes.push(
      `${associe.nom ?? 'Associé'} : Taux d'endettement (${formatPourcent(tauxEndettement)}) proche du seuil HCSF`
    );
  }

  return {
    nom: associe.nom,
    parts: associe.parts,
    revenus_annuels: arrondir(associe.revenus * 12),
    credits_existants_mensuels: arrondir(creditsExistantsMensuels),
    charges_fixes_mensuelles: arrondir(chargesFixesMensuelles),
    quote_part_mensualite_credit: arrondir(quotePartMensualiteCredit),
    revenus_locatifs_ponderes_mensuels: arrondir(revenusPonderes.ponderes),
    revenus_totaux_ponderes_mensuels: arrondir(revenusPonderes.total),
    charges_totales_mensuelles: arrondir(chargesTotalesMensuelles),
    taux_endettement: arrondir(tauxEndettement * 100, 2),
    conforme,
    alertes,
  };
}

// ============================================================================
// ORCHESTRATEUR
// ============================================================================

/**
 * Analyse HCSF complète selon le mode de détention
 */
export function analyserHcsf(
  data: CalculationInput,
  financement: FinancementCalculations,
  loyerMensuelBrut: number
): HcsfDetail {
  const mensualiteNouveauCredit = financement.mensualite_totale;

  if (data.structure.type === 'sci_is') {
    return calculerHcsfSciIs(data, mensualiteNouveauCredit, loyerMensuelBrut);
  }

  return calculerHcsfNomPropre(data, mensualiteNouveauCredit, loyerMensuelBrut);
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Estime les revenus mensuels à partir du TMI
 */
function estimerRevenusDepuisTmi(tmi: number): number {
  if (tmi === 0) return CONSTANTS.HCSF.REVENUS_ESTIMES.TMI_0;
  if (tmi <= 11) return CONSTANTS.HCSF.REVENUS_ESTIMES.TMI_11;
  if (tmi <= 30) return CONSTANTS.HCSF.REVENUS_ESTIMES.TMI_30;
  if (tmi <= 41) return CONSTANTS.HCSF.REVENUS_ESTIMES.TMI_41;
  return CONSTANTS.HCSF.REVENUS_ESTIMES.TMI_45;
}

/**
 * Formate un nombre en pourcentage avec 1 décimale
 */
function formatPourcent(valeur: number): string {
  return `${arrondir(valeur * 100, 1)}%`;
}

/**
 * Arrondit un nombre à un nombre de décimales
 */
function arrondir(valeur: number, decimales: number = 2): number {
  const facteur = Math.pow(10, decimales);
  return Math.round(valeur * facteur) / facteur;
}
