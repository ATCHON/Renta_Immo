/**
 * Module de calcul de rentabilité
 * Calcule les mensualités, charges et indicateurs de rentabilité
 */

import type {
  BienData,
  FinancementData,
  ExploitationData,
  FinancementCalculations,
  ChargesCalculations,
  RentabiliteCalculations,
} from './types';

/**
 * Détail d'une mensualité
 */
export interface MensualiteDetail {
  mensualite_credit: number;
  mensualite_assurance: number;
  mensualite_totale: number;
}

/**
 * Calcule la mensualité d'un prêt immobilier (formule PMT)
 * 
 * @param montant - Capital emprunté
 * @param tauxAnnuel - Taux d'intérêt annuel (en %, ex: 3.5)
 * @param dureeAnnees - Durée en années
 * @param tauxAssurance - Taux d'assurance annuel (en %, ex: 0.3)
 * @returns Détail de la mensualité
 * 
 * @example
 * calculerMensualite(200000, 3.5, 20, 0.3)
 */
export function calculerMensualite(
  montant: number,
  tauxAnnuel: number,
  dureeAnnees: number,
  tauxAssurance: number = 0
): MensualiteDetail {
  if (montant <= 0 || dureeAnnees <= 0) {
    return { mensualite_credit: 0, mensualite_assurance: 0, mensualite_totale: 0 };
  }

  const nombreMois = dureeAnnees * 12;
  let mensualiteCredit: number;

  if (tauxAnnuel === 0) {
    mensualiteCredit = montant / nombreMois;
  } else {
    const tauxMensuel = tauxAnnuel / 100 / 12;
    mensualiteCredit =
      (montant * tauxMensuel * Math.pow(1 + tauxMensuel, nombreMois)) /
      (Math.pow(1 + tauxMensuel, nombreMois) - 1);
  }

  const mensualiteAssurance = (montant * (tauxAssurance / 100)) / 12;

  return {
    mensualite_credit: round(mensualiteCredit),
    mensualite_assurance: round(mensualiteAssurance),
    mensualite_totale: round(mensualiteCredit + mensualiteAssurance),
  };
}

/**
 * Calcule les détails du financement
 */
export function calculerFinancement(
  prixAchat: number,
  financement: FinancementData
): FinancementCalculations {
  const montant_emprunt = Math.max(0, prixAchat - financement.apport);

  const detailMensualite = calculerMensualite(
    montant_emprunt,
    financement.taux_interet,
    financement.duree_emprunt,
    financement.assurance_pret
  );

  const nombreMois = financement.duree_emprunt * 12;
  const cout_total_credit = detailMensualite.mensualite_totale * nombreMois;
  const cout_total_interets = cout_total_credit - montant_emprunt - (detailMensualite.mensualite_assurance * nombreMois);

  return {
    montant_emprunt: round(montant_emprunt),
    mensualite_credit: detailMensualite.mensualite_credit,
    mensualite_assurance: detailMensualite.mensualite_assurance,
    mensualite_totale: detailMensualite.mensualite_totale,
    remboursement_annuel: round(detailMensualite.mensualite_totale * 12),
    cout_total_credit: round(cout_total_credit),
    cout_total_interets: round(cout_total_interets),
  };
}

/**
 * Calcule les charges annuelles totales
 * 
 * @param exploitation - Données d'exploitation
 * @param loyerAnnuel - Loyer annuel brut
 * @returns Détail des charges
 */
export function calculerChargesAnnuelles(
  exploitation: ExploitationData,
  loyerAnnuel: number
): ChargesCalculations {
  // Charges fixes
  const charges_fixes_annuelles =
    exploitation.charges_copro * 12 +
    exploitation.taxe_fonciere +
    exploitation.assurance_pno;

  // Charges proportionnelles (en % du loyer annuel)
  const gestion = (exploitation.gestion_locative / 100) * loyerAnnuel;
  const travaux = (exploitation.provision_travaux / 100) * loyerAnnuel;
  const vacance = (exploitation.provision_vacance / 100) * loyerAnnuel;

  const charges_proportionnelles_annuelles = gestion + travaux + vacance;

  return {
    charges_fixes_annuelles: round(charges_fixes_annuelles),
    charges_proportionnelles_annuelles: round(charges_proportionnelles_annuelles),
    total_charges_annuelles: round(charges_fixes_annuelles + charges_proportionnelles_annuelles),
  };
}

/**
 * Calcule tous les indicateurs de rentabilité
 */
export function calculerRentabilite(
  bien: BienData,
  financement: FinancementData,
  exploitation: ExploitationData
): RentabiliteCalculations {
  const loyer_annuel = exploitation.loyer_mensuel * 12;
  const financementCalc = calculerFinancement(bien.prix_achat, financement);
  const charges = calculerChargesAnnuelles(exploitation, loyer_annuel);

  const rentabilite_brute = bien.prix_achat > 0
    ? (loyer_annuel / bien.prix_achat) * 100
    : 0;

  const revenu_net_avant_impots = loyer_annuel - charges.total_charges_annuelles;

  const rentabilite_nette = bien.prix_achat > 0
    ? (revenu_net_avant_impots / bien.prix_achat) * 100
    : 0;

  const cashflow_annuel = revenu_net_avant_impots - financementCalc.remboursement_annuel;

  return {
    loyer_annuel: round(loyer_annuel),
    financement: financementCalc,
    charges,
    rentabilite_brute: round(rentabilite_brute, 2),
    rentabilite_nette: round(rentabilite_nette, 2),
    revenu_net_avant_impots: round(revenu_net_avant_impots),
    cashflow_annuel: round(cashflow_annuel),
    cashflow_mensuel: round(cashflow_annuel / 12),
  };
}

/**
 * Arrondit un nombre à un nombre de décimales
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

