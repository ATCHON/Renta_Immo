'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SimulationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Simulations error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur de chargement</h2>
        <p className="text-slate-500 text-sm mb-6">
          Impossible de charger vos simulations pour le moment.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-forest text-white font-medium rounded-xl hover:bg-forest-dark transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
