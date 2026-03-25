'use client';

/**
 * UX-S02a — Layout split-screen du simulateur
 *
 * Desktop (≥ 1024px) :
 *   - Sidebar gauche 340px : ResultsAnchor sticky
 *   - Contenu droit scrollable
 *
 * Mobile (< 1024px) :
 *   - Layout pleine largeur
 *   - ResultsAnchor en panneau glassmorphism fixé en bas
 *
 * Référence : simulateur_immobilier_unifi/code.html
 */

import type { ReactNode } from 'react';
import { ResultsAnchor, type SidebarStep } from './ResultsAnchor';

interface SimulatorLayoutProps {
  children: ReactNode;
  currentStep: SidebarStep;
}

export function SimulatorLayout({ children, currentStep }: SimulatorLayoutProps) {
  return (
    <>
      {/* Desktop : split-screen grid */}
      <div
        className="hidden lg:grid lg:grid-cols-[340px_1fr]"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        {/* Sidebar gauche — Results Anchor */}
        <aside
          className="bg-secondary-fixed border-r border-outline-variant/30 overflow-hidden h-full"
          aria-label="Résultats en temps réel"
        >
          <ResultsAnchor currentStep={currentStep} />
        </aside>

        {/* Contenu droit — Formulaire scrollable */}
        <div className="overflow-y-auto bg-surface h-full">{children}</div>
      </div>

      {/* Mobile : pleine largeur + panneau bas */}
      <div className="lg:hidden">
        {/* Contenu — padding-bottom pour éviter la superposition avec le panneau bas */}
        <div className="pb-28">{children}</div>

        {/* Panneau glassmorphism fixé en bas */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-outline-variant/20"
          aria-label="KPIs en temps réel"
          style={{ background: 'rgba(214, 230, 221, 0.92)' }}
        >
          <ResultsAnchor currentStep={currentStep} compact />
        </div>
      </div>
    </>
  );
}
