'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { TrendingUp, Landmark, ShieldCheck, BarChart3, LayoutGrid } from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/comment-ca-marche',
    label: "Vue d'ensemble",
    icon: LayoutGrid,
    exact: true,
  },
  {
    href: '/comment-ca-marche/scoring-rendement',
    label: 'Scoring & Rendement',
    icon: TrendingUp,
    exact: false,
  },
  {
    href: '/comment-ca-marche/financement-levier',
    label: 'Financement & Levier',
    icon: Landmark,
    exact: false,
  },
  {
    href: '/comment-ca-marche/fiscalite-normes',
    label: 'Fiscalité & Normes',
    icon: ShieldCheck,
    exact: false,
  },
  {
    href: '/comment-ca-marche/projections-dpe',
    label: 'Projections & DPE',
    icon: BarChart3,
    exact: false,
  },
];

export function CommentCaMarcheNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 pt-16 flex-col bg-secondary-fixed text-primary z-30">
        <div className="flex flex-col gap-1 py-8 flex-1">
          <div className="px-6 mb-4">
            <p className="font-headline font-extrabold text-primary text-base tracking-tight">
              Comment ça marche
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">Guide du moteur de calcul</p>
          </div>

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 py-3 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-white text-primary rounded-l-full ml-4 pl-4 shadow-sm font-semibold'
                    : 'text-on-surface/70 px-8 hover:bg-white/50 hover:text-primary'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="px-4 pb-8">
          <Link
            href="/calculateur?reset=true"
            className="btn-verdant w-full py-3 text-sm text-center block"
          >
            Démarrer une simulation
          </Link>
        </div>
      </aside>

      {/* Tabs mobile */}
      <nav className="md:hidden sticky top-16 z-20 bg-secondary-fixed border-b border-outline-variant/20 overflow-x-auto">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  active
                    ? 'bg-white text-primary shadow-sm font-semibold'
                    : 'text-on-surface/70 hover:bg-white/50'
                )}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
