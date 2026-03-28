// @vitest-environment jsdom
/**
 * NR-PAGES-01 — Tests de non-régression : Pages légales
 *
 * Contexte fix (2026-03-28) :
 *   - Correction de 12 erreurs react/no-unescaped-entities dans
 *     confidentialite/page.tsx et mentions-legales/page.tsx via &apos;
 *   - Ce test garantit que les apostrophes sont rendues correctement
 *     dans le DOM après l'encodage HTML.
 *
 * Vérifie (pour chaque page) :
 *   - Rendu sans crash
 *   - Titres principaux présents
 *   - Apostrophes correctement restituées dans le contenu textuel
 *   - Lien de retour à l'accueil présent
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mocks Next.js
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/config/app', () => ({
  APP_NAME: 'PetraNova',
}));

// Import différé après mocks
const { default: ConfidentialitePage } = await import('@/app/confidentialite/page');
const { default: MentionsLegalesPage } = await import('@/app/mentions-legales/page');

// --- Page Confidentialité ---

describe('ConfidentialitePage — rendu et apostrophes (NR-PAGES-01)', () => {
  it('affiche le titre principal', () => {
    render(<ConfidentialitePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText(/politique de confidentialité/i)).toBeDefined();
  });

  it("rend l'apostrophe dans 'd\u2019un compte' correctement", () => {
    render(<ConfidentialitePage />);
    expect(document.body.textContent).toContain("d'un compte");
  });

  it("rend l'apostrophe dans 'jusqu'à' correctement", () => {
    render(<ConfidentialitePage />);
    expect(document.body.textContent).toContain("jusqu'à");
  });

  it("rend l'apostrophe dans 'd'accès' correctement", () => {
    render(<ConfidentialitePage />);
    expect(document.body.textContent).toContain("d'accès");
  });

  it("rend l'apostrophe dans 'n'est déposé' correctement", () => {
    render(<ConfidentialitePage />);
    expect(document.body.textContent).toContain("n'est déposé");
  });

  it("affiche le lien Retour à l'accueil avec apostrophe correcte", () => {
    render(<ConfidentialitePage />);
    const link = screen.getByRole('link');
    expect(link.textContent).toContain("l'accueil");
    expect(link.getAttribute('href')).toBe('/');
  });

  it('affiche les 4 sections de contenu', () => {
    render(<ConfidentialitePage />);
    expect(screen.getByText(/Données collectées/i)).toBeDefined();
    expect(screen.getByText(/Utilisation des données/i)).toBeDefined();
    expect(screen.getByText(/Conservation/i)).toBeDefined();
    expect(screen.getByText(/Vos droits/i)).toBeDefined();
    expect(screen.getAllByText(/Cookies/i).length).toBeGreaterThan(0);
  });
});

// --- Page Mentions légales ---

describe('MentionsLegalesPage — rendu et apostrophes (NR-PAGES-01)', () => {
  it('affiche le titre principal', () => {
    render(<MentionsLegalesPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText(/mentions légales/i)).toBeDefined();
  });

  it("rend l'apostrophe dans 'd'investissement' correctement", () => {
    render(<MentionsLegalesPage />);
    expect(document.body.textContent).toContain("d'investissement");
  });

  it("rend l'apostrophe dans 'l'adresse' correctement", () => {
    render(<MentionsLegalesPage />);
    expect(document.body.textContent).toContain("l'adresse");
  });

  it("rend l'apostrophe dans 'L'ensemble' correctement", () => {
    render(<MentionsLegalesPage />);
    expect(document.body.textContent).toContain("L'ensemble");
  });

  it("rend l'apostrophe dans 'd'auteur' correctement", () => {
    render(<MentionsLegalesPage />);
    expect(document.body.textContent).toContain("d'auteur");
  });

  it("rend l'apostrophe dans 'L'éditeur' correctement", () => {
    render(<MentionsLegalesPage />);
    expect(document.body.textContent).toContain("L'éditeur");
  });

  it("affiche le lien Retour à l'accueil avec apostrophe correcte", () => {
    render(<MentionsLegalesPage />);
    const link = screen.getByRole('link');
    expect(link.textContent).toContain("l'accueil");
    expect(link.getAttribute('href')).toBe('/');
  });

  it('affiche les 4 sections de contenu', () => {
    render(<MentionsLegalesPage />);
    expect(screen.getAllByText(/Éditeur du site/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Hébergement/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Propriété intellectuelle/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Responsabilité/i).length).toBeGreaterThan(0);
  });
});
