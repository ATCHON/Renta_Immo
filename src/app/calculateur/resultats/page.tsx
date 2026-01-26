'use client';

import Link from 'next/link';
import { Dashboard } from '@/components/results';

export default function ResultatsPage() {
  return (
    <main className="min-h-screen py-8 px-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <Link
          href="/calculateur"
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
          Modifier le calcul
        </Link>
      </header>

      {/* Dashboard des résultats */}
      <Dashboard />
    </main>
  );
}
