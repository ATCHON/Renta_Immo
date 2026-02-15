'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ProfilInvestisseur } from '@/types/calculateur';

interface ProfilInvestisseurToggleProps {
  profil: ProfilInvestisseur;
  onChange: (profil: ProfilInvestisseur) => void;
}

const PROFIL_CONFIG = {
  rentier: {
    label: 'Rentier',
    icon: '💰',
    tooltip: {
      title: 'Profil Rentier — Cashflow prioritaire',
      lines: [
        'Priorité au cashflow mensuel positif et à la rentabilité immédiate.',
        'Idéal si vous souhaitez générer des revenus complémentaires rapidement.',
        '',
        'Pondérations renforcées :',
        '• Cash-flow net  ×1.0',
        '• Rentabilité nette  ×1.0',
        '• Ratio prix/loyer  ×1.0',
        '• Reste à vivre  ×1.0',
      ],
    },
  },
  patrimonial: {
    label: 'Patrimonial',
    icon: '🏛',
    tooltip: {
      title: 'Profil Patrimonial — Valorisation long terme',
      lines: [
        'Priorité au TRI sur 20 ans et à la valorisation du bien.',
        'Idéal si vous visez la constitution d\'un patrimoine durable.',
        '',
        'Pondérations ajustées :',
        '• Cash-flow net  ×0.5 (moins déterminant)',
        '• Rentabilité nette  ×1.5 (renforcé)',
        '• Ratio prix/loyer  ×1.5 (renforcé)',
        '• Reste à vivre  ×0.75',
      ],
    },
  },
} as const;

export function ProfilInvestisseurToggle({ profil, onChange }: ProfilInvestisseurToggleProps) {
  const [tooltip, setTooltip] = useState<ProfilInvestisseur | null>(null);

  return (
    <div className="flex items-center gap-1 p-1 bg-surface rounded-xl border border-border">
      {(['rentier', 'patrimonial'] as ProfilInvestisseur[]).map((p) => {
        const config = PROFIL_CONFIG[p];
        const isActive = profil === p;
        return (
          <div key={p} className="relative">
            <button
              type="button"
              onClick={() => onChange(p)}
              onMouseEnter={() => setTooltip(p)}
              onMouseLeave={() => setTooltip(null)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-white shadow-sm text-charcoal border border-border'
                  : 'text-stone hover:text-charcoal'
              )}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </button>

            {/* Tooltip */}
            {tooltip === p && (
              <div className="absolute bottom-full mb-2 right-0 z-50 w-64 bg-charcoal text-white rounded-xl shadow-xl p-4 pointer-events-none">
                {/* Flèche */}
                <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-charcoal rotate-45" />

                <p className="text-xs font-bold text-sage mb-2">{config.tooltip.title}</p>
                <div className="space-y-0.5">
                  {config.tooltip.lines.map((line, i) =>
                    line === '' ? (
                      <div key={i} className="h-2" />
                    ) : (
                      <p key={i} className={cn(
                        'text-xs leading-relaxed',
                        line.startsWith('•') ? 'text-white/80 pl-1 font-mono' : 'text-white/90'
                      )}>
                        {line}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
