import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiRequestError, getErrorMessage } from '@/lib/api';

// =============================================================================
// ApiRequestError
// =============================================================================
describe('ApiRequestError', () => {
  it('crée une erreur avec message, code et details', () => {
    const error = new ApiRequestError('Test error', 'VALIDATION_ERROR', { field: 'prix' });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual({ field: 'prix' });
    expect(error.name).toBe('ApiRequestError');
  });

  it('est une instance de Error', () => {
    const error = new ApiRequestError('msg', 'SERVER_ERROR');
    expect(error).toBeInstanceOf(Error);
  });

  describe('userMessage', () => {
    it('retourne un message réseau pour NETWORK_ERROR', () => {
      const error = new ApiRequestError('msg', 'NETWORK_ERROR');
      expect(error.userMessage).toContain('connexion');
    });

    it('retourne un message timeout pour TIMEOUT', () => {
      const error = new ApiRequestError('msg', 'TIMEOUT');
      expect(error.userMessage).toContain('trop de temps');
    });

    it('retourne un message validation pour VALIDATION_ERROR', () => {
      const error = new ApiRequestError('msg', 'VALIDATION_ERROR');
      expect(error.userMessage).toContain('invalide');
    });

    it('retourne un message calcul pour CALCULATION_ERROR', () => {
      const error = new ApiRequestError('msg', 'CALCULATION_ERROR');
      expect(error.userMessage).toContain('calcul');
    });

    it('retourne un message serveur pour SERVER_ERROR', () => {
      const error = new ApiRequestError('msg', 'SERVER_ERROR');
      expect(error.userMessage).toContain('serveur');
    });

    it('retourne le message original pour un code inconnu', () => {
      const error = new ApiRequestError(
        'Mon message custom',
        'UNKNOWN_ERROR' as ApiRequestError['code']
      );
      expect(error.userMessage).toBe('Mon message custom');
    });

    it('retourne un message par défaut si message vide et code inconnu', () => {
      const error = new ApiRequestError('', 'UNKNOWN_ERROR' as ApiRequestError['code']);
      expect(error.userMessage).toContain('inattendue');
    });
  });
});

// =============================================================================
// getErrorMessage
// =============================================================================
describe('getErrorMessage', () => {
  it('retourne userMessage pour ApiRequestError', () => {
    const error = new ApiRequestError('msg', 'TIMEOUT');
    const message = getErrorMessage(error);
    expect(message).toContain('trop de temps');
  });

  it('retourne message pour une Error standard', () => {
    const message = getErrorMessage(new Error('Something failed'));
    expect(message).toBe('Something failed');
  });

  it('retourne un message par défaut pour une valeur non-Error', () => {
    expect(getErrorMessage('string error')).toContain('inattendue');
    expect(getErrorMessage(null)).toContain('inattendue');
    expect(getErrorMessage(42)).toContain('inattendue');
  });
});

// =============================================================================
// calculateRentability (avec mock fetch)
// =============================================================================
describe('calculateRentability', () => {
  const mockFormData = {
    bien: {
      adresse: 'test',
      prix_achat: 100000,
      surface: 50,
      frais_notaire: 8000,
      travaux: 0,
      frais_agence: 0,
      type_bien: 'appartement',
    },
    financement: { apport: 20000, taux_interet: 3.5, duree_emprunt: 20, assurance_pret: 0.3 },
    exploitation: {
      loyer_mensuel: 600,
      charges_copro: 50,
      taxe_fonciere: 500,
      assurance_pno: 150,
      gestion_locative: 8,
      provision_travaux: 5,
      type_location: 'nue',
    },
    structure: { type: 'nom_propre', tmi: 30, regime_fiscal: 'reel' },
    options: { generer_pdf: false, envoyer_email: false },
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retourne les résultats en cas de succès', async () => {
    const mockResponse = {
      success: true,
      resultats: { rentabilite: { brute: 7.2 } },
      pdf_url: null,
      alertes: [],
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    // Import dynamique pour que le mock soit actif
    const { calculateRentability } = await import('@/lib/api');
    const result = await calculateRentability(mockFormData as never);

    expect(result.resultats).toEqual(mockResponse.resultats);
    expect(result.pdfUrl).toBeNull();
    expect(result.alertes).toEqual([]);
  });

  it("lance ApiRequestError en cas d'erreur HTTP", async () => {
    const mockResponse = {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Données invalides' },
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve(mockResponse),
    });

    const { calculateRentability } = await import('@/lib/api');

    await expect(calculateRentability(mockFormData as never)).rejects.toThrow(ApiRequestError);
  });

  it('lance une erreur réseau quand fetch échoue', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new TypeError('Failed to fetch')
    );

    const { calculateRentability } = await import('@/lib/api');

    await expect(calculateRentability(mockFormData as never)).rejects.toThrow(ApiRequestError);
  });
});

// =============================================================================
// downloadPdf (avec mock fetch)
// =============================================================================
describe('downloadPdf', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retourne un blob en cas de succès', async () => {
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    const { downloadPdf } = await import('@/lib/api');
    const result = await downloadPdf('https://example.com/test.pdf');

    expect(result).toBeInstanceOf(Blob);
  });

  it("lance ApiRequestError en cas d'erreur HTTP", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { downloadPdf } = await import('@/lib/api');

    await expect(downloadPdf('https://example.com/missing.pdf')).rejects.toThrow(ApiRequestError);
  });
});
