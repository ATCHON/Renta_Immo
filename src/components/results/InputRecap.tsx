'use client';

import { Card } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { BienData, FinancementData, ExploitationData, StructureData } from '@/types/calculateur';

interface InputRecapProps {
  bien: Partial<BienData>;
  financement: Partial<FinancementData>;
  exploitation: Partial<ExploitationData>;
  structure: Partial<StructureData>;
}

const TYPE_BIEN_LABELS: Record<string, string> = {
  appartement: 'Appt',
  maison: 'Maison',
  immeuble: 'Immeuble',
};

const TYPE_STRUCTURE_LABELS: Record<string, string> = {
  nom_propre: 'Nom propre',
  sci_is: 'SCI IS',
};

const REGIME_LABELS: Record<string, string> = {
  micro_foncier: 'Micro-foncier',
  reel: 'Réel',
  lmnp_micro: 'LMNP Micro',
  lmnp_reel: 'LMNP Réel',
};

function RecapCol({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div>
      <p className="nordic-label-xs mb-2">{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between gap-2">
            <span className="text-[11px] text-stone">{item.label}</span>
            <span className="text-[11px] font-bold text-charcoal tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InputRecap({ bien, financement, exploitation, structure }: InputRecapProps) {
  const bienItems = [
    { label: 'Prix', value: formatCurrency(bien.prix_achat ?? 0) },
    { label: 'Type', value: `${bien.surface ? `${bien.surface}m²` : ''} ${TYPE_BIEN_LABELS[bien.type_bien ?? ''] ?? ''}`.trim() || '--' },
    ...(bien.dpe ? [{ label: 'DPE', value: bien.dpe }] : []),
    ...(bien.montant_travaux ? [{ label: 'Travaux', value: formatCurrency(bien.montant_travaux) }] : []),
  ];

  const financementItems = [
    { label: 'Apport', value: formatCurrency(financement.apport ?? 0) },
    { label: 'Taux', value: `${financement.taux_interet ?? 0}%` },
    { label: 'Durée', value: `${financement.duree_emprunt ?? 0} ans` },
  ];

  const exploitationItems = [
    { label: 'Loyer', value: `${formatCurrency(exploitation.loyer_mensuel ?? 0)}/m` },
    { label: 'Charges', value: `${formatCurrency((exploitation.charges_copro ?? 0) + (exploitation.assurance_pno ?? 0))}/m` },
    { label: 'Taxe fonc.', value: `${formatCurrency(exploitation.taxe_fonciere ?? 0)}/an` },
  ];

  const structureItems = [
    { label: 'Structure', value: TYPE_STRUCTURE_LABELS[structure.type ?? ''] ?? '--' },
    { label: 'TMI', value: `${structure.tmi ?? 0}%` },
    ...(structure.regime_fiscal ? [{ label: 'Régime', value: REGIME_LABELS[structure.regime_fiscal] ?? structure.regime_fiscal }] : []),
  ];

  return (
    <Card variant="bordered" className="!py-4 !px-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <RecapCol title="Bien" items={bienItems} />
        <div className="pt-4 sm:pt-0 sm:pl-4">
          <RecapCol title="Financement" items={financementItems} />
        </div>
        <div className="pt-4 sm:pt-0 sm:pl-4">
          <RecapCol title="Exploitation" items={exploitationItems} />
        </div>
        <div className="pt-4 sm:pt-0 sm:pl-4">
          <RecapCol title="Structure" items={structureItems} />
        </div>
      </div>
    </Card>
  );
}
