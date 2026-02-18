import { performCalculations } from '@/server/calculations';
import { configService } from '@/server/config/config-service';
import { CLE_TO_FIELD } from '@/server/config/config-types';
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
              delta: rentabiliteAfter - rentabiliteBefore,
            },
            cashflow: {
              before: cashflowBefore,
              after: cashflowAfter,
              delta: cashflowAfter - cashflowBefore,
            },
            impot: {
              before: impotBefore,
              after: impotAfter,
              delta: impotAfter - impotBefore,
            },
          },
          hasChanges,
        });
      }
    }

    return results;
  }

  private snakeToCamel(s: string): string {
    return CLE_TO_FIELD[s] ?? s.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  private getScenarioLabel(key: string): string {
    switch (key) {
      case 'lmnp_classique':
        return 'LMNP Réel (T30)';
      case 'sci_is_familiale':
        return 'SCI IS (Familiale)';
      case 'nu_reel_deficit':
        return 'Nu Réel (Déficit)';
      default:
        return key;
    }
  }
}

export const dryRunService = new DryRunService();
