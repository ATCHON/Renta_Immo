'use client';

/**
 * UX-S01 — Masque le Header legacy sur la landing page (`/`).
 * La VerdantNavbar est rendue directement dans `page.tsx` de la landing.
 * Ce wrapper sera supprimé en Phase 5 (UX-S05) lors de la refonte globale du layout.
 */
import { usePathname } from 'next/navigation';
import { Header } from './Header';

const ROUTES_WITHOUT_HEADER: ReadonlySet<string> = new Set(['/']);

export function ConditionalHeader() {
  const pathname = usePathname();
  if (ROUTES_WITHOUT_HEADER.has(pathname)) return null;
  return <Header />;
}
