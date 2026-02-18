import { performCalculations, CalculationResult } from '@/server/calculations';
import { configService } from '@/server/config/config-service';
import { ResolvedConfig } from '@/server/config/config-types';
import { FIXTURES } from './dry-run-fixtures';

export interface ScenarioImpact {
    scenarioId: string;
    label: string;
    metrics: {
        rentabilite: {
            before: number;
            after: number;
            delta: number;
        };
        cashflow: {
            before: number;
            after: number;
            delta: number;
        };
        impot: {
            before: number;
            after: number;
            delta: number;
        };
    };
    hasChanges: boolean;
}

export class DryRunService {
    async simulateChange(cle: string, valeur: number): Promise<ScenarioImpact[]> {
        // 1. Récupérer la config actuelle
        const anneeFiscale = new Date().getFullYear();
        const currentConfig = await configService.getConfig(anneeFiscale);

        // 2. Créer la config patchée
        // On doit mapper la clé de bdd (ex: TAUX_PS_FONCIER) vers la clé de l'objet (tauxPsFoncier)
        // Pour faire simple, on va cloner et itérer car on n'a pas le mapping inversé facilement accessible publiquement
        // Mais on sait que configService.getFallbackValue utilise un mapping. 
        // Hack temporaire : on cast en any pour assigner dynamiquement si on connaît le mapping, 
        // ou alors on modifie configService pour exposer le mapping.
        // Alternative plus robuste : modifier performCalculations pour accepter un patch partiel ? Non.

        // On va utiliser une heuristique simple : chercher la clé dans la config qui correspond
        // Mais les clés BDD sont en SNAKE_CASE et l'objet en camelCase.

        const camelKey = this.snakeToCamel(cle);
        const patchedConfig = { ...currentConfig, [camelKey]: valeur };

        // Si la conversion n'a pas marché (ex: cas particuliers), on loggue
        if (!(camelKey in currentConfig)) {
            console.warn(`DryRun: Impossible de mapper la clé BDD ${cle} vers une propriété de config.`);
            // On tente de trouver manuellement certains cas connus si besoin
        }

        const results: ScenarioImpact[] = [];

        // 3. Lancer les calculs pour chaque fixture
        for (const [key, input] of Object.entries(FIXTURES)) {
            const before = await performCalculations(input, currentConfig);
            const after = await performCalculations(input, patchedConfig);

            if (before.success && after.success) {
                const resBefore = before.resultats;
                const resAfter = after.resultats;

                const rentabiliteBefore = resBefore.rentabilite.nette_nette;
                const rentabiliteAfter = resAfter.rentabilite.nette_nette;

                const cashflowBefore = resBefore.cashflow.annuel;
                const cashflowAfter = resAfter.cashflow.annuel;

                const impotBefore = resBefore.fiscalite.impot_estime;
                const impotAfter = resAfter.fiscalite.impot_estime;

                const hasChanges =
                    Math.abs(rentabiliteAfter - rentabiliteBefore) > 0.01 ||
                    Math.abs(cashflowAfter - cashflowBefore) > 1 ||
                    Math.abs(impotAfter - impotBefore) > 1;

                results.push({
                    scenarioId: key,
                    label: this.getScenarioLabel(key),
                    metrics: {
                        rentabilite: {
                            before: rentabiliteBefore,
                            after: rentabiliteAfter,
                            delta: rentabiliteAfter - rentabiliteBefore
                        },
                        cashflow: {
                            before: cashflowBefore,
                            after: cashflowAfter,
                            delta: cashflowAfter - cashflowBefore
                        },
                        impot: {
                            before: impotBefore,
                            after: impotAfter,
                            delta: impotAfter - impotBefore
                        }
                    },
                    hasChanges
                });
            }
        }

        return results;
    }

    private snakeToCamel(s: string): string {
        // Mapping complet cle BDD → propriété ResolvedConfig (miroir de config-service.ts)
        const map: Record<string, string> = {
            'TAUX_PS_FONCIER': 'tauxPsFoncier',
            'TAUX_PS_REVENUS_BIC_LMNP': 'tauxPsRevenusBicLmnp',
            'MICRO_FONCIER_ABATTEMENT': 'microFoncierAbattement',
            'MICRO_FONCIER_PLAFOND': 'microFoncierPlafond',
            'MICRO_BIC_MEUBLE_LONGUE_DUREE_ABATTEMENT': 'microBicMeubleLongueDureeAbattement',
            'MICRO_BIC_MEUBLE_LONGUE_DUREE_PLAFOND': 'microBicMeubleLongueDureePlafond',
            'MICRO_BIC_TOURISME_CLASSE_ABATTEMENT': 'microBicTourismeClasseAbattement',
            'MICRO_BIC_TOURISME_CLASSE_PLAFOND': 'microBicTourismeClassePlafond',
            'MICRO_BIC_TOURISME_NON_CLASSE_ABATTEMENT': 'microBicTourismeNonClasseAbattement',
            'MICRO_BIC_TOURISME_NON_CLASSE_PLAFOND': 'microBicTourismeNonClassePlafond',
            'IS_TAUX_REDUIT': 'isTauxReduit',
            'IS_TAUX_NORMAL': 'isTauxNormal',
            'IS_SEUIL_TAUX_REDUIT': 'isSeuilTauxReduit',
            'FLAT_TAX': 'flatTax',
            'DEFICIT_FONCIER_PLAFOND_IMPUTATION': 'deficitFoncierPlafondImputation',
            'DEFICIT_FONCIER_PLAFOND_ENERGIE': 'deficitFoncierPlafondEnergie',
            'DEFICIT_FONCIER_DUREE_REPORT': 'deficitFoncierDureeReport',
            'PLUS_VALUE_TAUX_IR': 'plusValueTauxIr',
            'PLUS_VALUE_TAUX_PS': 'plusValueTauxPs',
            'PLUS_VALUE_FORFAIT_FRAIS_ACQUISITION': 'plusValueForfaitFraisAcquisition',
            'PLUS_VALUE_FORFAIT_TRAVAUX_PV': 'plusValueForfaitTravauxPv',
            'PLUS_VALUE_SEUIL_SURTAXE': 'plusValueSeuilSurtaxe',
            'HCSF_TAUX_MAX': 'hcsfTauxMax',
            'HCSF_DUREE_MAX_ANNEES': 'hcsfDureeMaxAnnees',
            'HCSF_PONDERATION_LOCATIFS': 'hcsfPonderationLocatifs',
            'DECOTE_DPE_FG': 'decoteDpeFg',
            'DECOTE_DPE_E': 'decoteDpeE',
            'LMP_SEUIL_ALERTE': 'lmpSeuilAlerte',
            'LMP_SEUIL_LMP': 'lmpSeuilLmp',
            'RESTE_A_VIVRE_SEUIL_MIN': 'resteAVivreSeuilMin',
            'RESTE_A_VIVRE_SEUIL_CONFORT': 'resteAVivreSeuilConfort',
            'DEFAULTS_ASSURANCE_PNO': 'defaultsAssurancePno',
            'DEFAULTS_CHARGES_COPRO_M2': 'defaultsChargesCoproM2',
            'DEFAULTS_TAXE_FONCIERES_MOIS': 'defaultsTaxeFoncieresMois',
            'DEFAULTS_FRAIS_DOSSIER_BANQUE': 'defaultsFraisDossierBanque',
            'DEFAULTS_FRAIS_GARANTIE_CREDIT': 'defaultsFraisGarantieCredit',
            'DEFAULTS_COMPTABLE_ANNUEL': 'defaultsComptableLmnp',
            'DEFAULTS_CFE_MIN': 'defaultsCfeMin',
            'CFE_SEUIL_EXONERATION': 'cfeSeuilExoneration',
            'FRAIS_REVENTE_TAUX_AGENCE_DEFAUT': 'fraisReventeTauxAgenceDefaut',
            'FRAIS_REVENTE_DIAGNOSTICS': 'fraisReventeDiagnostics',
            'NOTAIRE_TAUX_ANCIEN': 'notaireTauxAncien',
            'NOTAIRE_TAUX_NEUF': 'notaireTauxNeuf',
            'PROJECTION_INFLATION_LOYER': 'projectionInflationLoyer',
            'PROJECTION_INFLATION_CHARGES': 'projectionInflationCharges',
            'PROJECTION_REVALORISATION_BIEN': 'projectionRevalorisation',
        };
        return map[s] ?? s.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    }

    private getScenarioLabel(key: string): string {
        switch (key) {
            case 'lmnp_classique': return 'LMNP Réel (T30)';
            case 'sci_is_familiale': return 'SCI IS (Familiale)';
            case 'nu_reel_deficit': return 'Nu Réel (Déficit)';
            default: return key;
        }
    }
}

export const dryRunService = new DryRunService();
