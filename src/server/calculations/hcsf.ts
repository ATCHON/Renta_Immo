/**
 * Module d'analyse HCSF (Haut Conseil de Stabilité Financière)
 * Calcul du taux d'endettement selon les normes bancaires
 */

import type { CalculationInput, HCSFCalculations, AssocieData, FinancementCalculations } from './types';
import { SEUILS } from './types';

// ============================================================================
// TYPES LOCAUX (selon spécification TECH-005)
// ============================================================================

/**
 * Détail du calcul HCSF pour un associé
 */
export interface AssocieHcsf {
  nom?: string;
  parts: number;
  revenus_annuels: number;
  credits_existants_mensuels: number; // crédits existants de l'associé
  charges_fixes_mensuelles: number; // charges fixes de l'associé
  quote_part_mensualite_credit: number; // quote-part du nouveau crédit
  revenus_locatifs_ponderes_mensuels: number;
  revenus_totaux_ponderes_mensuels: number;
  charges_totales_mensuelles: number; // somme de toutes les charges de l'associé
  taux_endettement: number;
  conforme: boolean;
  alertes: string[];
}

/**
 * Détail du calcul HCSF pour la sortie globale
 * Correspond à l'interface HCSFCalculations de types.ts
 */
interface HcsfDetail extends HCSFCalculations {
  /** Détail des revenus mensuels agrégés */
  revenus_detail: {
    salaires_estimatif_mensuels: number; // uniquement pour nom propre
    locatifs_bruts_mensuels: number;
    locatifs_ponderes_mensuels: number;
    total_mensuels: number;
  };
  /** Détail des charges mensuelles agrégées */
  charges_detail: {
    credits_existants_mensuels: number;
    nouveau_credit_mensuel: number;
    charges_fixes_mensuelles: number;
    total_mensuelles: number;
  };
  /** Capacite d'emprunt résiduelle en € sur 20 ans à 3.5% */
  capacite_emprunt_residuelle: number;
}


// ============================================================================
// CONSTANTES HCSF
// ============================================================================

const HCSF_CONSTANTES = {
  /** Taux d'endettement maximum */
  TAUX_MAX: 0.35,

  /** Seuil d'alerte (proche du max) */
  TAUX_ALERTE: 0.33,

  /** Pondération des revenus locatifs */
  PONDERATION_LOCATIFS: 0.70,

  /** Durée max du crédit en mois */
  DUREE_MAX_MOIS: 300, // 25 ans
} as const;

// ============================================================================
// CALCULS DE BASE
// ============================================================================

/**
 * Calcule le taux d'endettement
 *
 * @param revenusMensuels - Revenus mensuels totaux
 * @param chargesMensuelles - Charges mensuelles totales (crédits + charges fixes)
 * @returns Taux d'endettement (0-1)
 */
export function calculerTauxEndettement(
  revenusMensuels: number,
  chargesMensuelles: number
): number {
  if (revenusMensuels <= 0) {
    return chargesMensuelles > 0 ? 1 : 0; // Si revenus nuls mais charges, endettement infini
  }
  return chargesMensuelles / revenusMensuels;
}

/**
 * Calcule les revenus avec pondération HCSF
 *
 * @param revenusActiviteMensuels - Revenus d'activité mensuels (salaires, etc.)
 * @param revenusLocatifsBrutsMensuels - Revenus locatifs mensuels bruts
 * @returns Revenus totaux pondérés avec détail
 */
export function calculerRevenusPonderes(
  revenusActiviteMensuels: number,
  revenusLocatifsBrutsMensuels: number
): { bruts: number; ponderes: number; total: number } {
  const locatifsPonderes = revenusLocatifsBrutsMensuels * HCSF_CONSTANTES.PONDERATION_LOCATIFS;
  return {
    bruts: revenusLocatifsBrutsMensuels,
    ponderes: locatifsPonderes,
    total: revenusActiviteMensuels + locatifsPonderes,
  };
}

// ============================================================================
// MODE NOM PROPRE
// ============================================================================

/**
 * Calcule le HCSF en mode nom propre
 *
 * @param data - Données d'entrée validées
 * @param mensualiteNouveauCredit - Mensualité du nouveau crédit
 * @param loyerMensuelBrut - Loyer mensuel brut du bien
 * @returns Analyse HCSF complète
 */
export function calculerHcsfNomPropre(
  data: CalculationInput,
  mensualiteNouveauCredit: number,
  loyerMensuelBrut: number
): HcsfDetail {
  const alertes: string[] = [];

  const revenusActiviteMensuelsEstimes = estimerRevenusDepuisTmi(data.structure.tmi ?? 0);

  const revenusPonderes = calculerRevenusPonderes(
    revenusActiviteMensuelsEstimes,
    loyerMensuelBrut
  );

  const creditsExistantsMensuels = 0;
  const chargesFixesMensuelles = 0;
  const chargesTotalesMensuelles =
    creditsExistantsMensuels + chargesFixesMensuelles + mensualiteNouveauCredit;

  const tauxEndettement = calculerTauxEndettement(
    revenusPonderes.total,
    chargesTotalesMensuelles
  );

  // Conformité HCSF
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

  // Vérification durée du crédit
  if (data.financement.duree_emprunt * 12 > HCSF_CONSTANTES.DUREE_MAX_MOIS) {
    alertes.push(
      `Durée du crédit (${data.financement.duree_emprunt} ans) supérieure au maximum HCSF (25 ans)`
    );
  }

  // Calcul capacité d'emprunt résiduelle (globale pour le porteur)
  const capaciteResiduelle = calculerCapaciteResiduelle(
    revenusPonderes.total,
    creditsExistantsMensuels + chargesFixesMensuelles,
    mensualiteNouveauCredit
  );

  return {
    structure: 'nom_propre',
    taux_endettement: arrondir(tauxEndettement * 100, 2),
    conforme,
    details_associes: [], // Aucun associé dans ce mode
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
 * @param data - Données d'entrée validées
 * @param mensualiteNouveauCredit - Mensualité du nouveau crédit
 * @param loyerMensuelBrut - Loyer mensuel brut du bien
 * @returns Analyse HCSF complète avec détail par associé
 */
export function calculerHcsfSciIs(
  data: CalculationInput,
  mensualiteNouveauCredit: number,
  loyerMensuelBrut: number
): HcsfDetail {
  const alertes: string[] = [];
  const associes = data.structure.associes ?? [];

  if (associes.length === 0) {
    alertes.push('Aucun associé défini pour la SCI. Impossible de calculer le HCSF par associé.');
    return {
      structure: 'sci_is',
      taux_endettement: 0,
      conforme: false,
      details_associes: [],
      alertes,
      revenus_detail: { salaires_estimatif_mensuels: 0, locatifs_bruts_mensuels: 0, locatifs_ponderes_mensuels: 0, total_mensuels: 0 },
      charges_detail: { credits_existants_mensuels: 0, nouveau_credit_mensuel: 0, charges_fixes_mensuelles: 0, total_mensuelles: 0 },
      capacite_emprunt_residuelle: 0,
    };
  }

  const resultatsAssocies: AssocieHcsf[] = associes.map((associe) =>
    calculerHcsfPourAssocie(associe, mensualiteNouveauCredit, loyerMensuelBrut)
  );

  let tousConformes = true;
  let tauxEndettementGlobal = 0; // On prend le taux le plus élevé pour la conformité globale

  resultatsAssocies.forEach((resAssocie) => {
    alertes.push(...resAssocie.alertes); // Remonter les alertes spécifiques à l'associé
    if (!resAssocie.conforme) {
      tousConformes = false;
    }
    if (resAssocie.taux_endettement > tauxEndettementGlobal) {
      tauxEndettementGlobal = resAssocie.taux_endettement;
    }
  });

  // Collecte des totaux pour l'affichage global
  const totalRevenusActiviteMensuels = resultatsAssocies.reduce((sum, a) => sum + (a.revenus_annuels / 12), 0);
  const totalCreditsExistantsMensuels = resultatsAssocies.reduce((sum, a) => sum + a.credits_existants_mensuels, 0);
  const totalChargesFixesMensuelles = resultatsAssocies.reduce((sum, a) => sum + a.charges_fixes_mensuelles, 0);

  // Calcul capacite d'emprunt résiduelle (pour l'associé le plus contraint)
  const associePlusContraint = resultatsAssocies.reduce((prev, curr) =>
    curr.taux_endettement > prev.taux_endettement ? curr : prev
  );

  let capaciteResiduelleGlobale = 0;
  if (associePlusContraint) {
      // Pour calculer la capacité résiduelle d'un associé, on utilise ses propres revenus et charges
      const revenusMensuelsAssocieContraint = associePlusContraint.revenus_totaux_ponderes_mensuels;
      // Somme des charges existantes de l'associé le plus contraint
      const chargesExistantesAssocieContraint = associePlusContraint.credits_existants_mensuels + associePlusContraint.charges_fixes_mensuelles;
      const nouvelleChargeAssocieContraint = associePlusContraint.quote_part_mensualite_credit;

      capaciteResiduelleGlobale = calculerCapaciteResiduelle(
          revenusMensuelsAssocieContraint,
          chargesExistantesAssocieContraint,
          nouvelleChargeAssocieContraint
      );
  }


  // Vérification durée du crédit (globale pour le bien)
  if (data.financement.duree_emprunt * 12 > HCSF_CONSTANTES.DUREE_MAX_MOIS) {
    alertes.push(
      `Durée du crédit (${data.financement.duree_emprunt} ans) supérieure au maximum HCSF (25 ans)`
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
    par_associe: resultatsAssocies, // Détail complet par associé
    alertes,
    revenus_detail: {
      salaires_estimatif_mensuels: arrondir(totalRevenusActiviteMensuels),
      locatifs_bruts_mensuels: arrondir(loyerMensuelBrut * associes.length), // Approx, pourrait être plus précis
      locatifs_ponderes_mensuels: arrondir(loyerMensuelBrut * HCSF_CONSTANTES.PONDERATION_LOCATIFS * associes.length),
      total_mensuels: arrondir(totalRevenusActiviteMensuels + (loyerMensuelBrut * HCSF_CONSTANTES.PONDERATION_LOCATIFS * associes.length)),
    },
    charges_detail: {
      credits_existants_mensuels: arrondir(totalCreditsExistantsMensuels),
      nouveau_credit_mensuel: arrondir(mensualiteNouveauCredit),
      charges_fixes_mensuelles: arrondir(totalChargesFixesMensuelles),
      total_mensuels: arrondir(resultatsAssocies.reduce((sum, a) => sum + a.charges_totales_mensuelles, 0)),
    },
    capacite_emprunt_residuelle: arrondir(capaciteResiduelleGlobale),
  };
}

/**
 * Calcule le HCSF pour un associé spécifique (utilisé par SCI IS)
 *
 * @param associe - Données de l'associé
 * @param mensualiteNouveauCredit - Mensualité totale du nouveau crédit
 * @param loyerMensuelBrut - Loyer mensuel brut du bien
 * @returns Résultat HCSF pour cet associé
 */
function calculerHcsfPourAssocie(
  associe: AssocieData,
  mensualiteNouveauCredit: number,
  loyerMensuelBrut: number
): AssocieHcsf {
  const alertes: string[] = [];
  const parts = associe.parts / 100; // Convertir en décimal

  // Quote-part du nouveau crédit
  const quotePartMensualiteCredit = mensualiteNouveauCredit * parts;

  // Revenus de l'associé (mensuels)
  const revenusActiviteMensuels = associe.revenus_annuels / 12;

  // Quote-part des revenus locatifs du bien
  const revenusLocatifsBrutsMensuels = loyerMensuelBrut * parts;

  // Revenus pondérés HCSF de l'associé
  const revenusPonderes = calculerRevenusPonderes(
    revenusActiviteMensuels,
    revenusLocatifsBrutsMensuels
  );

  // Charges existantes de l'associé (mensuels)
  const creditsExistantsMensuels = associe.credits_mensuels ?? 0;
  const chargesFixesMensuelles = associe.charges_mensuelles ?? 0;
  const chargesTotalesMensuelles =
    creditsExistantsMensuels + chargesFixesMensuelles + quotePartMensualiteCredit;

  // Taux d'endettement
  const tauxEndettement = calculerTauxEndettement(
    revenusPonderes.total,
    chargesTotalesMensuelles
  );

  // Conformité HCSF
  const conforme = tauxEndettement <= HCSF_CONSTANTES.TAUX_MAX;

  if (!conforme) {
    alertes.push(
      `${associe.nom ?? 'Associé'} : Taux d'endettement (${formatPourcent(tauxEndettement)}) > seuil HCSF (${formatPourcent(HCSF_CONSTANTES.TAUX_MAX)})`
    );
  } else if (tauxEndettement > HCSF_CONSTANTES.TAUX_ALERTE) {
    alertes.push(
      `${associe.nom ?? 'Associé'} : Taux d'endettement (${formatPourcent(tauxEndettement)}) proche du seuil HCSF (${formatPourcent(HCSF_CONSTANTES.TAUX_ALERTE)})`
    );
  }

  return {
    nom: associe.nom,
    parts: associe.parts,
    revenus_annuels: arrondir(associe.revenus_annuels),
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
 *
 * @param data - Données d'entrée validées
 * @param financement - Résultats du calcul de financement
 * @param loyerMensuelBrut - Loyer mensuel brut
 * @returns Analyse HCSF complète
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
 * Approximation basée sur les tranches d'imposition.
 * Ceci est une simplification pour le MVP.
 */
function estimerRevenusDepuisTmi(tmi: number): number {
  if (tmi === 0) return 1000; // Cas spécifique pour TMI 0%
  if (tmi <= 0.11) return 1500; // TMI 0 ou 11
  if (tmi <= 0.30) return 3500; // TMI 30
  if (tmi <= 0.41) return 6500; // TMI 41
  if (tmi <= 0.45) return 15000; // TMI 45
  return 1000; // Default si TMI non renseigné ou invalide
}

/**
 * Calcule la capacité d'emprunt résiduelle en euros.
 * Approximation simple basée sur le taux d'endettement max et un crédit de référence.
 */
function calculerCapaciteResiduelle(
  revenusTotauxPonderesMensuels: number,
  chargesExistantesMensuelles: number,
  nouvelleChargeMensuelle: number
): number {
  const chargeMaximaleAutorisee = revenusTotauxPonderesMensuels * HCSF_CONSTANTES.TAUX_MAX;
  const chargesActuellesAvecNouveauCredit = chargesExistantesMensuelles + nouvelleChargeMensuelle;
  const margeMensuelleDisponible = Math.max(0, chargeMaximaleAutorisee - chargesActuellesAvecNouveauCredit);

  // Pour convertir une capacité mensuelle en capital empruntable :
  // Utilise une formule inverse de PMT simplifiée. Hypothèses: 20 ans (240 mois), taux 3.5%
  const tauxMensuel = 0.035 / 12; // 3.5% annuel
  const dureeMois = 240;

  if (tauxMensuel === 0) { // Pour éviter la division par zéro si taux 0
      return margeMensuelleDisponible * dureeMois;
  }

  const facteurActualisation = (1 - Math.pow(1 + tauxMensuel, -dureeMois)) / tauxMensuel;
  return margeMensuelleDisponible * facteurActualisation;
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