'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormWizard } from '@/components/forms';
import { useCalculateurStore } from '@/stores/calculateur.store';

export default function CalculateurPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reset = useCalculateurStore((state) => state.reset);

  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      reset();
      // Nettoyer l'URL pour éviter un reset au refresh
      router.replace('/calculateur');
    }
  }, [searchParams, reset, router]);
  return (
    <main className="min-h-screen py-8 px-4">
      {/* Header */}
      <header className="max-w-2xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour à l&apos;accueil
        </Link>
      </header>

      {/* Formulaire */}
      <FormWizard />
    </main>
  );
}
