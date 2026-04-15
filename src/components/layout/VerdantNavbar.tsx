'use client';

/**
 * UX-S05 — Navbar glassmorphism « Petra Nova » — Intégration globale
 *
 * Remplace Header.tsx dans src/app/layout.tsx.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, FolderOpen, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';

/** Retourne les initiales (max 2 caractères) depuis un nom complet */
function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function VerdantNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();

  // Fermer le menu utilisateur au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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
              pathname.startsWith('/comment-ca-marche')
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
          {!session ? (
            <Link
              href="/auth/login"
              className="font-headline font-semibold text-sm text-on-surface/60 hover:text-primary transition-colors"
            >
              Connexion
            </Link>
          ) : (
            /* Avatar utilisateur + menu déroulant */
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-primary/5 transition-colors"
                aria-label="Menu utilisateur"
                aria-expanded={isUserMenuOpen}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-headline font-bold select-none">
                  {getInitials(session.user.name)}
                </span>
                <span className="font-headline font-semibold text-sm text-on-surface/80 max-w-[120px] truncate">
                  {session.user.name?.split(' ')[0] ?? session.user.email}
                </span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-on-surface/40 transition-transform duration-200',
                    isUserMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-outline-variant/20 py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant/10 mb-1">
                    <p className="font-headline font-semibold text-sm text-on-surface truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-on-surface/50 truncate">{session.user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-headline font-medium text-on-surface/70 hover:text-error hover:bg-error/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}
          <Link
            href="/calculateur?reset=true"
            className={cn(
              'font-headline font-semibold tracking-tight text-sm transition-colors duration-200',
              pathname === '/calculateur'
                ? 'text-primary border-b-2 border-primary pb-0.5'
                : 'text-on-surface/60 hover:text-primary'
            )}
          >
            Nouvelle simulation
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
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
            <Link
              href="/calculateur?reset=true"
              className="block font-headline font-semibold text-base text-on-surface hover:text-primary transition-colors py-2"
            >
              Nouvelle simulation
            </Link>
            {!session ? (
              <Link
                href="/auth/login"
                className="block text-center font-headline font-semibold text-sm text-on-surface/60 hover:text-primary transition-colors py-2"
              >
                Connexion
              </Link>
            ) : (
              <div className="pt-2 border-t border-outline-variant/20">
                <div className="flex items-center gap-3 py-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-headline font-bold select-none shrink-0">
                    {getInitials(session.user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-headline font-semibold text-sm text-on-surface truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-on-surface/50 truncate">{session.user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full py-2 font-headline font-semibold text-sm text-on-surface/60 hover:text-error transition-colors"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
