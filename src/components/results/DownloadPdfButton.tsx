'use client';

import React from 'react';
import { useDownloadPdf } from '@/hooks/useDownloadPdf';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

interface DownloadPdfButtonProps {
    formData: CalculateurFormData;
    resultats: CalculResultats;
    disabled?: boolean;
    className?: string;
}

/**
 * Button component for downloading PDF simulation reports
 * Displays different states: idle, loading, success, error
 */
export function DownloadPdfButton({
    formData,
    resultats,
    disabled = false,
    className = '',
}: DownloadPdfButtonProps) {
    const { downloadPdf, status, error, reset } = useDownloadPdf();

    const handleClick = async () => {
        if (status === 'error') {
            reset();
        }
        await downloadPdf(formData, resultats);
    };

    const isDisabled = disabled || status === 'loading';

    // Button content based on status
    const getButtonContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Génération...
                    </>
                );
            case 'success':
                return (
                    <>
                        <svg
                            className="-ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        Téléchargé !
                    </>
                );
            case 'error':
                return (
                    <>
                        <svg
                            className="-ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Réessayer
                    </>
                );
            default:
                return (
                    <>
                        <svg
                            className="-ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Télécharger PDF
                    </>
                );
        }
    };

    // Dynamic class based on status
    const getStatusClass = () => {
        switch (status) {
            case 'success':
                return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
            case 'error':
                return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
            default:
                return 'btn-outline';
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleClick}
                disabled={isDisabled}
                className={`
          inline-flex items-center justify-center
          px-4 py-2 rounded-lg
          text-sm font-medium
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getStatusClass()}
          ${className}
        `}
                aria-label={
                    status === 'loading'
                        ? 'Génération du PDF en cours'
                        : status === 'success'
                            ? 'PDF téléchargé avec succès'
                            : status === 'error'
                                ? 'Erreur de génération, cliquez pour réessayer'
                                : 'Télécharger le rapport PDF'
                }
            >
                {getButtonContent()}
            </button>

            {/* Error tooltip */}
            {status === 'error' && error && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 text-red-700 text-xs rounded shadow-lg max-w-xs z-10">
                    {error}
                </div>
            )}
        </div>
    );
}
