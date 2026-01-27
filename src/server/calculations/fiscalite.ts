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

import type {
  StructureData,
  RentabiliteCalculations,
  FiscaliteCalculations,
  RegimeFiscal,
} from './types';

/**
 * Constantes fiscales réglementaires (2024)
 */
export const FISCALITE_CONSTANTES = {
  // Prélèvements sociaux (CSG-CRDS)
  PRELEVEMENTS_SOCIAUX: 0.172, // 17.2%

  // Micro-foncier
  MICRO_FONCIER_ABATTEMENT: 0.30, // 30%
  MICRO_FONCIER_PLAFOND: 15000, // 15 000€/an

  // LMNP Micro-BIC
  MICRO_BIC_ABATTEMENT: 0.50, // 50%
  MICRO_BIC_PLAFOND: 77700, // 77 700€/an

  // Impôt sur les sociétés (IS)
  IS_TAUX_REDUIT: 0.15, // 15%
  IS_TAUX_NORMAL: 0.25, // 25%
  IS_SEUIL_TAUX_REDUIT: 42500, // 42 500€

  // Amortissement SCI IS
  TAUX_AMORTISSEMENT_BATI: 0.02, // 2% par an
  PART_TERRAIN: 0.15, // 15% du prix = terrain (non amortissable)

  // Flat tax sur dividendes
  FLAT_TAX: 0.30, // 30%
} as const;

// Re-export pour compatibilité
export const PRELEVEMENTS_SOCIAUX = FISCALITE_CONSTANTES.PRELEVEMENTS_SOCIAUX;
export const TAUX_IS = {
  TAUX_REDUIT: FISCALITE_CONSTANTES.IS_TAUX_REDUIT,
  TAUX_NORMAL: FISCALITE_CONSTANTES.IS_TAUX_NORMAL,
  SEUIL: FISCALITE_CONSTANTES.IS_SEUIL_TAUX_REDUIT,
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

  // Vérification plafond
  if (revenusBruts > FISCALITE_CONSTANTES.MICRO_FONCIER_PLAFOND) {
    alertes.push(
      `Revenus (${round(revenusBruts)}€) > plafond micro-foncier (${FISCALITE_CONSTANTES.MICRO_FONCIER_PLAFOND}€). Le régime réel est obligatoire.`
    );
  }

  // Abattement 30%
  const abattement = revenusBruts * FISCALITE_CONSTANTES.MICRO_FONCIER_ABATTEMENT;
  const baseImposable = revenusBruts - abattement;

  // IR + Prélèvements sociaux
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * FISCALITE_CONSTANTES.PRELEVEMENTS_SOCIAUX;
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
  const prelevementsSociaux = baseImposable * FISCALITE_CONSTANTES.PRELEVEMENTS_SOCIAUX;
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
function calculerLmnpMicro(
  revenusBruts: number,
  tmi: number
): FiscaliteDetail {
  const alertes: string[] = [];

  // Vérification plafond
  if (revenusBruts > FISCALITE_CONSTANTES.MICRO_BIC_PLAFOND) {
    alertes.push(
      `Revenus (${round(revenusBruts)}€) > plafond micro-BIC (${FISCALITE_CONSTANTES.MICRO_BIC_PLAFOND}€). Le régime réel est obligatoire.`
    );
  }

  // Abattement 50%
  const abattement = revenusBruts * FISCALITE_CONSTANTES.MICRO_BIC_ABATTEMENT;
  const baseImposable = revenusBruts - abattement;

  // IR + Prélèvements sociaux
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * FISCALITE_CONSTANTES.PRELEVEMENTS_SOCIAUX;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - impotTotal;

  return {
    regime: `LMNP Micro-BIC (TMI ${tmi}%)`,
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
  tmi: number
): FiscaliteDetail {
  const alertes: string[] = [];

  // Amortissement simplifié (2% du bâti, bâti = 85% du prix)
  const valeurBati = prixAchat * (1 - FISCALITE_CONSTANTES.PART_TERRAIN);
  const amortissement = valeurBati * FISCALITE_CONSTANTES.TAUX_AMORTISSEMENT_BATI;

  // Base imposable = revenus - charges - amortissement
  const baseImposable = Math.max(0, revenusBruts - chargesDeductibles - amortissement);

  alertes.push(
    `Amortissement estimé : ${round(amortissement)}€/an (calcul simplifié sur 50 ans)`
  );

  // IR + Prélèvements sociaux
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * FISCALITE_CONSTANTES.PRELEVEMENTS_SOCIAUX;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - chargesDeductibles - impotTotal;

  return {
    regime: `LMNP Réel (TMI ${tmi}%)`,
    base_imposable: round(baseImposable),
    abattement: round(amortissement),
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
  const valeurBati = prixAchat * (1 - FISCALITE_CONSTANTES.PART_TERRAIN);
  const amortissementAnnuel = valeurBati * FISCALITE_CONSTANTES.TAUX_AMORTISSEMENT_BATI;

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
  if (baseImposable <= FISCALITE_CONSTANTES.IS_SEUIL_TAUX_REDUIT) {
    impotIs = baseImposable * FISCALITE_CONSTANTES.IS_TAUX_REDUIT;
  } else {
    impotIs =
      FISCALITE_CONSTANTES.IS_SEUIL_TAUX_REDUIT * FISCALITE_CONSTANTES.IS_TAUX_REDUIT +
      (baseImposable - FISCALITE_CONSTANTES.IS_SEUIL_TAUX_REDUIT) * FISCALITE_CONSTANTES.IS_TAUX_NORMAL;
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
  prixAchat: number
): FiscaliteCalculations {
  const revenusBruts = rentabilite.loyer_annuel;
  const chargesDeductibles = rentabilite.charges.total_charges_annuelles;

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
      result = calculerLmnpMicro(revenusBruts, tmi);
      break;
    case 'lmnp_reel':
      result = calculerLmnpReel(revenusBruts, chargesDeductibles, prixAchat, tmi);
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
