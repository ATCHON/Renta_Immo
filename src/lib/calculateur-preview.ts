/**
 * UX-BE01 — Moteur de calcul partiel côté client (Verdant Simulator)
 *
 * Module pur TypeScript — aucune dépendance serveur (ne pas importer depuis `src/server/`).
 * Fournit des approximations rapides pour la sidebar « Results Anchor » en temps réel.
 *
 * Distinction avec le calcul serveur :
 * - Module client → approximations → affichage `~4,2 %` (TAEG approx)
 * - API serveur   → résultats exacts → affichage `4,32 %` (TAEG exact)
 */

import type { BienData, FinancementData, ExploitationData, PreviewKPIs } from '@/types/calculateur';

/**
 * Calcule la mensualité d'un crédit (formule PMT standard).
 *
 * @param tauxMensuel - Taux d'intérêt mensuel (ex: 0.001 pour 1.2%/an)
 * @param nMois       - Nombre de mensualités
 * @param montant     - Montant emprunté
 * @returns Mensualité en euros
 */
function pmt(tauxMensuel: number, nMois: number, montant: number): number {
  if (tauxMensuel === 0) return montant / nMois;
  const facteur = Math.pow(1 + tauxMensuel, nMois);
  return (montant * tauxMensuel * facteur) / (facteur - 1);
}

/**
 * Calcule les KPIs de preview pour la sidebar Results Anchor.
 *
 * Les données d'entrée sont partielles (l'utilisateur est en cours de saisie).
 * Retourne `null` pour les KPIs non calculables plutôt que de crasher.
 *
 * Note : `ExploitationData` contient à la fois les revenus locatifs et les charges
 * (pas de type `ChargesData` séparé dans le modèle de données actuel).
 *
 * @param bien        - Données partielles du bien
 * @param financement - Données partielles du financement
 * @param exploitation - Données partielles de l'exploitation (revenus + charges)
 * @returns PreviewKPIs avec discriminant `isPartiel: true`
 */
export function computePreviewKPIs(
  bien: Partial<BienData>,
  financement: Partial<FinancementData>,
  exploitation: Partial<ExploitationData>
): PreviewKPIs {
  // ── Bien ──────────────────────────────────────────────────────────────────
  const prixAchat = bien.prix_achat ?? null;
  const travaux = bien.montant_travaux ?? 0;
  // Frais de notaire : 8% du prix d'achat (approximation, en l'absence de calcul exact)
  const fraisNotaireEstimes = prixAchat ? prixAchat * 0.08 : 0;
  const investissementTotal =
    prixAchat !== null && prixAchat > 0 ? prixAchat + travaux + fraisNotaireEstimes : null;

  // ── Financement ───────────────────────────────────────────────────────────
  const tauxAnnuel = financement.taux_interet ?? null;
  const tauxMensuel = tauxAnnuel !== null ? tauxAnnuel / 100 / 12 : null;
  // `duree_emprunt` est en années dans FinancementData
  const dureeAns = financement.duree_emprunt ?? null;
  const dureeMois = dureeAns !== null ? dureeAns * 12 : null;
  const apport = financement.apport ?? 0;
  const fraisDossier = financement.frais_dossier ?? 0;

  const montantEmprunte =
    investissementTotal !== null ? Math.max(0, investissementTotal - apport) : null;

  // Mensualité PMT (exact pour taux constant)
  const mensualiteEstimee: number | null =
    tauxMensuel !== null && dureeMois !== null && dureeMois > 0 && montantEmprunte !== null
      ? pmt(tauxMensuel, dureeMois, montantEmprunte)
      : null;

  // ── Exploitation (revenus + charges) ──────────────────────────────────────
  const loyerMensuel = exploitation.loyer_mensuel ?? null;

  // Somme des charges mensualisées (annuelles ÷ 12 + mensuelles directes)
  const chargesCopro = (exploitation.charges_copro ?? 0) / 12;
  const taxeFonciere = (exploitation.taxe_fonciere ?? 0) / 12;
  const assurancePno = (exploitation.assurance_pno ?? 0) / 12;
  const gestionLocative = (exploitation.gestion_locative ?? 0) / 12;
  const provisionTravaux = (exploitation.provision_travaux ?? 0) / 12;
  const chargesMensuelles =
    chargesCopro + taxeFonciere + assurancePno + gestionLocative + provisionTravaux;

  const cashflowMensuelEstime: number | null =
    loyerMensuel !== null && loyerMensuel > 0 && mensualiteEstimee !== null
      ? loyerMensuel - mensualiteEstimee - chargesMensuelles
      : null;

  // ── Rendement brut ────────────────────────────────────────────────────────
  const loyerAnnuel = loyerMensuel !== null ? loyerMensuel * 12 : null;
  const rendementBrut: number | null =
    loyerAnnuel !== null && investissementTotal !== null && investissementTotal > 0
      ? (loyerAnnuel / investissementTotal) * 100
      : null;

  // ── Coût total du crédit ──────────────────────────────────────────────────
  const coutTotalCreditEstime: number | null =
    mensualiteEstimee !== null && dureeMois !== null && montantEmprunte !== null
      ? mensualiteEstimee * dureeMois - montantEmprunte
      : null;

  // ── TAEG approximatif ─────────────────────────────────────────────────────
  // Approximation : taux nominal + amortissement des frais
  // ⚠️ CE N'EST PAS LE TAEG RÉGLEMENTAIRE — afficher avec tilde (~4,2 %)
  // Le TAEG exact est calculé côté serveur (Newton-Raphson) dans UX-BE04.
  const taegApprox: number | null =
    tauxAnnuel !== null &&
    dureeAns !== null &&
    dureeAns > 0 &&
    montantEmprunte !== null &&
    montantEmprunte > 0
      ? tauxAnnuel + (fraisDossier / dureeAns / montantEmprunte) * 100
      : tauxAnnuel !== null
        ? tauxAnnuel * 1.05 // fallback grossier si frais absents
        : null;

  return {
    rendementBrut,
    mensualiteEstimee,
    investissementTotal,
    cashflowMensuelEstime,
    taegApprox,
    coutTotalCreditEstime,
    isPartiel: true,
  };
}
