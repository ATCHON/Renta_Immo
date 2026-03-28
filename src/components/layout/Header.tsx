'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { APP_NAME } from '@/config/app';
import { cn } from '@/lib/utils';
import { Calculator, Info, Menu, X, LogOut, User, FolderOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useCalculateurStore } from '@/stores/calculateur.store';

const navItems = [
  {
    name: 'Simulateur',
    href: '/calculateur?reset=true',
    icon: Calculator,
  },
  {
    name: 'Comment ça marche',
    href: '/en-savoir-plus',
    icon: Info,
  },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
          router.refresh();
        },
      },
    });
  };

  const resetStore = useCalculateurStore((state) => state.reset);
  const handleNewCalculation = () => {
    resetStore();
    router.push('/calculateur');
  };

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const currentNavItems = [
    ...navItems,
    ...(session
      ? [
          {
            name: 'Mes simulations',
            href: '/simulations',
            icon: FolderOpen,
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-primary">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {currentNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href ? 'text-primary' : 'text-on-surface-variant'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isPending ? (
              <div className="w-8 h-8 rounded-full bg-secondary-container animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/account"
                  className="flex items-center space-x-2 text-sm font-medium text-on-surface hover:text-primary transition-colors"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'Avatar'}
                      width={32}
                      height={32}
                      className="rounded-full border border-outline-variant object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="hidden lg:inline">{session.user.name}</span>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-on-surface-variant hover:text-red-600 border-outline-variant"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              !pathname.startsWith('/auth/') && (
                <Link href="/auth/login" passHref>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="border-outline-variant text-on-surface hover:bg-secondary-container/30"
                  >
                    Connexion
                  </Button>
                </Link>
              )
            )}

            <Button variant="primary" size="sm" onClick={handleNewCalculation}>
              Nouvelle simulation
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-on-surface-variant hover:text-on-surface transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 md:hidden bg-white overflow-y-auto border-t border-outline-variant h-[calc(100dvh-4rem)]">
          <div className="px-4 py-6 space-y-2 pb-20">
            {session && (
              <div className="flex items-center space-x-4 px-4 py-4 mb-2 bg-secondary-container/20 rounded-xl">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Avatar'}
                    width={40}
                    height={40}
                    className="rounded-full border border-outline-variant object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-semibold text-on-surface">{session.user.name}</span>
                  <span className="text-xs text-on-surface-variant">{session.user.email}</span>
                </div>
              </div>
            )}

            {currentNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'flex items-center px-4 py-4 text-lg font-medium transition-all rounded-xl',
                  pathname === item.href
                    ? 'text-primary bg-primary/5 shadow-sm'
                    : 'text-on-surface-variant hover:bg-secondary-container/30'
                )}
              >
                <item.icon className="mr-4 h-5 w-5" />
                <span className="flex-1">{item.name}</span>
              </Link>
            ))}

            <div className="pt-4 space-y-3">
              <Button
                variant="primary"
                className="w-full py-6 text-lg rounded-2xl shadow-lg shadow-primary/10"
                onClick={() => {
                  handleNewCalculation();
                  setIsMenuOpen(false);
                }}
              >
                Nouvelle simulation
              </Button>

              {session ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-6 text-lg rounded-2xl border-outline-variant text-on-surface-variant flex items-center justify-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Se déconnecter
                </Button>
              ) : (
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} passHref>
                  <Button
                    variant="secondary"
                    className="w-full py-6 text-lg rounded-2xl border-outline-variant text-on-surface"
                  >
                    Se connecter
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
