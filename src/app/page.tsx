/**
 * UX-S01 — Landing Page « Petra Nova »
 * Refonte complète de la page d'accueil.
 * VerdantNavbar et VerdantFooter sont utilisés ici uniquement (pas encore dans layout.tsx).
 * L'intégration globale se fera en Phase 5 (UX-S05).
 */

import type { Metadata } from 'next';
import { VerdantNavbar } from '@/components/layout/VerdantNavbar';
import { VerdantFooter } from '@/components/layout/VerdantFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { BentoFeatures } from '@/components/landing/BentoFeatures';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { LandingCTA } from '@/components/landing/LandingCTA';

export const metadata: Metadata = {
  title: "Petra Nova — Simulateur d'investissement immobilier",
  description:
    'Analysez la rentabilité, le cashflow et la fiscalité de vos projets immobiliers. 6 régimes fiscaux, conformité HCSF, projections 20 ans.',
};

export default function HomePage() {
  return (
    <>
      <VerdantNavbar />
      <HeroSection />
      <BentoFeatures />
      <TestimonialsSection />
      <LandingCTA />
      <VerdantFooter />
    </>
  );
}
