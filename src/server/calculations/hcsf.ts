/**
 * Module d'analyse HCSF (Haut Conseil de Stabilité Financière)
 * Calcul du taux d'endettement selon les normes bancaires
 *
 * Règles HCSF (2024) :
 * - Taux d'endettement maximum : 35%
 * - Durée de crédit maximum : 25 ans (300 mois)
 * - Calcul des revenus locatifs pondérés à 70%
 */

import { ResolvedConfig } from '../config/config-types';
import type {
  CalculationInput,
  HCSFCalculations,
  AssocieData,
  FinancementCalculations,
} from './types';
import { SEUILS } from './constants';

// ============================================================================
// TYPES LOCAUX (selon spécification TECH-005)
// ============================================================================

/**
 * Constantes HCSF réglementaires (Désormais dans constants.ts via SEUILS)
 */

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
 * V2-S18 : La pondération est désormais configurable (défaut 70%)
 */
export function calculerRevenusPonderes(
  revenusActiviteMensuels: number,
  revenusProjetBrutsMensuels: number,
  loyersActuelsMensuels: number = 0,
  ponderationLoyers: number = 0.7 // Défaut HCSF fixe
): { bruts: number; ponderes: number; total: number } {
  const projetPonderes = revenusProjetBrutsMensuels * ponderationLoyers;
  const actuelsPonderes = loyersActuelsMensuels * ponderationLoyers;

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
  nouvelleChargeMensuelle: number,
  config: ResolvedConfig
): number {
  const chargeMaximaleAutorisee = revenusTotauxPonderesMensuels * config.hcsfTauxMax;
  const chargesActuellesAvecNouveauCredit = chargesExistantesMensuelles + nouvelleChargeMensuelle;
  const margeMensuelleDisponible = Math.max(
    0,
    chargeMaximaleAutorisee - chargesActuellesAvecNouveauCredit
  );

  // Conversion en capital empruntable (taux et durée configurables — REC-02)
  const tauxMensuel = config.hcsfTauxReferenceCapacite / 12;
  const dureeMois = config.hcsfDureeCapaciteResiduelleAnnees * 12;

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
  loyerMensuelBrut: number,
  config: ResolvedConfig,
  ponderationLoyers?: number
): HcsfDetail {
  const alertes: string[] = [];
  const ponderation =
    ponderationLoyers !== undefined ? ponderationLoyers / 100 : config.hcsfPonderationLocatifs;

  // Vérification durée du crédit (REC-04 : dérogation 27 ans pour VEFA)
  const dureeMaxNomPropre = data.bien?.is_vefa
    ? config.hcsfDureeMaxAnneesVefa
    : config.hcsfDureeMaxAnnees;
  if (data.financement.duree_emprunt > dureeMaxNomPropre) {
    alertes.push(
      `Durée du crédit (${data.financement.duree_emprunt} ans) supérieure au maximum HCSF (${dureeMaxNomPropre} ans)`
    );
  }

  const revenusActiviteMensuelsEstimes =
    data.structure.revenus_activite && data.structure.revenus_activite > 0
      ? data.structure.revenus_activite
      : estimerRevenusDepuisTmi(data.structure.tmi ?? 0);

  const revenusPonderes = calculerRevenusPonderes(
    revenusActiviteMensuelsEstimes,
    loyerMensuelBrut,
    data.structure.loyers_actuels || 0,
    ponderation
  );

  const creditsExistantsMensuels = data.structure.credits_immobiliers || 0;
  const autresChargesMensuelles = data.structure.autres_charges || 0;
  const chargesFixesMensuelles = 0; // On pourrait ajouter d'autres charges ici si besoin
  const chargesTotalesMensuelles =
    creditsExistantsMensuels +
    autresChargesMensuelles +
    chargesFixesMensuelles +
    mensualiteNouveauCredit;

  const tauxEndettement = calculerTauxEndettement(revenusPonderes.total, chargesTotalesMensuelles);

  const conforme = tauxEndettement <= config.hcsfTauxMax;

  if (!conforme) {
    alertes.push(
      `Taux d'endettement (${formatPourcent(tauxEndettement)}) supérieur au seuil HCSF (${formatPourcent(config.hcsfTauxMax)})`
    );
  } else if (tauxEndettement > config.hcsfTauxMax * 0.95) {
    alertes.push(`Taux d'endettement (${formatPourcent(tauxEndettement)}) proche du seuil HCSF`);
  }

  const capaciteResiduelle = calculerCapaciteResiduelle(
    revenusPonderes.total,
    creditsExistantsMensuels + chargesFixesMensuelles,
    mensualiteNouveauCredit,
    config
  );

  // AUDIT-107 : Reste à vivre
  const resteAVivre = revenusPonderes.total - chargesTotalesMensuelles;

  if (resteAVivre < config.resteAVivreSeuilMin) {
    alertes.push(
      `Reste à vivre (${Math.round(resteAVivre)} €/mois) inférieur au seuil bancaire minimum (${config.resteAVivreSeuilMin} €/mois)`
    );
  }

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
    reste_a_vivre: arrondir(resteAVivre),
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
  loyerMensuelBrut: number,
  config: ResolvedConfig,
  ponderationLoyers?: number
): HcsfDetail {
  const alertes: string[] = [];
  const ponderation =
    ponderationLoyers !== undefined ? ponderationLoyers / 100 : config.hcsfPonderationLocatifs;
  const associes = data.structure.associes ?? [];

  // Vérification durée du crédit (REC-04 : dérogation 27 ans pour VEFA)
  const dureeMaxSciIs = data.bien?.is_vefa
    ? config.hcsfDureeMaxAnneesVefa
    : config.hcsfDureeMaxAnnees;
  if (data.financement.duree_emprunt > dureeMaxSciIs) {
    alertes.push(
      `Durée du crédit (${data.financement.duree_emprunt} ans) supérieure au maximum HCSF (${dureeMaxSciIs} ans)`
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
    calculerHcsfPourAssocie(associe, mensualiteNouveauCredit, loyerMensuelBrut, config)
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
      associePlusContraint.credits_existants_mensuels +
      associePlusContraint.charges_fixes_mensuelles;
    const nouvelleChargeAssocieContraint = associePlusContraint.quote_part_mensualite_credit;

    capaciteResiduelleGlobale = calculerCapaciteResiduelle(
      revenusMensuelsAssocieContraint,
      chargesExistantesAssocieContraint,
      nouvelleChargeAssocieContraint,
      config
    );
  }

  // AUDIT-107 : Reste à vivre global (basé sur le total)
  const revenusTotauxGlobal = totalRevenusActiviteMensuels + loyerMensuelBrut * ponderation;
  const chargesTotalesGlobal = resultatsAssocies.reduce(
    (sum, a) => sum + a.charges_totales_mensuelles,
    0
  );
  const resteAVivre = revenusTotauxGlobal - chargesTotalesGlobal;

  if (resteAVivre < config.resteAVivreSeuilMin) {
    alertes.push(
      `Reste à vivre (${Math.round(resteAVivre)} €/mois) inférieur au seuil bancaire minimum (${config.resteAVivreSeuilMin} €/mois)`
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
      locatifs_ponderes_mensuels: arrondir(loyerMensuelBrut * ponderation),
      total_mensuels: arrondir(totalRevenusActiviteMensuels + loyerMensuelBrut * ponderation),
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
    reste_a_vivre: arrondir(resteAVivre),
  };
}

/**
 * Calcule le HCSF pour un associé spécifique
 */
function calculerHcsfPourAssocie(
  associe: AssocieData,
  mensualiteNouveauCredit: number,
  loyerMensuelBrut: number,
  config: ResolvedConfig
): AssocieHcsf {
  const alertes: string[] = [];
  const parts = associe.parts / 100;

  const quotePartMensualiteCredit = mensualiteNouveauCredit * parts;
  const revenusActiviteMensuels = associe.revenus; // Revenus déjà mensuels selon le type
  const revenusLocatifsBrutsMensuels = loyerMensuelBrut * parts;

  const revenusPonderes = calculerRevenusPonderes(
    revenusActiviteMensuels,
    revenusLocatifsBrutsMensuels,
    0, // loyersActuelsMensuels non spécifié par associé ici
    config.hcsfPonderationLocatifs
  );

  const creditsExistantsMensuels = associe.mensualites;
  const chargesFixesMensuelles = associe.charges;
  const chargesTotalesMensuelles =
    creditsExistantsMensuels + chargesFixesMensuelles + quotePartMensualiteCredit;

  const tauxEndettement = calculerTauxEndettement(revenusPonderes.total, chargesTotalesMensuelles);

  const conforme = tauxEndettement <= config.hcsfTauxMax;

  if (!conforme) {
    alertes.push(
      `${associe.nom ?? 'Associé'} : Taux d'endettement (${formatPourcent(tauxEndettement)}) > seuil HCSF (${formatPourcent(config.hcsfTauxMax)})`
    );
  } else if (tauxEndettement > config.hcsfTauxMax * 0.95) {
    // ~33%
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
 * V2-S18 : La pondération loyers est lue depuis data.options.ponderation_loyers (défaut 70)
 */
export function analyserHcsf(
  data: CalculationInput,
  financement: FinancementCalculations,
  loyerMensuelBrut: number,
  config: ResolvedConfig
): HcsfDetail {
  const mensualiteNouveauCredit = financement.mensualite_totale;
  const ponderationLoyers = (data.options as { ponderation_loyers?: number } | undefined)
    ?.ponderation_loyers;

  if (data.structure.type === 'sci_is') {
    return calculerHcsfSciIs(
      data,
      mensualiteNouveauCredit,
      loyerMensuelBrut,
      config,
      ponderationLoyers
    );
  }

  return calculerHcsfNomPropre(
    data,
    mensualiteNouveauCredit,
    loyerMensuelBrut,
    config,
    ponderationLoyers
  );
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Estime les revenus mensuels à partir du TMI
 */
function estimerRevenusDepuisTmi(tmi: number): number {
  // Valeurs heuristiques basées sur les plafonds de tranches (approximatif)
  if (tmi === 0) return 800;
  if (tmi <= 11) return 1800;
  if (tmi <= 30) return 3500;
  if (tmi <= 41) return 7000;
  return 15000;
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
