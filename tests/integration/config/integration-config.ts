import type { ResolvedConfig } from '@/server/config/config-types';

/**
 * Configuration de référence pour les tests d'intégration.
 * Snapshot des valeurs en base de données (annee_fiscale: 2026).
 * Dernière synchronisation : 2026-02-23
 *
 * Pour resynchroniser depuis la DB :
 * SELECT bloc, cle, valeur FROM config_params
 * WHERE annee_fiscale = 2026 ORDER BY bloc, cle;
 */
export const integrationConfig: ResolvedConfig = {
  anneeFiscale: 2026,
  // --- Fiscalité ---
  tauxPsFoncier: 0.172, // TAUX_PS_FONCIER — revenus fonciers et PV immobilières
  tauxPsRevenusBicLmnp: 0.186, // TAUX_PS_REVENUS_BIC_LMNP — LFSS 2026 (+1,4 pt CSG patrimoine)
  microFoncierAbattement: 0.3, // MICRO_FONCIER_ABATTEMENT — CGI Art.32
  microFoncierPlafond: 15000, // MICRO_FONCIER_PLAFOND — CGI Art.32
  microBicMeubleLongueDureeAbattement: 0.5, // CGI Art.50-0 — BIC classique
  microBicMeubleLongueDureePlafond: 77700, // CGI Art.50-0
  microBicTourismeClasseAbattement: 0.71, // CGI Art.50-0 (LF 2024) — tourisme classé
  microBicTourismeClassePlafond: 188700, // CGI Art.50-0 (LF 2024)
  microBicTourismeNonClasseAbattement: 0.3, // CGI Art.50-0 (LF 2024)
  microBicTourismeNonClassePlafond: 15000, // CGI Art.50-0 (LF 2024)
  isTauxReduit: 0.15, // IS_TAUX_REDUIT — CGI Art.219 (LF 2023)
  isTauxNormal: 0.25, // IS_TAUX_NORMAL — CGI Art.219
  isSeuilTauxReduit: 42500, // IS_SEUIL_TAUX_REDUIT — CGI Art.219 (LF 2023)
  flatTax: 0.3, // FLAT_TAX — CGI Art.200A (PFU)
  // --- Déficit Foncier ---
  deficitFoncierPlafondImputation: 10700, // CGI Art.156 I-3°
  deficitFoncierPlafondEnergie: 21400, // CGI Art.156 (LF 2023, période 2023-2025)
  deficitFoncierDureeReport: 10, // 10 ans — CGI Art.156 I-3°
  // --- Plus-Value ---
  plusValueTauxIr: 0.19, // CGI Art.150VC
  plusValueTauxPs: 0.172, // CGI Art.150VC — 17,2% (pas 18,6%)
  plusValueForfaitFraisAcquisition: 0.075, // BOFiP — forfait légal
  plusValueForfaitTravauxPv: 0.15, // BOFiP — si détention > 5 ans
  plusValueSeuilSurtaxe: 50000, // CGI Art.1609 nonies G
  // --- HCSF ---
  hcsfTauxMax: 0.35, // Décision HCSF 2024
  hcsfDureeMaxAnnees: 25, // Décision HCSF 2024
  hcsfPonderationLocatifs: 0.7, // 70% des loyers comptabilisés
  hcsfTauxReferenceCapacite: 0.035, // Paramètre interne REC-02
  hcsfDureeCapaciteResiduelleAnnees: 20, // Paramètre interne REC-02
  hcsfDureeMaxAnneesVefa: 27, // REC-04 : dérogation VEFA — Décision HCSF 2024
  // --- DPE ---
  decoteDpeFg: 0.15, // Loi Climat-Résilience L.2021-1104
  decoteDpeE: 0.05, // Loi Climat-Résilience L.2021-1104
  // --- LMP / Scoring ---
  lmpSeuilAlerte: 20000, // Paramètre interne
  lmpSeuilLmp: 23000, // CGI Art.155 IV — seuil statut LMP
  resteAVivreSeuilMin: 1000, // Pratique bancaire / Décision HCSF
  resteAVivreSeuilConfort: 2500, // Paramètre interne
  // --- Charges / Défauts ---
  defaultsAssurancePno: 150,
  defaultsChargesCoproM2: 30,
  defaultsTaxeFoncieresMois: 0.1,
  defaultsFraisDossierBanque: 500,
  defaultsFraisGarantieCredit: 0.012,
  defaultsComptableLmnp: 400,
  defaultsCfeMin: 150,
  cfeSeuilExoneration: 5000,
  fraisReventeTauxAgenceDefaut: 0.05,
  fraisReventeDiagnostics: 500,
  notaireTauxAncien: 0.08,
  notaireTauxNeuf: 0.025,
  notaireDmtoTauxStandard: 0.0580665, // Décret 2016-230
  notaireCsiTaux: 0.001,
  notaireDeboursForfait: 800,
  // --- Projections ---
  projectionInflationLoyer: 0.015,
  projectionInflationCharges: 0.02,
  projectionRevalorisation: 0.01,
  projectionDecoteDpeFg: 0.15,
  projectionDecoteDpeE: 0.05,
};
