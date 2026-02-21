'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

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
}

export function SideNavigation({
  items,
  activeId,
  className,
  onItemClick,
  title = 'Sommaire',
}: SideNavigationProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Gérer le clic sur un élément
  const handleItemClick = (id: string, onClick?: () => void) => {
    if (onClick) onClick();
    if (onItemClick) onItemClick(id);
    setIsOpenMobile(false);
  };

  // Trouver l'élément actif actuel pour le menu mobile
  const currentItem = activeId
    ? items.flatMap((i) => (i.subgroups ? [i, ...i.subgroups] : [i])).find((i) => i.id === activeId)
    : items.find((i) => i.status === 'current') || items[0];

  const renderDesktopMenu = () => (
    <div className="hidden lg:block w-64 shrink-0 max-h-[calc(100vh-4rem)] overflow-y-auto pb-4 custom-scrollbar">
      <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-6 px-4">
        {title}
      </h3>
      <nav className="space-y-1 relative before:absolute before:inset-y-0 before:left-4 before:w-[2px] before:bg-sand/30">
        {items.map((item) => {
          const isActive = activeId === item.id || item.status === 'current';
          const isCompleted = item.status === 'completed';
          const isUpcoming = item.status === 'upcoming';

          return (
            <div key={item.id} className="relative z-10 w-full pl-10 py-3">
              {/* Point indicateur */}
              <div
                className={cn(
                  'absolute left-[13px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-all duration-300',
                  isActive && 'bg-forest ring-4 ring-forest/20 w-3.5 h-3.5 left-3',
                  isCompleted && 'bg-forest/60',
                  isUpcoming && 'bg-sand',
                  !item.status &&
                    (activeId === item.id
                      ? 'bg-forest ring-4 ring-forest/20 w-3.5 h-3.5 left-3'
                      : 'bg-sand')
                )}
              />
              {isActive && (
                <div className="absolute inset-y-1 left-2 right-2 bg-forest/5 rounded-lg -z-10" />
              )}

              <button
                onClick={() => handleItemClick(item.id, item.onClick)}
                disabled={isUpcoming}
                className={cn(
                  'w-full text-left text-base font-medium transition-colors outline-none',
                  isActive ? 'text-forest font-bold' : 'text-pebble hover:text-charcoal',
                  isUpcoming && 'opacity-50 cursor-not-allowed hover:text-pebble'
                )}
              >
                {item.label}
              </button>

              {/* Sous-groupes éventuels */}
              {item.subgroups && item.subgroups.length > 0 && (
                <div className="mt-2 pl-4 space-y-2 border-l-2 border-sand/30 ml-1">
                  {item.subgroups.map((sub) => {
                    const isSubActive = activeId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleItemClick(sub.id, sub.onClick)}
                        className={cn(
                          'block w-full text-left text-xs transition-colors outline-none py-1',
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
    </div>
  );

  const renderMobileMenu = () => (
    <div className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-sand/30 px-4 py-3 -mx-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-pebble uppercase tracking-widest">{title}</span>
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="flex items-center gap-2 text-sm font-bold text-forest bg-forest/5 px-3 py-1.5 rounded-full"
        >
          <span className="truncate max-w-[200px]">{currentItem?.label || title}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-300',
              isOpenMobile && 'rotate-180'
            )}
          />
        </button>
      </div>

      {isOpenMobile && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-sand/30 shadow-lg animate-in slide-in-from-top-2 max-h-[60vh] overflow-y-auto">
          <nav className="py-2">
            {items.map((item) => {
              const isActive = activeId === item.id || item.status === 'current';
              const isUpcoming = item.status === 'upcoming';
              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id, item.onClick)}
                    disabled={isUpcoming}
                    className={cn(
                      'w-full text-left px-4 py-3 text-sm flex items-center justify-between border-b border-sand/10 last:border-0',
                      isActive ? 'bg-forest/5 text-forest font-bold' : 'text-charcoal',
                      isUpcoming && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span>{item.label}</span>
                    {isActive && <Check className="w-4 h-4 text-forest" />}
                  </button>
                  {/* Ne pas afficher les sous-menu en mobile pour simplifier, sauf si nécessaire */}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      {renderMobileMenu()}
      {renderDesktopMenu()}
    </div>
  );
}
