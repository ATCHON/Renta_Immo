import { CONSTANTS } from '@/config/constants';
import {
    CalculationInput,
    ProjectionAnnuelle,
    ProjectionData,
    TableauAmortissement,
    LigneAmortissement,
    RegimeFiscal
} from './types';
import { calculerFinancement } from './rentabilite';
import {
    calculerMicroFoncier,
    calculerFoncierReel,
    calculerLmnpMicro,
    calculerLmnpReel,
    calculerFiscaliteSciIs,
    calculerPlusValueIR,
    calculerPlusValueSciIs,
} from './fiscalite';
import type { ModeAmortissement, PlusValueDetail } from './types';

/**
 * Calcule le Taux de Rendement Interne (TRI)
 * @param flux Flux de trésorerie (le premier élément est l'apport négatif)
 * @param guess Estimation initiale (par défaut 0.1 pour 10%)
 */
export function calculerTRI(flux: number[], guess: number = 0.1): number {
    // Vérification de base: il faut au moins un flux négatif et un flux positif
    const hasNegative = flux.some(f => f < 0);
    const hasPositive = flux.some(f => f > 0);
    if (!hasNegative || !hasPositive) return 0;

    const maxIterations = 100;
    const precision = 0.00001;
    let tri = guess;

    for (let i = 0; i < maxIterations; i++) {
        let npv = 0;
        let dNpv = 0;

        for (let t = 0; t < flux.length; t++) {
            const factor = Math.pow(1 + tri, t);
            if (!isFinite(factor) || factor === 0) break;

            npv += flux[t] / factor;
            if (t > 0) {
                dNpv -= (t * flux[t]) / (factor * (1 + tri));
            }
        }

        if (Math.abs(npv) < precision) return tri * 100;
        if (dNpv === 0 || !isFinite(dNpv)) break;

        const nextTri = tri - npv / dNpv;

        // Sécurité supplémentaire : si le TRI s'emballe
        if (Math.abs(nextTri) > 1000) break; // Cap à 100000%

        if (Math.abs(nextTri - tri) < precision) return nextTri * 100;
        tri = nextTri;
    }

    // Si on n'a pas convergé mais que le flux total est positif, on retourne un TRI approché ou 0
    return 0;
}

/**
 * Génère le tableau d'amortissement complet d'un crédit
 * @param montant Montant emprunté
 * @param tauxAnnuel Taux d'intérêt annuel (en décimal, ex: 0.035 pour 3.5%)
 * @param dureeAnnees Durée du crédit en années
 * @param tauxAssurance Taux d'assurance annuel (en décimal, ex: 0.003 pour 0.3%)
 */
export function genererTableauAmortissement(
    montant: number,
    tauxAnnuel: number,
    dureeAnnees: number,
    tauxAssurance: number = 0,
    modeAssurance: 'capital_initial' | 'capital_restant_du' = 'capital_initial'
): TableauAmortissement {
    if (montant <= 0 || dureeAnnees <= 0) {
        return {
            annuel: [],
            mensuel: [],
            totaux: { totalInterets: 0, totalAssurance: 0, totalPaye: 0 }
        };
    }

    const nombreMois = dureeAnnees * 12;
    const mensualiteCredit = (tauxAnnuel === 0)
        ? montant / nombreMois
        : (montant * tauxAnnuel / 12) / (1 - Math.pow(1 + tauxAnnuel / 12, -nombreMois));

    // En France, l'assurance est souvent calculée sur le capital initial (fixe)
    // ou sur le capital restant dû. On va partir sur un montant fixe mensuel pour simplifier
    // basé sur le taux d'assurance annuel / 12 * montant initial.
    const mensualiteAssurance = (montant * tauxAssurance) / 12;
    const echeanceTotale = mensualiteCredit + mensualiteAssurance;

    const lignesMensuelles: LigneAmortissement[] = [];
    const lignesAnnuelles: LigneAmortissement[] = [];

    let capitalRestant = montant;
    let totalInterets = 0;
    let totalAssurance = 0;

    for (let mois = 1; mois <= nombreMois; mois++) {
        const interetsMois = capitalRestant * (tauxAnnuel / 12);
        const capitalMois = mensualiteCredit - interetsMois;

        // AUDIT-109 : Assurance sur capital restant dû
        const assuranceMois = modeAssurance === 'capital_restant_du'
            ? (capitalRestant * tauxAssurance) / 12
            : mensualiteAssurance;

        totalInterets += interetsMois;
        totalAssurance += assuranceMois;
        capitalRestant -= capitalMois;

        if (capitalRestant < 0) capitalRestant = 0;

        const echeanceMois = mensualiteCredit + assuranceMois;

        lignesMensuelles.push({
            periode: mois,
            echeance: Math.round(echeanceMois * 100) / 100,
            capital: Math.round(capitalMois * 100) / 100,
            interets: Math.round(interetsMois * 100) / 100,
            assurance: Math.round(assuranceMois * 100) / 100,
            capitalRestant: Math.round(capitalRestant < 0 ? 0 : capitalRestant * 100) / 100
        });

        // Agrégation annuelle
        if (mois % 12 === 0 || mois === nombreMois) {
            const annee = Math.ceil(mois / 12);
            const debut = (annee - 1) * 12;
            const fin = Math.min(annee * 12, nombreMois);

            let capAnnuel = 0;
            let intAnnuel = 0;
            let assAnnuel = 0;

            for (let i = debut; i < fin; i++) {
                capAnnuel += lignesMensuelles[i].capital;
                intAnnuel += lignesMensuelles[i].interets;
                assAnnuel += lignesMensuelles[i].assurance;
            }

            lignesAnnuelles.push({
                periode: annee,
                echeance: Math.round((capAnnuel + intAnnuel + assAnnuel) * 100) / 100,
                capital: Math.round(capAnnuel * 100) / 100,
                interets: Math.round(intAnnuel * 100) / 100,
                assurance: Math.round(assAnnuel * 100) / 100,
                capitalRestant: Math.round(capitalRestant * 100) / 100
            });
        }
    }

    return {
        mensuel: lignesMensuelles,
        annuel: lignesAnnuelles,
        totaux: {
            totalInterets: Math.round(totalInterets * 100) / 100,
            totalAssurance: Math.round(totalAssurance * 100) / 100,
            totalPaye: Math.round((totalInterets + totalAssurance + montant) * 100) / 100
        }
    };
}

/**
 * Résultat étendu du calcul d'impôt annuel
 * Inclut le suivi du déficit foncier reportable et de l'amortissement
 */
interface ImpotAnnuelResult {
    impot: number;
    deficitReportableSortant: number;
    amortissementAnnuel: number;
}

/**
 * Calcule l'impôt annuel pour une année de projection donnée
 * Gère le déficit foncier reportable (AUDIT-103) et l'amortissement composants (AUDIT-104)
 *
 * @param params Paramètres de calcul fiscal pour l'année
 * @returns Résultat étendu avec impôt, déficit reportable et amortissement
 */
function calculerImpotAnnuel(params: {
    regime: RegimeFiscal | 'sci_is' | 'sci_is_dividendes';
    loyerAnnuel: number;
    chargesDeductibles: number;
    tmi: number;
    coutFinancierAnnuel: number;
    prixAchat: number;
    montantTravaux: number;
    valeurMobilier: number;
    partTerrain?: number;
    typeLocation: string;
    distribuerDividendes: boolean;
    annee: number;
    modeAmortissement: ModeAmortissement;
    deficitReportableEntrant: number;
}): ImpotAnnuelResult {
    const {
        regime, loyerAnnuel, chargesDeductibles, tmi,
        coutFinancierAnnuel, prixAchat, annee, partTerrain,
        typeLocation, distribuerDividendes, modeAmortissement,
        deficitReportableEntrant
    } = params;

    const mobilierEffectif = annee <= CONSTANTS.AMORTISSEMENT.DUREE_MOBILIER ? params.valeurMobilier : 0;
    const travauxEffectif = annee <= CONSTANTS.AMORTISSEMENT.DUREE_TRAVAUX ? params.montantTravaux : 0;

    switch (regime) {
        case 'micro_foncier':
            return {
                impot: calculerMicroFoncier(loyerAnnuel, tmi).impot_total,
                deficitReportableSortant: 0,
                amortissementAnnuel: 0,
            };

        case 'reel': {
            const result = calculerFoncierReel(
                loyerAnnuel, chargesDeductibles, tmi, coutFinancierAnnuel,
                deficitReportableEntrant
            );
            // Calculer le nouveau déficit reportable
            let nouveauReportable = Math.max(0, deficitReportableEntrant - Math.min(deficitReportableEntrant, loyerAnnuel));
            if (result.deficit_foncier) {
                nouveauReportable += result.deficit_foncier.reportable;
            }
            return {
                impot: result.impot_total,
                deficitReportableSortant: nouveauReportable,
                amortissementAnnuel: 0,
            };
        }

        case 'lmnp_micro':
            return {
                impot: calculerLmnpMicro(loyerAnnuel, tmi, typeLocation).impot_total,
                deficitReportableSortant: 0,
                amortissementAnnuel: 0,
            };

        case 'lmnp_reel': {
            const result = calculerLmnpReel(
                loyerAnnuel, chargesDeductibles, prixAchat, tmi,
                travauxEffectif, mobilierEffectif, coutFinancierAnnuel, partTerrain,
                modeAmortissement, annee
            );
            return {
                impot: result.impot_total,
                deficitReportableSortant: 0,
                amortissementAnnuel: result.abattement, // amortissement déductible
            };
        }

        case 'sci_is':
        case 'sci_is_dividendes': {
            const revenuNetAvantImpots = loyerAnnuel - chargesDeductibles;
            const result = calculerFiscaliteSciIs(
                revenuNetAvantImpots, prixAchat, coutFinancierAnnuel,
                distribuerDividendes, partTerrain,
                modeAmortissement, annee
            );
            return {
                impot: result.impot_total,
                deficitReportableSortant: 0,
                amortissementAnnuel: result.abattement, // amortissement
            };
        }

        default:
            return {
                impot: calculerMicroFoncier(loyerAnnuel, tmi).impot_total,
                deficitReportableSortant: 0,
                amortissementAnnuel: 0,
            };
    }
}

/**
 * Génère les projections financières sur un horizon donné
 * @param input Données d'entrée validées
 * @param horizon Horizon de projection en années (défaut: 20)
 */
export function genererProjections(
    input: CalculationInput,
    horizon: number = 20
): ProjectionData {
    // 1. Calculs initiaux via le module rentabilite
    const financementCalc = calculerFinancement(input.bien, input.financement);

    const montantEmprunt = financementCalc.montant_emprunt;
    // Conversion taux % -> décimal
    const tauxCredit = (input.financement.taux_interet || 0) / 100;
    const dureeCredit = input.financement.duree_emprunt || 0;
    const tauxAssurance = (input.financement.assurance_pret || 0) / 100;

    // Générer l'amortissement
    const modeAssurance = input.financement.mode_assurance ?? 'capital_initial';
    const amortissement = genererTableauAmortissement(montantEmprunt, tauxCredit, dureeCredit, tauxAssurance, modeAssurance);

    // Déterminer le régime fiscal pour les projections
    const regimeProjection: RegimeFiscal | 'sci_is' | 'sci_is_dividendes' =
        input.structure.type === 'sci_is'
            ? (input.structure.distribution_dividendes ? 'sci_is_dividendes' : 'sci_is')
            : (input.structure.regime_fiscal ?? 'micro_foncier');
    const tmi = input.structure.tmi ?? 30;
    const partTerrain = input.bien.part_terrain;

    const modeAmortissement: ModeAmortissement = input.structure.mode_amortissement ?? 'simplifie';
    const projections: ProjectionAnnuelle[] = [];

    // Valeurs initiales (Année 1)
    let loyerMensuel = input.exploitation.loyer_mensuel;
    let valeurBien = input.bien.prix_achat + (input.bien.montant_travaux || 0);

    // Constantes d'évolution (utiliser les options si présentes, sinon les constantes par défaut)
    const inflationLoyer = input.options.taux_evolution_loyer !== undefined
        ? input.options.taux_evolution_loyer / 100
        : CONSTANTS.PROJECTION.INFLATION_LOYER;

    const inflationCharges = input.options.taux_evolution_charges !== undefined
        ? input.options.taux_evolution_charges / 100
        : CONSTANTS.PROJECTION.INFLATION_CHARGES;

    const revalorisationBien = CONSTANTS.PROJECTION.REVALORISATION_BIEN;

    // AUDIT-110 : Gel des loyers pour DPE F, G et E (2034)
    const dpe = input.bien.dpe;
    const currentYear = new Date().getFullYear();

    // Facteur d'inflation cumulée pour les charges fixes (commence à 1)
    let facteurInflationCharges = 1;

    let cashflowCumule = 0;
    let capitalRembourseTotal = 0;
    // AUDIT-103 : suivi du déficit reportable par année (buckets FIFO avec expiration à DUREE_REPORT ans)
    let deficitBuckets: { annee: number; montant: number }[] = [];
    let amortissementCumule = 0;       // AUDIT-105 : suivi pour calcul PV

    for (let annee = 1; annee <= horizon; annee++) {
        const projectionYear = currentYear + (annee - 1);

        // Détermination du gel des loyers pour l'année courante de projection
        let gelLoyer = false;
        if (dpe) {
            if (['F', 'G'].includes(dpe)) {
                gelLoyer = true;
            } else if (dpe === 'E' && projectionYear >= 2034) {
                gelLoyer = true;
            }
        }

        // Appliquer l'inflation sur la valeur théorique (hors décote)
        if (annee > 1) {
            if (!gelLoyer) {
                loyerMensuel *= (1 + inflationLoyer);
            }
            facteurInflationCharges *= (1 + inflationCharges);
            valeurBien *= (1 + revalorisationBien);
        }

        const tauxOccupation = input.exploitation.taux_occupation ?? 1;
        const loyerAnnuel = loyerMensuel * 12 * tauxOccupation;

        // V2-S14 : Calcul de la valeur réelle (avec décote DPE)
        let coefficientDecote = 1;
        if (dpe) {
            if (['F', 'G'].includes(dpe)) {
                coefficientDecote = 1 - CONSTANTS.PROJECTION.DECOTE_DPE.F_G;
            } else if (dpe === 'E' && projectionYear >= 2034) {
                coefficientDecote = 1 - CONSTANTS.PROJECTION.DECOTE_DPE.E;
            }
        }
        const valeurReelle = valeurBien * coefficientDecote;

        // Calcul des charges fixes de base (saisies)
        const chargesFixesBase =
            (input.exploitation.charges_copro * 12) +
            input.exploitation.taxe_fonciere +
            input.exploitation.assurance_pno +
            (input.exploitation.assurance_gli || 0) +
            (input.exploitation.cfe_estimee || 0) +
            (input.exploitation.comptable_annuel || 0);

        const chargesFixesInflatees = chargesFixesBase * facteurInflationCharges;

        // Charges proportionnelles (toujours % du loyer courant)
        const chargesProp =
            (input.exploitation.gestion_locative / 100 * loyerAnnuel) +
            (input.exploitation.provision_travaux / 100 * loyerAnnuel) +
            (input.exploitation.provision_vacance / 100 * loyerAnnuel);

        const chargesAnnuelles = chargesFixesInflatees + chargesProp;

        // Charges déductibles fiscales (nettes des charges récupérables sur le locataire)
        const chargesRecuperablesInflatees = (input.exploitation.charges_copro_recuperables || 0) * 12 * facteurInflationCharges;
        const chargesDeductiblesFiscales = chargesAnnuelles - chargesRecuperablesInflatees;

        // Crédit
        let capitalRembourseAnnuel = 0;
        let capitalRestant = 0;
        let remboursementCreditAnnuel = 0;

        // Coût financier déductible (intérêts + assurance) tiré du tableau d'amortissement
        let coutFinancierAnnuel = 0;

        if (annee <= dureeCredit) {
            const ligneAnnuelle = amortissement.annuel[annee - 1];
            capitalRembourseAnnuel = ligneAnnuelle?.capital || 0;
            capitalRestant = ligneAnnuelle?.capitalRestant || 0;
            remboursementCreditAnnuel = ligneAnnuelle?.echeance || 0;
            coutFinancierAnnuel = (ligneAnnuelle?.interets || 0) + (ligneAnnuelle?.assurance || 0);
        } else {
            capitalRestant = 0;
            remboursementCreditAnnuel = 0;
        }

        const cashflowBrut = loyerAnnuel - chargesAnnuelles - remboursementCreditAnnuel;

        // Expirer les buckets de déficit de plus de DUREE_REPORT ans (FIFO)
        const dureeReport = CONSTANTS.DEFICIT_FONCIER.DUREE_REPORT;
        deficitBuckets = deficitBuckets.filter(b => annee - b.annee <= dureeReport);

        // Total reportable = somme des buckets actifs
        const deficitReportableTotal = deficitBuckets.reduce((sum, b) => sum + b.montant, 0);

        // Calcul fiscal annuel (Audit 2026-02-07 + Phase 2)
        const impotResult = calculerImpotAnnuel({
            regime: regimeProjection,
            loyerAnnuel,
            chargesDeductibles: chargesDeductiblesFiscales,
            tmi,
            coutFinancierAnnuel,
            prixAchat: input.bien.prix_achat,
            montantTravaux: input.bien.montant_travaux || 0,
            valeurMobilier: input.bien.valeur_mobilier || 0,
            partTerrain,
            typeLocation: input.exploitation.type_location || 'nue',
            distribuerDividendes: input.structure.distribution_dividendes || false,
            annee,
            modeAmortissement,
            deficitReportableEntrant: deficitReportableTotal,
        });

        const impot = impotResult.impot;

        // Mise à jour des buckets de déficit (FIFO : consommer les plus anciens d'abord)
        if (regimeProjection === 'reel') {
            const consumed = Math.min(deficitReportableTotal, loyerAnnuel);
            let toConsume = consumed;
            for (const bucket of deficitBuckets) {
                if (toConsume <= 0) break;
                const take = Math.min(bucket.montant, toConsume);
                bucket.montant -= take;
                toConsume -= take;
            }
            deficitBuckets = deficitBuckets.filter(b => b.montant > 0);

            // Nouveau déficit généré cette année
            const remainingOld = deficitBuckets.reduce((sum, b) => sum + b.montant, 0);
            const newDeficit = impotResult.deficitReportableSortant - remainingOld;
            if (newDeficit > 0) {
                deficitBuckets.push({ annee, montant: newDeficit });
            }
        }

        amortissementCumule += impotResult.amortissementAnnuel;

        const cashflowNet = cashflowBrut - impot;

        projections.push({
            annee,
            loyer: Math.round(loyerAnnuel),
            charges: Math.round(chargesAnnuelles + remboursementCreditAnnuel),
            chargesExploitation: Math.round(chargesAnnuelles),
            remboursementCredit: Math.round(remboursementCreditAnnuel),
            mensualite: Math.round(remboursementCreditAnnuel / 12),
            cashflow: Math.round(cashflowBrut),
            capitalRembourse: Math.round(capitalRembourseAnnuel),
            capitalRestant: Math.round(capitalRestant),
            valeurBien: Math.round(valeurReelle),
            patrimoineNet: Math.round(valeurReelle - capitalRestant) || 0,
            impot: Math.round(impot),
            cashflowNetImpot: Math.round(cashflowNet)
        });

        cashflowCumule += cashflowNet;
        capitalRembourseTotal += capitalRembourseAnnuel;
    }

    // AUDIT-105 : Calcul de la plus-value à la revente
    const derniereProjection = projections[projections.length - 1];
    let plusValue: PlusValueDetail | undefined;

    const isSciIs = regimeProjection === 'sci_is' || regimeProjection === 'sci_is_dividendes';
    const isLmnpReel = regimeProjection === 'lmnp_reel';

    if (isSciIs) {
        plusValue = calculerPlusValueSciIs(
            derniereProjection.valeurBien,
            input.bien.prix_achat,
            amortissementCumule,
            input.structure.distribution_dividendes || false
        );
    } else {
        // Nom propre (IR) : réintégration amortissements uniquement pour LMNP réel (LF 2025)
        plusValue = calculerPlusValueIR(
            derniereProjection.valeurBien,
            input.bien.prix_achat,
            horizon,
            isLmnpReel ? amortissementCumule : 0,
            input.bien.montant_travaux || 0
        );
    }

    // AUDIT-108 : Frais de revente
    const tauxAgenceRevente = (input.options.taux_agence_revente ?? CONSTANTS.FRAIS_REVENTE.TAUX_AGENCE_DEFAUT) / 100;
    const fraisAgence = derniereProjection.valeurBien * tauxAgenceRevente;
    const fraisDiagnostics = CONSTANTS.FRAIS_REVENTE.DIAGNOSTICS;
    const fraisReventeTotal = Math.round(fraisAgence + fraisDiagnostics);

    // Calcul du TRI (flux nets d'impôts)
    // Flux 0 : -Apport (si 0, on simule 1€ pour permettre le calcul TRI)
    const flux: number[] = [-(input.financement.apport > 0 ? input.financement.apport : 1)];

    // Flux 1 à horizon-1 : Cashflow Net d'impôts
    for (let i = 0; i < projections.length - 1; i++) {
        flux.push(projections[i].cashflowNetImpot);
    }
    // Flux horizon : Cashflow Net + Patrimoine Net - Impôt PV (AUDIT-105)
    const impotPV = plusValue?.impot_total ?? 0;
    flux.push(derniereProjection.cashflowNetImpot + derniereProjection.patrimoineNet - impotPV - fraisReventeTotal);

    const tri = calculerTRI(flux);

    return {
        horizon,
        projections,
        totaux: {
            cashflowCumule: Math.round(cashflowCumule),
            capitalRembourse: Math.round(capitalRembourseTotal),
            impotCumule: Math.round(projections.reduce((sum, p) => sum + p.impot, 0)),
            enrichissementTotal: Math.round(capitalRembourseTotal + cashflowCumule - impotPV - fraisReventeTotal),
            tri: tri > 0 ? Math.round(tri * 100) / 100 : 0,
            frais_revente: fraisReventeTotal,
        },
        plusValue,
    };
}
