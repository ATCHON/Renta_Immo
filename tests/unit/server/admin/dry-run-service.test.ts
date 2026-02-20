import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DryRunService } from '@/server/admin/dry-run-service';

// Mock les dépendances lourdes
vi.mock('@/server/calculations', () => ({
  performCalculations: vi.fn(),
}));

vi.mock('@/server/config/config-service', () => ({
  configService: {
    getConfig: vi.fn(),
  },
}));

vi.mock('@/server/admin/dry-run-fixtures', () => ({
  FIXTURES: {},
}));

vi.mock('@/server/config/config-types', () => ({
  CLE_TO_FIELD: {
    TAUX_PS_FONCIER: 'tauxPsFoncier',
    ABATTEMENT_MICRO: 'abattementMicro',
  } as Record<string, string>,
}));

describe('DryRunService', () => {
  let service: DryRunService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DryRunService();
  });

  // =============================================================================
  // simulateChange — logique avec fixtures vides
  // =============================================================================
  describe('simulateChange', () => {
    it("retourne un tableau vide quand il n'y a pas de fixtures", async () => {
      const { configService } = await import('@/server/config/config-service');
      (configService.getConfig as ReturnType<typeof vi.fn>).mockResolvedValue({
        tauxPsFoncier: 0.172,
      });

      const results = await service.simulateChange('TAUX_PS_FONCIER', 0.2);
      expect(results).toEqual([]);
      expect(configService.getConfig).toHaveBeenCalled();
    });
  });

  // =============================================================================
  // Calculs avec fixtures mockées
  // =============================================================================
  describe('simulateChange avec fixtures', () => {
    it('détecte les changements significatifs', async () => {
      const { FIXTURES } = await import('@/server/admin/dry-run-fixtures');
      const { configService } = await import('@/server/config/config-service');
      const { performCalculations } = await import('@/server/calculations');

      // Ajouter une fixture temporaire
      (FIXTURES as Record<string, unknown>).lmnp_classique = {
        bien: {},
        financement: {},
        exploitation: {},
        structure: {},
      };

      (configService.getConfig as ReturnType<typeof vi.fn>).mockResolvedValue({
        tauxPsFoncier: 0.172,
      });

      (performCalculations as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          success: true,
          resultats: {
            rentabilite: { nette_nette: 5.5 },
            cashflow: { annuel: 3000 },
            fiscalite: { impot_estime: 1000 },
          },
        })
        .mockResolvedValueOnce({
          success: true,
          resultats: {
            rentabilite: { nette_nette: 5.2 },
            cashflow: { annuel: 2800 },
            fiscalite: { impot_estime: 1200 },
          },
        });

      const results = await service.simulateChange('TAUX_PS_FONCIER', 0.2);

      expect(results).toHaveLength(1);
      expect(results[0].scenarioId).toBe('lmnp_classique');
      expect(results[0].label).toBe('LMNP Réel (T30)');
      expect(results[0].hasChanges).toBe(true);
      expect(results[0].metrics.rentabilite.delta).toBeCloseTo(-0.3, 1);
      expect(results[0].metrics.cashflow.delta).toBe(-200);
      expect(results[0].metrics.impot.delta).toBe(200);

      // Cleanup
      delete (FIXTURES as Record<string, unknown>).lmnp_classique;
    });

    it("détecte quand il n'y a pas de changements significatifs", async () => {
      const { FIXTURES } = await import('@/server/admin/dry-run-fixtures');
      const { configService } = await import('@/server/config/config-service');
      const { performCalculations } = await import('@/server/calculations');

      (FIXTURES as Record<string, unknown>).sci_is_familiale = { bien: {}, financement: {} };

      (configService.getConfig as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const sameResult = {
        success: true,
        resultats: {
          rentabilite: { nette_nette: 5.5 },
          cashflow: { annuel: 3000 },
          fiscalite: { impot_estime: 1000 },
        },
      };

      (performCalculations as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(sameResult)
        .mockResolvedValueOnce(sameResult);

      const results = await service.simulateChange('ANYTHING', 0);

      expect(results).toHaveLength(1);
      expect(results[0].label).toBe('SCI IS (Familiale)');
      expect(results[0].hasChanges).toBe(false);

      delete (FIXTURES as Record<string, unknown>).sci_is_familiale;
    });

    it('gère le label du scénario nu_reel_deficit', async () => {
      const { FIXTURES } = await import('@/server/admin/dry-run-fixtures');
      const { configService } = await import('@/server/config/config-service');
      const { performCalculations } = await import('@/server/calculations');

      (FIXTURES as Record<string, unknown>).nu_reel_deficit = { bien: {} };

      (configService.getConfig as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = {
        success: true,
        resultats: {
          rentabilite: { nette_nette: 4 },
          cashflow: { annuel: 2000 },
          fiscalite: { impot_estime: 500 },
        },
      };

      (performCalculations as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(result)
        .mockResolvedValueOnce(result);

      const results = await service.simulateChange('X', 0);
      expect(results[0].label).toBe('Nu Réel (Déficit)');

      delete (FIXTURES as Record<string, unknown>).nu_reel_deficit;
    });

    it('gère le label par défaut pour les scénarios inconnus', async () => {
      const { FIXTURES } = await import('@/server/admin/dry-run-fixtures');
      const { configService } = await import('@/server/config/config-service');
      const { performCalculations } = await import('@/server/calculations');

      (FIXTURES as Record<string, unknown>).custom_scenario = { bien: {} };

      (configService.getConfig as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = {
        success: true,
        resultats: {
          rentabilite: { nette_nette: 3 },
          cashflow: { annuel: 1000 },
          fiscalite: { impot_estime: 200 },
        },
      };

      (performCalculations as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(result)
        .mockResolvedValueOnce(result);

      const results = await service.simulateChange('Y', 0);
      expect(results[0].label).toBe('custom_scenario');

      delete (FIXTURES as Record<string, unknown>).custom_scenario;
    });
  });
});
