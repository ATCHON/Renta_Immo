import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGlobalAuditLogs } from '@/server/admin/audit-service';
import { ConfigBloc } from '@/server/config/config-types';

// Mock du client Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockRange = vi.fn();
const mockOrder = vi.fn();
const mockIn = vi.fn();

const mockQueryBuilder = {
  select: mockSelect,
  eq: mockEq,
  range: mockRange,
  order: mockOrder,
  in: mockIn,
};

// Configurer le chaînage mocké
mockSelect.mockReturnValue(mockQueryBuilder);
mockEq.mockReturnValue(mockQueryBuilder);
mockRange.mockReturnValue(mockQueryBuilder);
mockOrder.mockReturnValue(mockQueryBuilder);
mockIn.mockReturnValue(mockQueryBuilder);

const mockFrom = vi.fn().mockReturnValue(mockQueryBuilder);

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

describe('audit-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGlobalAuditLogs', () => {
    it("récupère l'historique d'audit avec pagination et enrichissement", async () => {
      // Mock resultats pour le comptage
      mockSelect.mockImplementationOnce(() => Promise.resolve({ count: 2, error: null })); // from('config_params_audit').select(count)

      // Mock resultats pour la donnée d'audit
      mockOrder.mockImplementationOnce(() => mockQueryBuilder);
      mockRange.mockImplementationOnce(() =>
        Promise.resolve({
          data: [
            {
              id: 'log-1',
              config_id: 'conf-1',
              annee_fiscale: 2026,
              bloc: 'fiscalite',
              cle: 'taux_is',
              ancienne_valeur: 15,
              nouvelle_valeur: 25,
              modifie_par: 'user-1',
              modifie_le: '2026-02-22T10:00:00Z',
            },
          ],
          error: null,
        })
      );

      // Mock resultats pour les configs (labels)
      mockIn.mockImplementationOnce(() =>
        Promise.resolve({
          data: [{ id: 'conf-1', label: 'Taux Impôt Société' }],
          error: null,
        })
      );

      // Mock resultats pour les users (emails)
      mockIn.mockImplementationOnce(() =>
        Promise.resolve({
          data: [{ id: 'user-1', email: 'admin@rentaimmo.test' }],
          error: null,
        })
      );

      const page = 1;
      const result = await getGlobalAuditLogs(page);

      expect(mockFrom).toHaveBeenCalledWith('config_params_audit');
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(1); // 2 / 50 = 1
      expect(result.data).toHaveLength(1);

      const enrichedLog = result.data[0];
      expect(enrichedLog.param_label).toBe('Taux Impôt Société');
      expect(enrichedLog.admin_email).toBe('admin@rentaimmo.test');
    });

    it('gère les filtres correctement', async () => {
      // Mock resultats pour le comptage
      // Appel 1 : from('config_params_audit').select(count)
      mockSelect.mockImplementationOnce(() => mockQueryBuilder);
      // Ensuite 3 eq()
      mockEq.mockImplementationOnce(() => mockQueryBuilder);
      mockEq.mockImplementationOnce(() => mockQueryBuilder);
      mockEq.mockImplementationOnce(() => Promise.resolve({ count: 1, error: null }));

      // Mock resultats pour data
      mockOrder.mockImplementationOnce(() => mockQueryBuilder);
      mockRange.mockImplementationOnce(() => mockQueryBuilder);
      mockEq.mockImplementationOnce(() => mockQueryBuilder);
      mockEq.mockImplementationOnce(() => mockQueryBuilder);
      mockEq.mockImplementationOnce(() =>
        Promise.resolve({
          data: [], // empty for test simplicity
          error: null,
        })
      );

      await getGlobalAuditLogs(1, {
        bloc: 'fiscalite' as ConfigBloc,
        cle: 'seuil_micro',
        adminId: 'uuid-123',
      });

      // Vérifie que eq() a été appelé avec les bons filtres, pour count ET data
      expect(mockEq).toHaveBeenCalledWith('bloc', 'fiscalite');
      expect(mockEq).toHaveBeenCalledWith('cle', 'seuil_micro');
      expect(mockEq).toHaveBeenCalledWith('modifie_par', 'uuid-123');
    });

    it('génère une erreur si le comptage échoue', async () => {
      mockSelect.mockImplementationOnce(() =>
        Promise.resolve({ count: null, error: new Error('Db Error') })
      );

      await expect(getGlobalAuditLogs(1)).rejects.toThrow(
        "Erreur lors du comptage des logs d'audit"
      );
    });

    it('génère une erreur si la récupération échoue', async () => {
      // Pour count
      mockSelect.mockImplementationOnce(() => Promise.resolve({ count: 5, error: null }));

      // Pour data
      mockOrder.mockImplementationOnce(() => mockQueryBuilder);
      mockRange.mockImplementationOnce(() =>
        Promise.resolve({ data: null, error: new Error('Db Data Error') })
      );

      await expect(getGlobalAuditLogs(1)).rejects.toThrow(
        "Erreur lors de la récupération des logs d'audit"
      );
    });
  });
});
