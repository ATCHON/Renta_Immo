/**
 * UX-S01 — Landing Page « Petra Nova »
 * Refonte complète de la page d'accueil.
 * UX-S05 : VerdantNavbar et VerdantFooter sont désormais dans layout.tsx (global).
 */

import type { Metadata } from 'next';
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
      <HeroSection />
      <BentoFeatures />
      <TestimonialsSection />
      <LandingCTA />
    </>
  );
}
