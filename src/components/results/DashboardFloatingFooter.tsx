'use client';

import { Share2 } from 'lucide-react';
import { APP_NAME } from '@/config/app';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { DownloadPdfButton } from './DownloadPdfButton';
import { SaveSimulationButton } from '../simulations/SaveSimulationButton';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

interface DashboardFloatingFooterProps {
  formData: CalculateurFormData;
  resultats: CalculResultats;
}

export function DashboardFloatingFooter({ formData, resultats }: DashboardFloatingFooterProps) {
  const handleShare = () => {
    // Basic share functionality via native API if available
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `Ma simulation ${APP_NAME}`,
          url: window.location.href,
        })
        .catch(console.error);
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success('Lien copié dans le presse-papiers'))
        .catch(() => toast.error('Impossible de copier le lien'));
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface/80 backdrop-blur-xl border border-outline-variant/30 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <Button
        variant="secondary"
        onClick={handleShare}
        className="rounded-full h-10 w-10 sm:h-12 sm:w-12 p-0 flex items-center justify-center shrink-0 border-outline-variant/50 bg-surface-container hover:bg-surface-container-high"
        title="Partager la simulation"
      >
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-on-surface" />
      </Button>

      <div className="h-6 sm:h-8 w-px bg-outline-variant/50 mx-1 sm:mx-2" />

      <SaveSimulationButton formData={formData} resultats={resultats} />

      <DownloadPdfButton
        formData={formData}
        resultats={resultats}
        className="shadow-none rounded-full h-10 sm:h-12 px-4 sm:px-6 bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm sm:text-base border-0"
      />
    </div>
  );
}
