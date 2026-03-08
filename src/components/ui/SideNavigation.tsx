'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';

export interface SideNavigationItem {
  id: string;
  label: string;
  status?: 'current' | 'completed' | 'upcoming';
  onClick?: () => void;
  subgroups?: SideNavigationItem[];
}

interface SideNavigationProps {
  items: SideNavigationItem[];
  activeId?: string;
  className?: string;
  onItemClick?: (id: string) => void;
  title?: string;
  footer?: React.ReactNode;
}

// ── Partie Desktop : aside sticky ─────────────────────────────────────────────
export function SideNavigationDesktop({
  items,
  activeId,
  className,
  onItemClick,
  title = 'Sommaire',
  footer,
}: SideNavigationProps) {
  const handleItemClick = (id: string, onClick?: () => void) => {
    if (onClick) onClick();
    if (onItemClick) onItemClick(id);
  };

  return (
    <aside
      className={cn('hidden lg:block w-52 shrink-0 sticky self-start', className)}
      style={{ top: 'var(--header-h-desktop)' }}
    >
      <p className="text-[10px] font-black text-pebble uppercase tracking-widest mb-3 px-2">
        {title}
      </p>
      <nav role="navigation" aria-label={title} className="space-y-0.5">
        {items.map((item) => {
          const isActive = activeId === item.id || item.status === 'current';
          const isCompleted = item.status === 'completed';
          const isUpcoming = item.status === 'upcoming';

          return (
            <div key={item.id}>
              <button
                onClick={() => !isUpcoming && handleItemClick(item.id, item.onClick)}
                disabled={isUpcoming}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-full text-left text-xs px-3 py-2 rounded-lg transition-all duration-150 font-medium flex items-center gap-2',
                  isActive
                    ? 'bg-forest/10 text-forest font-bold border-l-2 border-forest pl-[10px]'
                    : isCompleted
                      ? 'text-pebble hover:text-charcoal hover:bg-sand/40'
                      : isUpcoming
                        ? 'text-pebble/40 cursor-not-allowed'
                        : 'text-pebble hover:text-charcoal hover:bg-sand/40'
                )}
              >
                {isCompleted && !isActive && <Check className="h-3 w-3 text-forest/60 shrink-0" />}
                <span>{item.label}</span>
              </button>

              {/* Sous-groupes (panel résultats) */}
              {item.subgroups && item.subgroups.length > 0 && isActive && (
                <div className="ml-[13px] pl-3 space-y-0.5 border-l border-forest/20 mt-0.5 mb-1">
                  {item.subgroups.map((sub) => {
                    const isSubActive = activeId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleItemClick(sub.id, sub.onClick)}
                        aria-current={isSubActive ? 'page' : undefined}
                        className={cn(
                          'block w-full text-left text-[11px] px-2 py-1 rounded transition-colors',
                          isSubActive
                            ? 'text-forest font-semibold'
                            : 'text-stone hover:text-charcoal'
                        )}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="mt-6 w-full text-xs text-pebble hover:text-forest transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-sand/40"
      >
        <ChevronRight className="h-3 w-3 -rotate-90" />
        Haut de page
      </button>

      {footer && <div className="mt-4">{footer}</div>}
    </aside>
  );
}

// ── Partie Mobile : barre sticky « En savoir plus » style ─────────────────────
export function SideNavigationMobile({
  items,
  activeId,
  onItemClick,
  title = 'Navigation',
}: SideNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (id: string, onClick?: () => void) => {
    if (onClick) onClick();
    if (onItemClick) onItemClick(id);
    setIsOpen(false);
  };

  const currentItem = activeId
    ? items.flatMap((i) => (i.subgroups ? [i, ...i.subgroups] : [i])).find((i) => i.id === activeId)
    : items.find((i) => i.status === 'current') || items[0];

  return (
    <div
      className="lg:hidden sticky z-20 bg-white/95 backdrop-blur border-b border-sand/60 px-4 py-2"
      style={{ top: 'var(--header-h-mobile)' }}
    >
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between w-full"
      >
        <span className="text-xs font-bold text-pebble uppercase tracking-widest">
          {currentItem?.label ?? title}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-pebble transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <nav role="navigation" aria-label={title} className="mt-2 pb-2 grid grid-cols-2 gap-1">
          {items.map((item) => {
            const isActive = activeId === item.id || item.status === 'current';
            const isUpcoming = item.status === 'upcoming';
            return (
              <button
                key={item.id}
                onClick={() => !isUpcoming && handleItemClick(item.id, item.onClick)}
                disabled={isUpcoming}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'text-left text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5',
                  isActive
                    ? 'bg-forest/10 text-forest font-bold'
                    : isUpcoming
                      ? 'text-pebble/40 cursor-not-allowed'
                      : 'text-pebble hover:bg-sand/30'
                )}
              >
                {item.status === 'completed' && !isActive && (
                  <Check className="h-3 w-3 text-forest/60 shrink-0" />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

// ── Composant combiné (rétrocompatible) ────────────────────────────────────────
// Utilisé dans FormWizard où la nav mobile est intégrée dans le layout (pas en sticky global)
export function SideNavigation({
  items,
  activeId,
  className,
  onItemClick,
  title = 'Sommaire',
}: SideNavigationProps) {
  return (
    <>
      <SideNavigationMobile
        items={items}
        activeId={activeId}
        onItemClick={onItemClick}
        title={title}
      />
      <SideNavigationDesktop
        items={items}
        activeId={activeId}
        className={className}
        onItemClick={onItemClick}
        title={title}
      />
    </>
  );
}
