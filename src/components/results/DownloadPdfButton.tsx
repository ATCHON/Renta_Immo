'use client';

import React from 'react';
import { Download, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDownloadPdf } from '@/hooks/useDownloadPdf';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

interface DownloadPdfButtonProps {
  formData: CalculateurFormData;
  resultats: CalculResultats;
  disabled?: boolean;
  className?: string;
}

export function DownloadPdfButton({
  formData,
  resultats,
  disabled = false,
  className = '',
}: DownloadPdfButtonProps) {
  const { downloadPdf, status, error, reset } = useDownloadPdf();

  const handleClick = async () => {
    if (status === 'loading' || status === 'success') return;
    if (status === 'error') reset();
    await downloadPdf(formData, resultats);
  };

  const isDisabled = disabled || status === 'loading';

  const statusConfig = {
    idle: {
      icon: <Download className="h-4 w-4" />,
      label: 'Télécharger PDF',
      ariaLabel: 'Télécharger le rapport PDF',
      style: 'bg-primary text-on-primary hover:bg-primary/90',
    },
    loading: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      label: 'Génération…',
      ariaLabel: 'Génération du PDF en cours',
      style: 'bg-primary/70 text-on-primary cursor-wait',
    },
    success: {
      icon: <Check className="h-4 w-4" />,
      label: 'Téléchargé !',
      ariaLabel: 'PDF téléchargé avec succès',
      style: 'bg-primary text-on-primary',
    },
    error: {
      icon: <AlertCircle className="h-4 w-4" />,
      label: 'Réessayer',
      ariaLabel: 'Erreur de génération, cliquez pour réessayer',
      style: 'bg-error text-on-error',
    },
  } as const;

  const config = statusConfig[status];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={config.ariaLabel}
        className={cn(
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-full',
          'text-sm font-bold tracking-wide',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          config.style,
          className
        )}
      >
        {config.icon}
        {config.label}
      </button>

      {status === 'error' && error && (
        <div className="absolute top-full left-0 mt-2 px-3 py-1.5 bg-error-container text-on-error-container text-xs rounded-lg shadow-lg max-w-xs z-10">
          {error}
        </div>
      )}
    </div>
  );
}
