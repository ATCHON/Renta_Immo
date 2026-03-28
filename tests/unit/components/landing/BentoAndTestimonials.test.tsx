// @vitest-environment jsdom
/**
 * NR-LANDING-01 — Tests de non-régression : Composants landing
 *
 * Contexte fix (2026-03-28) :
 *   - Correction de 4 erreurs react/no-unescaped-entities dans
 *     BentoFeatures.tsx et TestimonialsSection.tsx via &apos;
 *   - Ce test garantit que le contenu textuel reste correct après
 *     l'encodage HTML des apostrophes.
 *
 * Vérifie :
 *   - BentoFeatures : textes clés, apostrophes typographiques
 *   - TestimonialsSection : titre de section, contenu des témoignages
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BentoFeatures } from '@/components/landing/BentoFeatures';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';

// TestimonialsSection utilise next/image — mock minimal
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe('BentoFeatures — rendu et contenu (NR-LANDING-01)', () => {
  it('affiche le titre de section principal', () => {
    render(<BentoFeatures />);
    expect(screen.getByText(/Conçu pour la Performance/i)).toBeDefined();
  });

  it("affiche le texte avec apostrophe échappée : l'investisseur", () => {
    render(<BentoFeatures />);
    // Régression : &apos; doit être rendu comme ' dans le DOM
    expect(document.body.textContent).toContain("l'investisseur");
  });

  it("affiche le texte avec apostrophe échappée : l'impact", () => {
    render(<BentoFeatures />);
    expect(document.body.textContent).toContain("l'impact");
  });

  it("affiche le texte avec apostrophe échappée : d'épargne", () => {
    render(<BentoFeatures />);
    expect(document.body.textContent).toContain("d'épargne");
  });

  it('affiche les 3 cartes du bento grid', () => {
    render(<BentoFeatures />);
    expect(screen.getByText(/Cartographie des rendements/i)).toBeDefined();
    expect(screen.getByText(/Optimisation fiscale/i)).toBeDefined();
    expect(screen.getByText(/Projections patrimoniales/i)).toBeDefined();
  });
});

describe('TestimonialsSection — rendu et contenu (NR-LANDING-01)', () => {
  it("affiche le titre avec apostrophe échappée : L'outil", () => {
    render(<TestimonialsSection />);
    // Régression : &apos; doit être rendu comme ' dans le DOM
    expect(document.body.textContent).toContain("L'outil choisi par les investisseurs sérieux");
  });

  it('affiche les 2 témoignages fictifs', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText('Alexandre Thorneau')).toBeDefined();
    expect(screen.getByText('Éléna Rousseau')).toBeDefined();
  });

  it('affiche les rôles des témoins', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText('Investisseur, 12 biens en portefeuille')).toBeDefined();
    expect(screen.getByText('Conseillère en gestion de patrimoine')).toBeDefined();
  });
});
