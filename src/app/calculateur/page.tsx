'use client';

import Link from 'next/link';
import { FormWizard } from '@/components/forms';

export default function CalculateurPage() {
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
