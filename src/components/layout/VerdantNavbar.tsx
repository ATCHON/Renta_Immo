'use client';

/**
 * UX-S01 — Navbar glassmorphism « Petra Nova »
 *
 * Utilisée uniquement dans `src/app/page.tsx` pour l'instant.
 * L'intégration globale dans layout.tsx se fera en Phase 5 (UX-S05).
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { useCalculateurStore } from '@/stores/calculateur.store';

export function VerdantNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = authClient.useSession();
  const resetStore = useCalculateurStore((state) => state.reset);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleNewSimulation = () => {
    resetStore();
    router.push('/calculateur');
  };

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled ? 'bg-white/90 backdrop-blur-2xl shadow-sm' : 'bg-white/70 backdrop-blur-xl'
      )}
      aria-label="Navigation principale"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-headline font-extrabold text-xl tracking-tighter text-primary"
        >
          Petra Nova
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/calculateur"
            className={cn(
              'font-headline font-semibold tracking-tight text-sm transition-colors duration-200',
              pathname === '/calculateur'
                ? 'text-primary border-b-2 border-primary pb-0.5'
                : 'text-on-surface/60 hover:text-primary'
            )}
          >
            Simulateur
          </Link>
          <Link
            href="/comment-ca-marche"
            className={cn(
              'font-headline font-semibold tracking-tight text-sm transition-colors duration-200',
              pathname === '/comment-ca-marche'
                ? 'text-primary border-b-2 border-primary pb-0.5'
                : 'text-on-surface/60 hover:text-primary'
            )}
          >
            Comment ça marche
          </Link>
          {session && (
            <Link
              href="/simulations"
              className={cn(
                'font-headline font-semibold tracking-tight text-sm transition-colors duration-200 flex items-center gap-1.5',
                pathname === '/simulations'
                  ? 'text-primary border-b-2 border-primary pb-0.5'
                  : 'text-on-surface/60 hover:text-primary'
              )}
            >
              <FolderOpen className="h-4 w-4" strokeWidth={1.5} />
              Mes simulations
            </Link>
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {!session && (
            <Link
              href="/auth/login"
              className="font-headline font-semibold text-sm text-on-surface/60 hover:text-primary transition-colors"
            >
              Connexion
            </Link>
          )}
          <button onClick={handleNewSimulation} className="btn-verdant text-sm px-5 py-2.5">
            Nouvelle simulation
          </button>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex md:hidden items-center justify-center p-2 rounded-lg text-on-surface/60 hover:text-primary transition-colors"
          aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-outline-variant/20 px-6 py-6 space-y-4">
          <Link
            href="/calculateur"
            className="block font-headline font-semibold text-base text-on-surface hover:text-primary transition-colors py-2"
          >
            Simulateur
          </Link>
          <Link
            href="/comment-ca-marche"
            className="block font-headline font-semibold text-base text-on-surface hover:text-primary transition-colors py-2"
          >
            Comment ça marche
          </Link>
          {session && (
            <Link
              href="/simulations"
              className="flex items-center gap-2 font-headline font-semibold text-base text-on-surface hover:text-primary transition-colors py-2"
            >
              <FolderOpen className="h-4 w-4" strokeWidth={1.5} />
              Mes simulations
            </Link>
          )}
          <div className="pt-2 space-y-3">
            <button onClick={handleNewSimulation} className="btn-verdant w-full py-3 text-base">
              Nouvelle simulation
            </button>
            {!session && (
              <Link
                href="/auth/login"
                className="block text-center font-headline font-semibold text-sm text-on-surface/60 hover:text-primary transition-colors py-2"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
