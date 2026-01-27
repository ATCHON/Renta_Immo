/**
 * Module de calcul de fiscalité
 * Calcule l'imposition selon le régime (IR nom propre ou IS pour SCI)
 *
 * Régimes supportés :
 * - Micro-foncier : abattement 30%, plafond 15 000€
 * - Foncier réel : charges réelles déductibles
 * - LMNP Micro-BIC : abattement 50%, plafond 77 700€
 * - LMNP Réel : charges + amortissement (simplifié)
 * - SCI IS : 15% puis 25% + amortissement
 */

import { CONSTANTS } from '@/config/constants';
import type { FiscaliteCalculations, StructureData, RentabiliteCalculations, RegimeFiscal, BienData, ExploitationData } from './types';

// Re-export pour compatibilité
export const PRELEVEMENTS_SOCIAUX = CONSTANTS.FISCALITE.PRELEVEMENTS_SOCIAUX_FONCIER;
export const TAUX_IS = {
  TAUX_REDUIT: CONSTANTS.FISCALITE.IS.TAUX_REDUIT,
  TAUX_NORMAL: CONSTANTS.FISCALITE.IS.TAUX_NORMAL,
  SEUIL: CONSTANTS.FISCALITE.IS.SEUIL_TAUX_REDUIT,
} as const;



/**
 * Détail du calcul fiscal étendu
 */
export interface FiscaliteDetail extends FiscaliteCalculations {
  /** Abattement appliqué */
  abattement: number;
  /** Alertes fiscales */
  alertes: string[];
}

/**
 * Calcule la fiscalité en régime micro-foncier
 * Abattement forfaitaire de 30% sur les revenus bruts
 */
function calculerMicroFoncier(
  revenusBruts: number,
  tmi: number
): FiscaliteDetail {
  const alertes: string[] = [];
  const { PLAFOND, ABATTEMENT } = CONSTANTS.FISCALITE.MICRO_FONCIER;

  // Vérification plafond
  if (revenusBruts > PLAFOND) {
    alertes.push(
      `Revenus (${round(revenusBruts)}€) > plafond micro-foncier (${PLAFOND}€). Le régime réel est obligatoire.`
    );
  }

  // Abattement 30%
  const abattement = revenusBruts * ABATTEMENT;
  const baseImposable = revenusBruts - abattement;

  // IR + Prélèvements sociaux
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * CONSTANTS.FISCALITE.PRELEVEMENTS_SOCIAUX_FONCIER;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - impotTotal;

  return {
    regime: `Micro-foncier (TMI ${tmi}%)`,
    base_imposable: round(baseImposable),
    abattement: round(abattement),
    impot_revenu: round(impotRevenu),
    prelevements_sociaux: round(prelevementsSociaux),
    impot_total: round(impotTotal),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

/**
 * Calcule la fiscalité en régime foncier réel
 * Déduction des charges réelles
 */
function calculerFoncierReel(
  revenusBruts: number,
  chargesDeductibles: number,
  tmi: number
): FiscaliteDetail {
  const alertes: string[] = [];

  // Calcul base imposable
  const baseImposable = Math.max(0, revenusBruts - chargesDeductibles);

  // Déficit foncier (non géré en MVP)
  if (revenusBruts < chargesDeductibles) {
    alertes.push(
      `Déficit foncier de ${round(chargesDeductibles - revenusBruts)}€ (imputable sur le revenu global jusqu'à 10 700€/an)`
    );
  }

  // IR + Prélèvements sociaux
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * CONSTANTS.FISCALITE.PRELEVEMENTS_SOCIAUX_FONCIER;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - chargesDeductibles - impotTotal;

  return {
    regime: `Foncier réel (TMI ${tmi}%)`,
    base_imposable: round(baseImposable),
    abattement: 0,
    impot_revenu: round(impotRevenu),
    prelevements_sociaux: round(prelevementsSociaux),
    impot_total: round(impotTotal),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

/**
 * Calcule la fiscalité en régime LMNP Micro-BIC
 * Abattement forfaitaire de 50% sur les revenus bruts
 */
/**
 * Calcule la fiscalité en régime LMNP Micro-BIC
 * Abattement forfaitaire de 50% ou 30% selon le type de location
 */
function calculerLmnpMicro(
  revenusBruts: number,
  tmi: number,
  type_location: string = 'meublee_longue_duree'
): FiscaliteDetail {
  const alertes: string[] = [];

  // Détermination des seuils selon le type de location
  const isNonClasse = type_location === 'meublee_tourisme_non_classe';
  const config = isNonClasse ? CONSTANTS.FISCALITE.MICRO_BIC.NON_CLASSE : CONSTANTS.FISCALITE.MICRO_BIC.STANDARD;
  const { PLAFOND, ABATTEMENT } = config;

  // Vérification plafond
  if (revenusBruts > PLAFOND) {
    alertes.push(
      `Revenus (${round(revenusBruts)}€) > plafond micro-BIC (${PLAFOND}€). Le régime réel est obligatoire.`
    );
  }

  // Abattement
  const abattement = revenusBruts * ABATTEMENT;
  const baseImposable = revenusBruts - abattement;

  // IR + Prélèvements sociaux (18.6% ou 17.2% selon contexte, ici 18.6% par précaution pour 2025)
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * CONSTANTS.FISCALITE.PRELEVEMENTS_SOCIAUX_LMNP;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - impotTotal;

  return {
    regime: `LMNP Micro-BIC (${formatPourcent(ABATTEMENT)} abattement)`,
    base_imposable: round(baseImposable),
    abattement: round(abattement),
    impot_revenu: round(impotRevenu),
    prelevements_sociaux: round(prelevementsSociaux),
    impot_total: round(impotTotal),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

/**
 * Calcule la fiscalité en régime LMNP Réel simplifié
 * Déduction des charges + amortissement estimé
 */
function calculerLmnpReel(
  revenusBruts: number,
  chargesDeductibles: number,
  prixAchat: number,
  tmi: number,
  montantTravaux: number = 0,
  valeurMobilier: number = 0
): FiscaliteDetail {
  const alertes: string[] = [];

  // Amortissement simplifié
  // 1. Immobilier
  const valeurBati = prixAchat * CONSTANTS.AMORTISSEMENT.PART_BATI;
  const amortissementImmo = valeurBati / CONSTANTS.AMORTISSEMENT.DUREE_BATI;

  // 2. Mobilier
  const amortissementMobilier = valeurMobilier / CONSTANTS.AMORTISSEMENT.DUREE_MOBILIER;

  // 3. Travaux
  const amortissementTravaux = montantTravaux / CONSTANTS.AMORTISSEMENT.DUREE_TRAVAUX;

  const amortissementTotal = amortissementImmo + amortissementMobilier + amortissementTravaux;

  // Base imposable = revenus - charges - amortissement
  // L'amortissement ne peut pas créer de déficit (sauf exceptions, ici simplifié à 0)
  const resultatAvantAmortissement = revenusBruts - chargesDeductibles;
  const amortissementDeductible = Math.min(Math.max(0, resultatAvantAmortissement), amortissementTotal);
  const baseImposable = Math.max(0, resultatAvantAmortissement - amortissementDeductible);

  if (amortissementTotal > resultatAvantAmortissement) {
    alertes.push(`Amortissement excédentaire reportable : ${round(amortissementTotal - amortissementDeductible)}€`);
  }

  alertes.push(
    `Amortissement total : ${round(amortissementTotal)}€/an`
  );

  // IR + Prélèvements sociaux
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * CONSTANTS.FISCALITE.PRELEVEMENTS_SOCIAUX_LMNP;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - chargesDeductibles - impotTotal;

  return {
    regime: `LMNP Réel (TMI ${tmi}%)`,
    base_imposable: round(baseImposable),
    abattement: round(amortissementDeductible),
    impot_revenu: round(impotRevenu),
    prelevements_sociaux: round(prelevementsSociaux),
    impot_total: round(impotTotal),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

/**
 * Calcule l'impôt pour le régime SCI à l'IS
 * IS : 15% jusqu'à 42 500 €, 25% au-delà
 * Possibilité d'amortissement du bien (2% par an)
 */
function calculerFiscaliteSciIs(
  revenuNetAvantImpots: number,
  prixAchat: number
): FiscaliteDetail {
  const alertes: string[] = [];

  // Amortissement annuel (2% de la valeur du bâti)
  const valeurBati = prixAchat * CONSTANTS.AMORTISSEMENT.PART_BATI;
  // TODO: Prendre en compte autres amortissements si SCI IS enrichie
  const amortissementAnnuel = valeurBati / CONSTANTS.AMORTISSEMENT.DUREE_BATI;

  // Base imposable = revenu net - amortissement
  const baseImposable = Math.max(0, revenuNetAvantImpots - amortissementAnnuel);

  // Alerte si amortissement > résultat
  if (amortissementAnnuel > revenuNetAvantImpots) {
    alertes.push(
      `Amortissement (${round(amortissementAnnuel)}€) > résultat. Déficit reportable.`
    );
  }

  // Calcul IS progressif
  let impotIs: number;
  const { SEUIL_TAUX_REDUIT, TAUX_REDUIT, TAUX_NORMAL } = CONSTANTS.FISCALITE.IS;

  if (baseImposable <= SEUIL_TAUX_REDUIT) {
    impotIs = baseImposable * TAUX_REDUIT;
  } else {
    impotIs =
      SEUIL_TAUX_REDUIT * TAUX_REDUIT +
      (baseImposable - SEUIL_TAUX_REDUIT) * TAUX_NORMAL;
  }

  // Pas de prélèvements sociaux au niveau de la SCI
  const prelevementsSociaux = 0;

  // Résultat net après IS
  const revenuNetApresImpot = revenuNetAvantImpots - impotIs;

  return {
    regime: 'SCI à l\'IS',
    base_imposable: round(baseImposable),
    abattement: round(amortissementAnnuel),
    impot_revenu: round(impotIs),
    prelevements_sociaux: round(prelevementsSociaux),
    impot_total: round(impotIs),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

/**
 * Calcule la fiscalité selon la structure et le régime choisi
 */
export function calculerFiscalite(
  structure: StructureData,
  rentabilite: RentabiliteCalculations,
  bien: BienData,
  exploitation: ExploitationData
): FiscaliteCalculations {
  const revenusBruts = rentabilite.loyer_annuel;
  const chargesDeductibles = rentabilite.charges.total_charges_annuelles;
  const prixAchat = bien.prix_achat;

  // SCI à l'IS
  if (structure.type === 'sci_is') {
    const result = calculerFiscaliteSciIs(
      rentabilite.revenu_net_avant_impots,
      prixAchat
    );
    result.rentabilite_nette_nette = prixAchat > 0
      ? (result.revenu_net_apres_impot / prixAchat) * 100
      : 0;
    return result;
  }

  // Nom propre - selon le régime fiscal
  const regime: RegimeFiscal = structure.regime_fiscal ?? 'micro_foncier';
  const tmi = structure.tmi ?? 30;

  let result: FiscaliteDetail;

  switch (regime) {
    case 'micro_foncier':
      result = calculerMicroFoncier(revenusBruts, tmi);
      break;
    case 'reel':
      result = calculerFoncierReel(revenusBruts, chargesDeductibles, tmi);
      break;
    case 'lmnp_micro':
      result = calculerLmnpMicro(revenusBruts, tmi, exploitation.type_location);
      break;
    case 'lmnp_reel':
      result = calculerLmnpReel(
        revenusBruts,
        chargesDeductibles,
        prixAchat,
        tmi,
        bien.montant_travaux,
        bien.valeur_mobilier
      );
      break;
    default:
      result = calculerMicroFoncier(revenusBruts, tmi);
  }

  // Calcul rentabilité nette-nette
  result.rentabilite_nette_nette = prixAchat > 0
    ? (result.revenu_net_apres_impot / prixAchat) * 100
    : 0;

  return result;
}

/**
 * Arrondit un nombre à un nombre de décimales
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Formate un nombre en pourcentage
 */
function formatPourcent(valeur: number): string {
  return `${Math.round(valeur * 100)}%`;
}
