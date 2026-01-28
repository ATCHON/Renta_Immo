'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calculator, Info, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const navItems = [
    {
        name: 'Calculateur',
        href: '/',
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                        {navItems.map((item) => (
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

                    <div className="hidden md:flex items-center">
                        <Link href="/" passHref>
                            <Button variant="primary" size="sm">
                                Nouveau calcul
                            </Button>
                        </Link>
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
                <div className="md:hidden border-t border-sand bg-white animate-in slide-in-from-top-2 duration-300">
                    <div className="px-4 py-6 space-y-2">
                        {navItems.map((item) => (
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
                                {item.name}
                            </Link>
                        ))}
                        <div className="pt-6 px-2">
                            <Link href="/" onClick={() => setIsMenuOpen(false)} passHref>
                                <Button variant="primary" className="w-full py-6 text-lg rounded-2xl shadow-lg shadow-forest/10">
                                    Nouveau calcul
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
