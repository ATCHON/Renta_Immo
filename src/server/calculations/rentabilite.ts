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
 * Calcule la mensualité d'un prêt (formule PMT)
 */
export function calculerMensualite(
  montant: number,
  tauxAnnuel: number,
  dureeAnnees: number
): number {
  if (montant <= 0 || dureeAnnees <= 0) return 0;
  if (tauxAnnuel === 0) return montant / (dureeAnnees * 12);

  const tauxMensuel = tauxAnnuel / 100 / 12;
  const nombreMois = dureeAnnees * 12;

  return (
    (montant * tauxMensuel * Math.pow(1 + tauxMensuel, nombreMois)) /
    (Math.pow(1 + tauxMensuel, nombreMois) - 1)
  );
}

/**
 * Calcule les détails du financement
 */
export function calculerFinancement(
  prixAchat: number,
  financement: FinancementData
): FinancementCalculations {
  const montant_emprunt = Math.max(0, prixAchat - financement.apport);

  // Mensualité du crédit (hors assurance)
  const mensualite_credit = calculerMensualite(
    montant_emprunt,
    financement.taux_interet,
    financement.duree_emprunt
  );

  // Mensualité de l'assurance emprunteur
  const mensualite_assurance = (montant_emprunt * (financement.assurance_pret / 100)) / 12;

  // Mensualité totale
  const mensualite_totale = mensualite_credit + mensualite_assurance;

  // Remboursement annuel
  const remboursement_annuel = mensualite_totale * 12;

  // Nombre de mois total
  const nombreMois = financement.duree_emprunt * 12;

  // Coût total du crédit (capital + intérêts + assurance)
  const cout_total_credit = mensualite_totale * nombreMois;

  // Coût total des intérêts uniquement
  const cout_total_interets = cout_total_credit - montant_emprunt;

  return {
    montant_emprunt: round(montant_emprunt),
    mensualite_credit: round(mensualite_credit),
    mensualite_assurance: round(mensualite_assurance),
    mensualite_totale: round(mensualite_totale),
    remboursement_annuel: round(remboursement_annuel),
    cout_total_credit: round(cout_total_credit),
    cout_total_interets: round(cout_total_interets),
  };
}

/**
 * Calcule les charges annuelles
 */
export function calculerCharges(
  exploitation: ExploitationData,
  loyerAnnuel: number
): ChargesCalculations {
  // Charges fixes (annualisées)
  const charges_fixes_annuelles =
    exploitation.charges_copro * 12 +
    exploitation.taxe_fonciere +
    exploitation.assurance_pno;

  // Charges proportionnelles au loyer (en % du loyer annuel)
  const gestion = (exploitation.gestion_locative / 100) * loyerAnnuel;
  const travaux = (exploitation.provision_travaux / 100) * loyerAnnuel;
  const vacance = (exploitation.provision_vacance / 100) * loyerAnnuel;

  const charges_proportionnelles_annuelles = gestion + travaux + vacance;

  // Total des charges
  const total_charges_annuelles = charges_fixes_annuelles + charges_proportionnelles_annuelles;

  return {
    charges_fixes_annuelles: round(charges_fixes_annuelles),
    charges_proportionnelles_annuelles: round(charges_proportionnelles_annuelles),
    total_charges_annuelles: round(total_charges_annuelles),
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
  // Revenus locatifs annuels
  const loyer_annuel = exploitation.loyer_mensuel * 12;

  // Calculs de financement
  const financementCalc = calculerFinancement(bien.prix_achat, financement);

  // Calculs de charges
  const charges = calculerCharges(exploitation, loyer_annuel);

  // Rentabilité brute = (loyer annuel / prix achat) * 100
  const rentabilite_brute = bien.prix_achat > 0
    ? (loyer_annuel / bien.prix_achat) * 100
    : 0;

  // Revenu net avant impôts = loyer - charges
  const revenu_net_avant_impots = loyer_annuel - charges.total_charges_annuelles;

  // Rentabilité nette = (revenu net / prix achat) * 100
  const rentabilite_nette = bien.prix_achat > 0
    ? (revenu_net_avant_impots / bien.prix_achat) * 100
    : 0;

  // Cash-flow = revenu net - remboursement crédit
  const cashflow_annuel = revenu_net_avant_impots - financementCalc.remboursement_annuel;
  const cashflow_mensuel = cashflow_annuel / 12;

  return {
    loyer_annuel: round(loyer_annuel),
    financement: financementCalc,
    charges,
    rentabilite_brute: round(rentabilite_brute, 2),
    rentabilite_nette: round(rentabilite_nette, 2),
    revenu_net_avant_impots: round(revenu_net_avant_impots),
    cashflow_annuel: round(cashflow_annuel),
    cashflow_mensuel: round(cashflow_mensuel),
  };
}

/**
 * Arrondit un nombre à un nombre de décimales
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
