'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, X, Copy, Check, Loader2 } from 'lucide-react';
import { APP_NAME } from '@/config/app';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { DownloadPdfButton } from './DownloadPdfButton';
import { SaveSimulationButton } from '../simulations/SaveSimulationButton';
import { useCalculateurStore } from '@/stores/calculateur.store';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

interface DashboardFloatingFooterProps {
  formData: CalculateurFormData;
  resultats: CalculResultats;
}

export function DashboardFloatingFooter({ formData, resultats }: DashboardFloatingFooterProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const activeScenario = useCalculateurStore((s) => s.getActiveScenario());

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleOpenShare = () => {
    setIsShareOpen(true);
  };

  const handleGenerateLink = async () => {
    const dbId = activeScenario?.dbId;
    if (!dbId) {
      toast.error("Sauvegardez d'abord la simulation pour générer un lien.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch(`/api/simulations/${dbId}/share`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error('Erreur serveur');

      const fullUrl = `${window.location.origin}${json.data.sharePath}`;
      setShareUrl(fullUrl);
    } catch {
      toast.error('Impossible de générer le lien de partage.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success('Lien copié dans le presse-papiers');
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const handleCloseShare = () => {
    setIsShareOpen(false);
    setShareUrl(null);
    setIsCopied(false);
  };

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface/80 backdrop-blur-xl border border-outline-variant/30 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-10 fade-in duration-500">
        <Button
          variant="secondary"
          onClick={handleOpenShare}
          className="rounded-full h-10 w-10 sm:h-12 sm:w-12 p-0 flex items-center justify-center shrink-0 border-outline-variant/50 bg-surface-container hover:bg-surface-container-high"
          title="Partager la simulation"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-on-surface-variant" strokeWidth={1.5} />
        </Button>

        <div className="h-6 sm:h-8 w-px bg-outline-variant/50 mx-1 sm:mx-2" />

        <SaveSimulationButton formData={formData} resultats={resultats} />

        <DownloadPdfButton
          formData={formData}
          resultats={resultats}
          className="shadow-none rounded-full h-10 sm:h-12 px-4 sm:px-6 bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm sm:text-base border-0"
        />
      </div>

      {/* Dialog de partage */}
      {isShareOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={handleCloseShare}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline font-extrabold text-lg text-on-surface">
                  Partager la simulation
                </h3>
                <p className="text-sm text-on-surface/60 font-label mt-0.5">
                  Générez un lien public consultable sans compte {APP_NAME}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseShare}
                className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-on-surface/60" />
              </button>
            </div>

            {!activeScenario?.dbId && (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 text-sm text-on-surface/70 font-label">
                Sauvegardez d&apos;abord la simulation pour pouvoir la partager.
              </div>
            )}

            {/* Génération du lien */}
            {!shareUrl ? (
              <button
                type="button"
                onClick={handleGenerateLink}
                disabled={isGenerating || !activeScenario?.dbId}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-headline font-bold rounded-xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Génération…
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Générer le lien de partage
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-surface-container rounded-xl p-3 border border-outline-variant/30">
                  <span className="flex-1 text-sm font-label text-on-surface/80 truncate">
                    {shareUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-headline font-bold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copier
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-on-surface/40 font-label text-center">
                  Ce lien permet une consultation en lecture seule. Les personnes avec un compte
                  peuvent cloner la simulation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
