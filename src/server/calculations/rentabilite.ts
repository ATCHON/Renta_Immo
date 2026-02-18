import { ResolvedConfig } from '../config/config-types';
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
 * @ref docs/core/specification-calculs.md#24-mensualité-du-crédit-formule-pmt
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

  // AUDIT-109 : Pour le résumé mensualité (An 1 / HCSF), on retourne
  // l'assurance sur capital initial (= max), ce qui est conservateur.
  // La différence CRD se matérialise dans le tableau d'amortissement.
  const mensualiteAssurance = (montant * (tauxAssurance / 100)) / 12;

  return {
    mensualite_credit: round(mensualiteCredit),
    mensualite_assurance: round(mensualiteAssurance),
    mensualite_totale: round(mensualiteCredit + mensualiteAssurance),
  };
}

/**
 * Calcule les émoluments proportionnels du notaire (barème Décret 2016-230, révisé 01/01/2021)
 * Les tranches sont appliquées sur la base taxable, puis la TVA (20 %) est ajoutée.
 */
function calculerEmolumentsProportionnels(base: number): number {
  const BAREME = [
    { max: 6500, taux: 0.0387 },
    { max: 17000, taux: 0.01596 },
    { max: 60000, taux: 0.01064 },
    { max: Infinity, taux: 0.00799 },
  ];
  let emoluments = 0;
  let precedent = 0;
  for (const tranche of BAREME) {
    const montantDansTranche = Math.max(0, Math.min(base, tranche.max) - precedent);
    emoluments += montantDansTranche * tranche.taux;
    precedent = tranche.max;
    if (base <= tranche.max) break;
  }
  return emoluments * 1.2; // TVA 20 %
}

/**
 * Calcule les frais de notaire par tranches réelles (REC-01)
 *
 * Composants : émoluments proportionnels + TVA, DMTO, CSI, débours forfaitaires.
 * @ref Décret 2016-230, CGI Art. 1594 F quinquies, CGI Art. 879
 * @param baseTaxable - Prix d'achat hors mobilier
 * @param etatBien - 'ancien' (DMTO standard) ou 'neuf' (DMTO réduit)
 */
export function calculerFraisNotairePrecis(
  baseTaxable: number,
  etatBien: 'ancien' | 'neuf' = 'ancien',
  config: ResolvedConfig
): number {
  if (baseTaxable <= 0) return 0;

  const emoluments = calculerEmolumentsProportionnels(baseTaxable);
  const dmto =
    etatBien === 'neuf' ? baseTaxable * 0.00715 : baseTaxable * config.notaireDmtoTauxStandard;
  const csi = baseTaxable * config.notaireCsiTaux;
  const debours = config.notaireDeboursForfait;
  return round(emoluments + dmto + csi + debours);
}

/**
 * Calcule les détails du financement
 */
export function calculerFinancement(
  bien: BienData,
  financement: FinancementData,
  config: ResolvedConfig
): FinancementCalculations {
  const prixAchat = bien.prix_achat;
  const valeurMobilier = bien.valeur_mobilier || 0;

  // L'assiette des frais de notaire exclut le mobilier
  const baseTaxableNotaire = Math.max(0, prixAchat - valeurMobilier);
  const fraisNotaire = calculerFraisNotairePrecis(baseTaxableNotaire, bien.etat_bien, config);

  const montantTravaux = bien.montant_travaux || 0;
  const fraisBanque = (financement.frais_dossier || 0) + (financement.frais_garantie || 0);

  const coutTotalAcquisition = prixAchat + fraisNotaire + montantTravaux + fraisBanque;
  const montant_emprunt = Math.max(0, coutTotalAcquisition - financement.apport);

  const detailMensualite = calculerMensualite(
    montant_emprunt,
    financement.taux_interet,
    financement.duree_emprunt,
    financement.assurance_pret
  );

  const nombreMois = financement.duree_emprunt * 12;
  const cout_total_credit = detailMensualite.mensualite_totale * nombreMois;
  const cout_total_interets =
    cout_total_credit - montant_emprunt - detailMensualite.mensualite_assurance * nombreMois;

  return {
    montant_emprunt: round(montant_emprunt),
    mensualite_credit: detailMensualite.mensualite_credit,
    mensualite_assurance: detailMensualite.mensualite_assurance,
    mensualite_totale: detailMensualite.mensualite_totale,
    remboursement_annuel: round(detailMensualite.mensualite_totale * 12),
    cout_total_credit: round(cout_total_credit),
    cout_total_interets: round(cout_total_interets),
    cout_total_acquisition: round(coutTotalAcquisition),
    taux_interet: financement.taux_interet,
    frais_notaire: round(fraisNotaire),
  };
}

/**
 * Calcule le coût total d'acquisition
 *
 * @ref docs/core/specification-calculs.md#22-coût-total-dacquisition-nouveau
 * @param exploitation - Données d'exploitation
 * @param loyerAnnuel - Loyer annuel brut
 * @returns Détail des charges
 */
export function calculerChargesAnnuelles(
  exploitation: ExploitationData,
  loyerAnnuel: number,
  tauxOccupation: number | undefined,
  config: ResolvedConfig
): ChargesCalculations {
  // Charges fixes (on soustrait la part récupérable sur le locataire)
  const chargesCoproProprietaire = Math.max(
    0,
    exploitation.charges_copro - (exploitation.charges_copro_recuperables || 0)
  );

  const charges_fixes_annuelles =
    chargesCoproProprietaire +
    exploitation.taxe_fonciere +
    exploitation.assurance_pno +
    (exploitation.assurance_gli || 0) +
    // V2-S10 : CFE exonérée selon seuil config
    (loyerAnnuel < config.cfeSeuilExoneration ? 0 : exploitation.cfe_estimee || 0) +
    (exploitation.comptable_annuel || 0);

  // Charges proportionnelles (en % du loyer annuel)
  const gestion = (exploitation.gestion_locative / 100) * loyerAnnuel;
  const travaux = (exploitation.provision_travaux / 100) * loyerAnnuel;
  // Si un taux d'occupation est défini (même 100%), il module déjà les revenus bruts (donc la vacance est gérée en amont).
  // On ne compte la charge "provision vacance" QUE si aucun taux d'occupation n'est défini.
  const vacance =
    tauxOccupation !== undefined ? 0 : (exploitation.provision_vacance / 100) * loyerAnnuel;

  const charges_proportionnelles_annuelles = gestion + travaux + vacance;

  return {
    charges_fixes_annuelles: round(charges_fixes_annuelles),
    charges_proportionnelles_annuelles: round(charges_proportionnelles_annuelles),
    total_charges_annuelles: round(charges_fixes_annuelles + charges_proportionnelles_annuelles),
  };
}

/**
 * Orchestrateur de tous les calculs de rentabilité
 *
 * @ref docs/core/specification-calculs.md#4-calculs-de-rentabilité
 * @param bien - Données du bien
 * @param financement - Données de financement
 * @param exploitation - Données d'exploitation
 * @param config - Configuration résolue
 */
export function calculerRentabilite(
  bien: BienData,
  financement: FinancementData,
  exploitation: ExploitationData,
  config: ResolvedConfig
): RentabiliteCalculations {
  const tauxOccupation = exploitation.taux_occupation ?? 1;
  const loyer_annuel = exploitation.loyer_mensuel * 12 * tauxOccupation;
  // Loyer facial (sans pondération par taux d'occupation) — convention marché pour la rentabilité brute
  const loyer_annuel_facade = exploitation.loyer_mensuel * 12;
  const financementCalc = calculerFinancement(bien, financement, config);
  // On passe le taux d'occupation BRUT (peut être undefined) pour savoir si on doit annuler la provision vacance
  const charges = calculerChargesAnnuelles(
    exploitation,
    loyer_annuel,
    exploitation.taux_occupation,
    config
  );

  // Rentabilité brute sur loyer facial (convention marché, sans déduire la vacance)
  const rentabilite_brute = bien.prix_achat > 0 ? (loyer_annuel_facade / bien.prix_achat) * 100 : 0;

  const revenu_net_avant_impots = loyer_annuel - charges.total_charges_annuelles;

  // Correction Audit : Rentabilité nette calculée sur COÛT TOTAL ACQUISITION
  const coutTotal = financementCalc.cout_total_acquisition || bien.prix_achat * 1.08; // Fallback sécu

  const rentabilite_nette = coutTotal > 0 ? (revenu_net_avant_impots / coutTotal) * 100 : 0;

  const cashflow_annuel = revenu_net_avant_impots - financementCalc.remboursement_annuel;
  const cashflow_mensuel = cashflow_annuel / 12;
  const effort_epargne_mensuel = cashflow_mensuel < 0 ? Math.abs(cashflow_mensuel) : 0;

  // Effet de levier = (Rentabilité nette - Taux crédit) * (Emprunt / Fonds propres)
  const tauxCredit = financement.taux_interet + (financement.assurance_pret || 0);
  const effet_levier =
    financement.apport > 0
      ? (rentabilite_nette - tauxCredit) * (financementCalc.montant_emprunt / financement.apport)
      : null;

  return {
    loyer_annuel: round(loyer_annuel),
    financement: financementCalc,
    charges,
    rentabilite_brute: round(rentabilite_brute, 2),
    rentabilite_nette: round(rentabilite_nette, 2),
    revenu_net_avant_impots: round(revenu_net_avant_impots),
    cashflow_annuel: round(cashflow_annuel),
    cashflow_mensuel: round(cashflow_mensuel),
    effort_epargne_mensuel: round(effort_epargne_mensuel),
    effet_levier: effet_levier !== null ? round(effet_levier, 2) : null,
  };
}

/**
 * Arrondit un nombre à un nombre de décimales
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
