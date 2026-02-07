'use client';

import { useEffect } from 'react';

export default function CalculateurError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Calculateur error:', error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur dans le calculateur</h2>
                <p className="text-slate-500 text-sm mb-6">
                    Le calcul n&apos;a pas pu aboutir. Vos données sont conservées.
                </p>
                <button
                    onClick={reset}
                    className="px-6 py-2.5 bg-forest text-white font-medium rounded-xl hover:bg-forest-dark transition-colors"
                >
                    Réessayer le calcul
                </button>
            </div>
        </div>
    );
}
