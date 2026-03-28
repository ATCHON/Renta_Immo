'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CurrencyInput, PercentInput, Select, LabelTooltip, Collapsible } from '@/components/ui';
import { VerdantSlider } from '@/components/ui/VerdantSlider';
import { Button } from '@/components/ui/Button';
import {
  financementSchema,
  type FinancementFormDataInput,
  type FinancementFormData,
} from '@/lib/validators';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useScenarioFormReset } from '@/hooks/useScenarioFormReset';
import { calculateMensualite, formatCurrency } from '@/lib/utils';
import type { FinancementData } from '@/types';
import { useState } from 'react';
import { Calculator, CheckCircle2, Lightbulb, Pencil } from 'lucide-react';

interface StepFinancementProps {
  onNext: () => void;
  onPrev: () => void;
}

export function StepFinancement({ onNext, onPrev }: StepFinancementProps) {
  const { getActiveScenario, updateFinancement, updateOptions, activeScenarioId } =
    useCalculateurStore();
  const { bien, financement, options } = getActiveScenario();
  const [ponderationLoyers, setPonderationLoyers] = useState<number>(
    options.ponderation_loyers ?? 70
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FinancementFormDataInput, unknown, FinancementFormData>({
    resolver: zodResolver(financementSchema),
    defaultValues: {
      apport: financement.apport ?? 0,
      taux_interet: financement.taux_interet ?? 3.5,
      duree_emprunt: financement.duree_emprunt ?? 20,
      assurance_pret: Number((financement.assurance_pret ?? 0.3).toFixed(2)),
      frais_dossier: financement.frais_dossier ?? 0,
      frais_garantie: financement.frais_garantie ?? 2000,
      mode_assurance: financement.mode_assurance ?? 'capital_initial',
    },
  });

  useScenarioFormReset(
    reset,
    {
      apport: financement.apport ?? 0,
      taux_interet: financement.taux_interet ?? 3.5,
      duree_emprunt: financement.duree_emprunt ?? 20,
      assurance_pret: Number((financement.assurance_pret ?? 0.3).toFixed(2)),
      frais_dossier: financement.frais_dossier ?? 0,
      frais_garantie: financement.frais_garantie ?? 2000,
      mode_assurance: financement.mode_assurance ?? 'capital_initial',
    },
    activeScenarioId
  );

  const watchedValues = watch() as unknown as FinancementFormData;
  const prixAchat = bien.prix_achat || 0;
  const montantEmprunt = Math.max(0, prixAchat - (watchedValues.apport || 0));
  const mensualite = calculateMensualite(
    montantEmprunt,
    watchedValues.taux_interet || 0,
    watchedValues.duree_emprunt || 1
  );

  const onSubmit = (data: FinancementFormData) => {
    updateFinancement(data as FinancementData);
    updateOptions({ ponderation_loyers: ponderationLoyers });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* S7 — Header contextuel */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-on-surface mt-2">Affinez votre stratégie</h2>
          <Calculator className="h-6 w-6 text-primary/60" />
        </div>
        <p className="text-on-surface-variant mt-1">
          Ajustez les paramètres de financement pour mesurer leur impact sur vos projections
          patrimoniales.
        </p>
      </div>

      {/* S8 — Résumé du bien (étape précédente) */}
      <div className="bg-surface rounded-2xl p-4 mb-6 border border-outline-variant/30 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-on-surface-variant">
            Prix d&apos;achat :{' '}
            <span className="font-semibold text-on-surface">{formatCurrency(prixAchat)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <Pencil className="h-3 w-3" />
          Modifier
        </button>
      </div>

      {/* S9 — Section titre financement */}
      <h3 className="text-base font-semibold text-on-surface mb-4">Détails du financement</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          name="apport"
          control={control}
          label="Apport personnel"
          placeholder="20 000"
          error={errors.apport?.message}
        />
        {/* S11 — Hint contextuel apport */}
        {prixAchat > 0 && (
          <p className="text-[11px] text-on-surface/50 mt-1 -mb-2 col-span-1">
            Recommandé : 20% ({formatCurrency(prixAchat * 0.2)})
          </p>
        )}

        <div
          className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-center"
          style={{ boxShadow: 'var(--shadow-ambient)' }}
        >
          <p className="text-sm text-on-surface-variant font-medium">Montant à emprunter</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(montantEmprunt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PercentInput
          label="Taux d'intérêt annuel"
          placeholder="3.5"
          error={errors.taux_interet?.message}
          {...register('taux_interet', { valueAsNumber: true })}
        />
        {/* S11 — Hint contextuel taux */}
        <p className="text-[11px] text-on-surface/50 mt-1 -mb-2 col-span-1">
          Moyenne marché : 3,92%
        </p>

        {/* S10 — Durée emprunt : valeur large + slider */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Durée de l&apos;emprunt
            </span>
            <span className="text-3xl font-extrabold text-primary">
              {watchedValues.duree_emprunt ?? 20}
              <span className="text-lg font-medium ml-1">ans</span>
            </span>
          </div>
          <VerdantSlider
            value={watchedValues.duree_emprunt ?? 20}
            onChange={(v) => setValue('duree_emprunt', v, { shouldValidate: true })}
            min={5}
            max={30}
            step={1}
            unit="ans"
          />
          {errors.duree_emprunt?.message && (
            <p className="text-xs text-error mt-1">{errors.duree_emprunt.message}</p>
          )}
        </div>
      </div>

      <PercentInput
        label="Taux d'assurance prêt"
        placeholder="0.3"
        error={errors.assurance_pret?.message}
        {...register('assurance_pret', { valueAsNumber: true })}
      />

      {/* Options avancées */}
      <Collapsible title="Options avancées">
        <div className="space-y-4">
          <Select
            label={
              <LabelTooltip content="Détermine la base de calcul des primes. CRD (Capital Restant Dû) : la prime baisse avec le temps; Capital Initial : la prime reste fixe sur toute la durée du prêt.">
                Mode d&apos;assurance
              </LabelTooltip>
            }
            {...register('mode_assurance')}
            options={[
              { value: 'capital_initial', label: 'Capital initial (fixe)' },
              { value: 'capital_restant_du', label: 'Capital restant dû (décroissant)' },
            ]}
            hint="L'assurance CRD diminue avec le remboursement"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyInput
              name="frais_dossier"
              control={control}
              label="Frais de dossier bancaire"
              placeholder="500"
              error={errors.frais_dossier?.message}
            />

            <CurrencyInput
              name="frais_garantie"
              control={control}
              label="Frais de garantie (hypothèque/caution)"
              placeholder="2 000"
              error={errors.frais_garantie?.message}
            />
          </div>
        </div>
      </Collapsible>

      {/* Simulation mensualité */}
      {mensualite > 0 && (
        <div
          className="bg-surface-container-lowest rounded-2xl p-4"
          style={{ boxShadow: 'var(--shadow-ambient)' }}
        >
          <p className="text-sm text-on-surface-variant font-medium">
            Mensualité estimée (hors assurance)
          </p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(mensualite)} / mois</p>
        </div>
      )}

      {/* V2-S18 : Pondération loyers HCSF */}
      <div className="bg-surface-container rounded-2xl p-4 space-y-3">
        <p className="text-sm text-on-surface-variant">
          <LabelTooltip content="Règle du Haut Conseil de Stabilité Financière. Les banques ne prennent en compte qu'une fraction (généralement 70%) de vos revenus locatifs bruts pour calculer votre taux d'endettement maximal (35%).">
            Pondération loyers HCSF
          </LabelTooltip>
        </p>
        <p className="text-xs text-on-surface-variant/70">
          La banque peut prendre en compte 70 à 80% des loyers. Avec une GLI, certaines banques
          appliquent 80%.
        </p>
        <div className="flex items-end gap-3">
          <div className="flex-1" data-testid="ponderation-hcsf">
            <VerdantSlider
              value={ponderationLoyers}
              onChange={(val) => {
                setPonderationLoyers(val);
                updateOptions({ ponderation_loyers: val });
              }}
              min={60}
              max={90}
              step={5}
              unit="%"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setPonderationLoyers(80);
              updateOptions({ ponderation_loyers: 80 });
            }}
            className="shrink-0 text-xs mb-5"
            data-testid="btn-gli"
          >
            Avec GLI (80%)
          </Button>
        </div>
      </div>

      {/* S12 — Pro Tip card */}
      <div className="rounded-2xl bg-secondary-fixed/40 p-5 flex gap-3">
        <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-on-surface">Astuce : Levier vs. Apport</p>
          <p className="text-xs text-on-surface/60 mt-1">
            Augmenter la durée de 20 à 25 ans réduit la mensualité d&apos;environ €142/mois,
            améliorant l&apos;effort d&apos;épargne. Simulez l&apos;impact sur le TRI.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="secondary" onClick={onPrev}>
          Retour
        </Button>
        <Button type="submit">Continuer</Button>
      </div>
    </form>
  );
}
