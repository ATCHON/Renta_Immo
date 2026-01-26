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
 * Calcule l'impôt pour le régime nom propre (IR)
 * Revenu foncier : TMI + prélèvements sociaux sur le revenu net
 */
function calculerFiscaliteNomPropre(
  revenuNetAvantImpots: number,
  tmi: number,
  prixAchat: number
): FiscaliteCalculations {
  // Base imposable = revenu net (simplification : pas d'abattement micro-foncier ici)
  const base_imposable = Math.max(0, revenuNetAvantImpots);

  // Impôt sur le revenu (TMI)
  const taux_tmi = tmi / 100;
  const impot_revenu = base_imposable * taux_tmi;

  // Prélèvements sociaux (17.2%)
  const prelevements_sociaux = base_imposable * PRELEVEMENTS_SOCIAUX;

  // Impôt total
  const impot_total = impot_revenu + prelevements_sociaux;

  // Revenu net après impôt
  const revenu_net_apres_impot = revenuNetAvantImpots - impot_total;

  // Rentabilité nette-nette (après impôts)
  const rentabilite_nette_nette = prixAchat > 0
    ? (revenu_net_apres_impot / prixAchat) * 100
    : 0;

  return {
    regime: `Nom propre (IR - TMI ${tmi}%)`,
    base_imposable: round(base_imposable),
    impot_revenu: round(impot_revenu),
    prelevements_sociaux: round(prelevements_sociaux),
    impot_total: round(impot_total),
    revenu_net_apres_impot: round(revenu_net_apres_impot),
    rentabilite_nette_nette: round(rentabilite_nette_nette, 2),
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
): FiscaliteCalculations {
  // Amortissement annuel (2% de la valeur du bien, hors terrain ~20%)
  const valeur_amortissable = prixAchat * 0.80; // 80% du prix (hors terrain)
  const amortissement_annuel = valeur_amortissable * 0.02; // 2% par an

  // Base imposable = revenu net - amortissement
  const base_imposable = Math.max(0, revenuNetAvantImpots - amortissement_annuel);

  // Calcul IS progressif
  let impot_is: number;
  if (base_imposable <= TAUX_IS.SEUIL) {
    // Tout au taux réduit de 15%
    impot_is = base_imposable * TAUX_IS.TAUX_REDUIT;
  } else {
    // 15% jusqu'à 42 500 € + 25% au-delà
    impot_is =
      TAUX_IS.SEUIL * TAUX_IS.TAUX_REDUIT +
      (base_imposable - TAUX_IS.SEUIL) * TAUX_IS.TAUX_NORMAL;
  }

  // Pas de prélèvements sociaux au niveau de la SCI (seulement sur dividendes)
  const prelevements_sociaux = 0;

  // Impôt total = IS
  const impot_total = impot_is;

  // Résultat net après IS (dans la SCI)
  const revenu_net_apres_impot = revenuNetAvantImpots - impot_total;

  // Rentabilité nette-nette
  const rentabilite_nette_nette = prixAchat > 0
    ? (revenu_net_apres_impot / prixAchat) * 100
    : 0;

  return {
    regime: 'SCI à l\'IS',
    base_imposable: round(base_imposable),
    impot_revenu: round(impot_is),
    prelevements_sociaux: round(prelevements_sociaux),
    impot_total: round(impot_total),
    revenu_net_apres_impot: round(revenu_net_apres_impot),
    rentabilite_nette_nette: round(rentabilite_nette_nette, 2),
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
    structure.tmi,
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
