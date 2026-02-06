'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calculator, Info, Menu, X, LogOut, User, FolderOpen, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useCalculateurStore } from '@/stores/calculateur.store';

const navItems = [
    {
        name: 'Calculateur',
        href: '/calculateur',
        icon: Calculator,
    },
    {
        name: 'En savoir plus',
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
                    router.push("/");
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

    const currentNavItems = [
        ...navItems,
        ...(session ? [{
            name: 'Mes simulations',
            href: '/simulations',
            icon: FolderOpen,
        }] : [])
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-sand bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold tracking-tight text-forest">
                                Renta<span className="text-charcoal">Immo</span>
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
                                    'text-sm font-medium transition-colors hover:text-forest',
                                    pathname === item.href ? 'text-forest' : 'text-pebble'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center space-x-4">
                        {isPending ? (
                            <div className="w-8 h-8 rounded-full bg-sand animate-pulse" />
                        ) : session ? (
                            <div className="flex items-center space-x-4">
                                <Link href="/account" className="flex items-center space-x-2 text-sm font-medium text-charcoal hover:text-forest transition-colors">
                                    {session.user.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt={session.user.name || "Avatar"}
                                            width={32}
                                            height={32}
                                            className="rounded-full border border-sand object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-forest" />
                                        </div>
                                    )}
                                    <span className="hidden lg:inline">{session.user.name}</span>
                                </Link>
                                <Button variant="secondary" size="sm" onClick={handleSignOut} className="text-pebble hover:text-red-600 border-sand">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Link href="/auth/login" passHref>
                                <Button variant="secondary" size="sm" className="border-sand text-charcoal hover:bg-sand/30">
                                    Connexion
                                </Button>
                            </Link>
                        )}

                        <Button variant="primary" size="sm" onClick={handleNewCalculation}>
                            Nouveau calcul
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-pebble hover:text-charcoal transition-colors focus:ring-2 focus:ring-forest focus:ring-offset-2"
                            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="fixed inset-x-0 top-16 bottom-0 z-40 md:hidden bg-white overflow-y-auto border-t border-sand animate-in slide-in-from-top-5 duration-300">
                    <div className="px-4 py-6 space-y-2 pb-20">
                        {session && (
                            <div className="flex items-center space-x-4 px-4 py-4 mb-2 bg-sand/20 rounded-xl">
                                {session.user.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || "Avatar"}
                                        width={40}
                                        height={40}
                                        className="rounded-full border border-sand object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-forest" />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-semibold text-charcoal">{session.user.name}</span>
                                    <span className="text-xs text-pebble">{session.user.email}</span>
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
                                        ? 'text-forest bg-forest/5 shadow-sm'
                                        : 'text-pebble hover:bg-sand/30'
                                )}
                            >
                                <item.icon className="mr-4 h-5 w-5" />
                                <span className="flex-1">{item.name}</span>
                            </Link>
                        ))}

                        <div className="pt-4 space-y-3">
                            <Button variant="primary" className="w-full py-6 text-lg rounded-2xl shadow-lg shadow-forest/10" onClick={() => { handleNewCalculation(); setIsMenuOpen(false); }}>
                                Nouveau calcul
                            </Button>

                            {session ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                                    className="w-full py-6 text-lg rounded-2xl border-sand text-pebble flex items-center justify-center gap-2"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Se déconnecter
                                </Button>
                            ) : (
                                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} passHref>
                                    <Button variant="secondary" className="w-full py-6 text-lg rounded-2xl border-sand text-charcoal">
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
