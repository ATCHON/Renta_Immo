// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDownloadPdf } from '@/hooks/useDownloadPdf';

// ─── Setup ────────────────────────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Spies sur URL (sans remplacer l'objet entier)
let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

// Réponse PDF factice (blob simple)
function makePdfResponse(): Response {
  // On mock response.blob() directement pour éviter les problèmes jsdom
  const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
  const response = {
    ok: true,
    status: 200,
    blob: vi.fn().mockResolvedValue(mockBlob),
    json: vi.fn(),
  } as unknown as Response;
  return response;
}

function makeErrorResponse(status: number, message: string): Response {
  return {
    ok: false,
    status,
    json: vi.fn().mockResolvedValue({ error: { message } }),
    blob: vi.fn(),
  } as unknown as Response;
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_FORM_DATA = {
  bien: { type_bien: 'appartement' as const, prix_achat: 200000 },
  financement: {},
  exploitation: {},
  options: {},
  structure: { type: 'nom_propre' as const },
} as never;

const MOCK_RESULTATS = {
  rentabilite: { brute: 6.0, nette: 5.0 },
  hcsf: {},
  cashflow: { mensuel: 100 },
  fiscalite: {},
  synthese: { score_global: 72 },
  projection: {},
} as never;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useDownloadPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retourne status idle et une fonction downloadPdf initialement', () => {
    const { result } = renderHook(() => useDownloadPdf());
    expect(result.current.status).toBe('idle');
    expect(typeof result.current.downloadPdf).toBe('function');
    expect(result.current.error).toBeNull();
  });

  it('possède une fonction reset', () => {
    const { result } = renderHook(() => useDownloadPdf());
    expect(typeof result.current.reset).toBe('function');
  });

  it('passe status à loading pendant le téléchargement', async () => {
    let resolveResponse!: (v: Response) => void;
    mockFetch.mockImplementation(
      () =>
        new Promise<Response>((res) => {
          resolveResponse = res;
        })
    );

    const { result } = renderHook(() => useDownloadPdf());

    act(() => {
      result.current.downloadPdf(MOCK_FORM_DATA, MOCK_RESULTATS);
    });

    expect(result.current.status).toBe('loading');

    // Résoudre pour éviter des fuites de promesses
    await act(async () => {
      resolveResponse(makePdfResponse());
    });
  });

  it('passe status à success après un téléchargement réussi', async () => {
    mockFetch.mockResolvedValue(makePdfResponse());

    // Monter le hook AVANT d'intercepter createElement
    const { result } = renderHook(() => useDownloadPdf());

    // Créer un vrai <a> (Node valide pour jsdom) mais avec click mocké
    const realAnchor = document.createElement('a');
    const clickSpy = vi.spyOn(realAnchor, 'click').mockImplementation(() => {});
    const origCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string, ...args: unknown[]) => {
        if (tag === 'a') return realAnchor;
        return origCreateElement(tag, ...(args as []));
      });

    await act(async () => {
      await result.current.downloadPdf(MOCK_FORM_DATA, MOCK_RESULTATS);
    });

    expect(result.current.status).toBe('success');
    expect(result.current.error).toBeNull();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });

  it('passe status à error si la réponse HTTP est une erreur', async () => {
    mockFetch.mockResolvedValue(makeErrorResponse(500, 'PDF generation failed'));

    const { result } = renderHook(() => useDownloadPdf());

    await act(async () => {
      await result.current.downloadPdf(MOCK_FORM_DATA, MOCK_RESULTATS);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeTruthy();
  });

  it('passe status à error si fetch lève une exception réseau', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDownloadPdf());

    await act(async () => {
      await result.current.downloadPdf(MOCK_FORM_DATA, MOCK_RESULTATS);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('Network error');
  });

  it('reset remet status à idle et error à null', async () => {
    mockFetch.mockRejectedValue(new Error('Erreur réseau'));

    const { result } = renderHook(() => useDownloadPdf());

    await act(async () => {
      await result.current.downloadPdf(MOCK_FORM_DATA, MOCK_RESULTATS);
    });

    expect(result.current.status).toBe('error');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });
});
