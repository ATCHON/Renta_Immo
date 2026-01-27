/**
 * Module de calcul de fiscalité
 * Calcule l'imposition selon le régime (IR nom propre ou IS pour SCI)
 */

import type {
  StructureData,
  RentabiliteCalculations,
  FiscaliteCalculations,
} from './types';
import { PRELEVEMENTS_SOCIAUX, TAUX_IS } from './types';

/**
 * Constantes fiscales 2024
 */
const CONSTANTES = {
  MICRO_FONCIER_PLAFOND: 15000,
  MICRO_FONCIER_ABATTEMENT: 0.30,
  MICRO_BIC_PLAFOND: 77700,
  MICRO_BIC_ABATTEMENT: 0.50,
  SCI_IS_AMORTISSEMENT_BATI_PART: 0.80, // 80% du prix est amortissable
  SCI_IS_TAUX_AMORTISSEMENT: 0.02,     // 2% par an
} as const;

/**
 * Calcule l'impôt pour le régime nom propre (IR)
 */
function calculerFiscaliteNomPropre(
  revenuNetAvantImpots: number,
  loyerBrutAnnuel: number,
  structure: StructureData,
  prixAchat: number
): FiscaliteCalculations {
  const alertes: string[] = [];
  const tmi = structure.tmi;
  const regime = structure.regime_fiscal || 'micro_foncier';
  
  let baseImposable: number = 0; // Initialiser à 0
  let abattement: number = 0;
  let label_regime: string;

  switch (regime) {
    case 'micro_foncier':
      if (loyerBrutAnnuel > CONSTANTES.MICRO_FONCIER_PLAFOND) {
        alertes.push(`Plafond Micro-foncier dépassé (${loyerBrutAnnuel}€ > ${CONSTANTES.MICRO_FONCIER_PLAFOND}€). Passage au régime Réel conseillé.`);
      }
      baseImposable = loyerBrutAnnuel * (1 - CONSTANTES.MICRO_FONCIER_ABATTEMENT);
      label_regime = 'Micro-foncier (Abattement 30%)';
      break;

    case 'lmnp_micro':
      if (loyerBrutAnnuel > CONSTANTES.MICRO_BIC_PLAFOND) {
        alertes.push(`Plafond Micro-BIC dépassé (${loyerBrutAnnuel}€ > ${CONSTANTES.MICRO_BIC_PLAFOND}€). Passage au régime Réel conseillé.`);
      }
      baseImposable = loyerBrutAnnuel * (1 - CONSTANTES.MICRO_BIC_ABATTEMENT);
      label_regime = 'LMNP Micro-BIC (Abattement 50%)';
      break;

    case 'lmnp_reel':
      // Simplification MVP : on amortit comme en SCI mais on reste à l'IR
      const amortissement = prixAchat * CONSTANTES.SCI_IS_AMORTISSEMENT_BATI_PART * CONSTANTES.SCI_IS_TAUX_AMORTISSEMENT;
      baseImposable = Math.max(0, revenusBruts - chargesDeductibles);
      label_regime = 'LMNP Réel (avec amortissement)';
      break;

    case 'reel':
    default:
      baseImposable = Math.max(0, revenusBruts - chargesDeductibles);
      label_regime = 'Foncier Réel';
      break;
  }

  const tauxTmi = tmi; // tmi est déjà un taux (ex: 0.30)
  const impotRevenu = baseImposable * tauxTmi;

  // Calcul Prélèvements Sociaux (sur base imposable)
  const prelevementsSociaux = baseImposable * PRELEVEMENTS_SOCIAUX;

  // Total impôt
  const impotTotal = impotRevenu + prelevementsSociaux;

  // Revenu net après impôt
  const revenuNetApresImpot = revenuNetAvantImpots - impotTotal;

  // Rentabilité nette-nette
  const rentabilite_nette_nette = prixAchat > 0
    ? (revenuNetApresImpot / prixAchat) * 100
    : 0;

  return {
    regime: `${label_regime} - TMI ${tmi}%`,
    base_imposable: round(baseImposable),
    impot_revenu: round(impotRevenu),
    prelevements_sociaux: round(prelevementsSociaux),
    impot_total: round(impotTotal),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: round(rentabilite_nette_nette, 2),
    alertes
  };
}

/**
 * Calcule l'impôt pour le régime SCI à l'IS
 */
function calculerFiscaliteSciIs(
  revenuNetAvantImpots: number,
  prixAchat: number
): FiscaliteCalculations {
  const alertes: string[] = [];
  
  // Amortissement annuel (2% de la valeur du bien, hors terrain ~20%)
  const valeur_amortissable = prixAchat * CONSTANTES.SCI_IS_AMORTISSEMENT_BATI_PART;
  const amortissement_annuel = valeur_amortissable * CONSTANTES.SCI_IS_TAUX_AMORTISSEMENT;

  // Base imposable = revenu net - amortissement
  const base_imposable = Math.max(0, revenuNetAvantImpots - amortissement_annuel);

  // Calcul IS progressif
  let impot_is: number;
  if (base_imposable <= TAUX_IS.SEUIL) {
    impot_is = base_imposable * TAUX_IS.TAUX_REDUIT;
  } else {
    impot_is =
      TAUX_IS.SEUIL * TAUX_IS.TAUX_REDUIT +
      (base_imposable - TAUX_IS.SEUIL) * TAUX_IS.TAUX_NORMAL;
  }

  // Impôt total = IS
  const impot_total = impot_is;

  // Résultat net après IS (dans la SCI)
  const revenu_net_apres_impot = revenuNetAvantImpots - impot_total;

  // Rentabilité nette-nette
  const rentabilite_nette_nette = prixAchat > 0
    ? (revenu_net_apres_impot / prixAchat) * 100
    : 0;

  if (amortissement_annuel > revenuNetAvantImpots) {
    alertes.push(`Déficit fiscal créé par l'amortissement (${round(amortissement_annuel)}€). Aucun impôt à payer cette année.`);
  }

  return {
    base_imposable: round(base_imposable),
    impot_revenu: round(impot_is),
    prelevements_sociaux: 0, // Pas de PS sur IS
    impot_total: round(impot_total),
    revenu_net_apres_impot: round(revenu_net_apres_impot),
    rentabilite_nette_nette: round(rentabilite_nette_nette, 2),
    alertes
  };
}

/**
 * Calcule la fiscalité selon la structure choisie
 */
export function calculerFiscalite(
  structure: StructureData,
  rentabilite: RentabiliteCalculations,
  prixAchat: number
): FiscaliteCalculations {
  if (structure.type === 'sci_is') {
    return calculerFiscaliteSciIs(
      rentabilite.revenu_net_avant_impots,
      prixAchat
    );
  }

  return calculerFiscaliteNomPropre(
    rentabilite.revenu_net_avant_impots,
    rentabilite.loyer_annuel,
    structure,
    prixAchat
  );
}

/**
 * Arrondit un nombre à un nombre de décimales
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

