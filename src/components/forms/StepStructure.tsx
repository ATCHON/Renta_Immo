'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { CurrencyInput, Select } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { STRUCTURE_OPTIONS, TMI_OPTIONS, REGIME_FISCAL_OPTIONS } from '@/lib/constants';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useScenarioFormReset } from '@/hooks/useScenarioFormReset';
import { cn } from '@/lib/utils';
import type { TypeStructure, RegimeFiscal } from '@/types';

import {
  structureSchema,
  type StructureFormData,
  type StructureFormDataInput,
} from '@/lib/validators';

interface StepStructureProps {
  onNext: () => void;
  onPrev: () => void;
}

export function StepStructure({ onNext, onPrev }: StepStructureProps) {
  const { getActiveScenario, updateStructure, activeScenarioId } = useCalculateurStore();
  const { structure } = getActiveScenario();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StructureFormDataInput, unknown, StructureFormData>({
    resolver: zodResolver(structureSchema),
    defaultValues: {
      type: structure.type || 'nom_propre',
      tmi: structure.tmi ?? 30,
      associes: structure.associes || [],
      regime_fiscal: structure.regime_fiscal ?? 'micro_foncier',
      credits_immobiliers: structure.credits_immobiliers ?? 0,
      loyers_actuels: structure.loyers_actuels ?? 0,
      revenus_activite: structure.revenus_activite ?? 0,
      distribution_dividendes: structure.distribution_dividendes ?? false,
      autres_charges: structure.autres_charges ?? 0,
      mode_amortissement: structure.mode_amortissement ?? 'simplifie',
    },
  });

  // État local pour le type d'exploitation (Nue vs Meublée)
  // On l'initialise en fonction du régime fiscal actuel
  const currentRegime = watch('regime_fiscal');
  const [typeExploitation, setTypeExploitation] = useState<'nue' | 'meublee'>(
    currentRegime?.startsWith('lmnp') ? 'meublee' : 'nue'
  );

  useScenarioFormReset(
    reset,
    {
      type: structure.type || 'nom_propre',
      tmi: structure.tmi ?? 30,
      associes: structure.associes || [],
      regime_fiscal: structure.regime_fiscal ?? 'micro_foncier',
      credits_immobiliers: structure.credits_immobiliers ?? 0,
      loyers_actuels: structure.loyers_actuels ?? 0,
      revenus_activite: structure.revenus_activite ?? 0,
      distribution_dividendes: structure.distribution_dividendes ?? false,
      autres_charges: structure.autres_charges ?? 0,
      mode_amortissement: structure.mode_amortissement ?? 'simplifie',
    },
    activeScenarioId,
    () => {
      setTypeExploitation(structure.regime_fiscal?.startsWith('lmnp') ? 'meublee' : 'nue');
    }
  );

  const selectedType = watch('type');
  const selectedRegime = watch('regime_fiscal');

  const filteredRegimeOptions = REGIME_FISCAL_OPTIONS.filter((opt) => {
    if (typeExploitation === 'meublee') return opt.value.startsWith('lmnp');
    return !opt.value.startsWith('lmnp');
  });

  const onSubmit = (data: StructureFormData) => {
    // mode_amortissement pertinent seulement pour LMNP réel et SCI IS
    const needsAmortissement = data.regime_fiscal === 'lmnp_reel' || data.type === 'sci_is';
    updateStructure({
      ...data,
      regime_fiscal: data.type === 'nom_propre' ? data.regime_fiscal : undefined,
      associes: data.type === 'nom_propre' ? [] : structure.associes || [],
      mode_amortissement: needsAmortissement ? data.mode_amortissement : 'simplifie',
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-on-surface">Structure juridique</h2>
        <p className="text-on-surface-variant mt-1">Choisissez le mode de détention du bien</p>
      </div>

      {/* Selection de la structure */}
      <div className="space-y-4">
        <p className="label">Type de structure</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STRUCTURE_OPTIONS.map((option) => (
            <StructureCard
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
              isSelected={selectedType === option.value}
              onSelect={() => setValue('type', option.value as TypeStructure)}
            />
          ))}
        </div>
        {errors.type && <p className="error-message">{errors.type.message}</p>}
      </div>

      {/* Options pour nom propre */}
      {selectedType === 'nom_propre' && (
        <div className="space-y-6 bg-surface-container-low rounded-2xl p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TMI */}
            <Select
              label="Tranche d'imposition (TMI)"
              options={TMI_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              value={String(watch('tmi') ?? '')}
              hint="Pour vos revenus locatifs"
              error={errors.tmi?.message}
              {...register('tmi', { valueAsNumber: true })}
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <CurrencyInput
                  name="credits_immobiliers"
                  control={control}
                  label="Crédits immobiliers"
                  placeholder="0"
                  hint="Mensualités actuelles"
                  error={errors.credits_immobiliers?.message}
                />
              </div>
              <div className="flex-1">
                <CurrencyInput
                  name="loyers_actuels"
                  control={control}
                  label="Loyers perçus"
                  placeholder="0"
                  hint="Loyers actuels (hors projet)"
                  error={errors.loyers_actuels?.message}
                />
              </div>
            </div>

            <CurrencyInput
              name="revenus_activite"
              control={control}
              label="Revenus mensuels nets"
              placeholder="0"
              hint="Salaires ou revenus d'activité nets avant projet (optionnel, affine le HCSF)"
              error={errors.revenus_activite?.message}
            />

            <CurrencyInput
              name="autres_charges"
              control={control}
              label="Autres charges"
              placeholder="0"
              hint="Crédits conso, pensions, etc. (affine le HCSF)"
              error={errors.autres_charges?.message}
            />
          </div>

          <hr className="border-outline-variant/30" />

          {/* Workflow guidé Nue vs Meublée */}
          <div className="space-y-4">
            <p className="label">Type d&apos;exploitation</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setTypeExploitation('nue');
                  setValue('regime_fiscal', 'micro_foncier');
                }}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  typeExploitation === 'nue'
                    ? 'bg-primary/10 border-primary text-primary font-semibold'
                    : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:border-outline'
                )}
              >
                Location Nue
              </button>
              <button
                type="button"
                onClick={() => {
                  setTypeExploitation('meublee');
                  setValue('regime_fiscal', 'lmnp_micro');
                }}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  typeExploitation === 'meublee'
                    ? 'bg-primary/10 border-primary text-primary font-semibold'
                    : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:border-outline'
                )}
              >
                Location Meublée (LMNP)
              </button>
            </div>
          </div>

          {/* Regime fiscal filtré */}
          <div className="space-y-3">
            <p className="label">Choisir votre régime fiscal</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRegimeOptions.map((option) => (
                <RegimeCard
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  description={option.description}
                  isSelected={selectedRegime === option.value}
                  onSelect={() => setValue('regime_fiscal', option.value as RegimeFiscal)}
                />
              ))}
            </div>
            {errors.regime_fiscal && (
              <p className="error-message">{errors.regime_fiscal.message}</p>
            )}
          </div>

          {/* Mode amortissement (AUDIT-104) - visible pour LMNP réel */}
          {selectedRegime === 'lmnp_reel' && (
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-3">
              <Select
                label="Mode d'amortissement"
                options={[
                  { value: 'simplifie', label: 'Simplifié (linéaire 33 ans)' },
                  { value: 'composants', label: 'Par composants (plus précis)' },
                ]}
                error={errors.mode_amortissement?.message}
                {...register('mode_amortissement')}
              />
              {watch('mode_amortissement') === 'composants' && (
                <p className="text-xs text-on-surface-variant mt-1">
                  Gros oeuvre 40% sur 50 ans, Façade 20% sur 25 ans, Installations 20% sur 15 ans,
                  Agencements 20% sur 10 ans. L&apos;amortissement diminue progressivement.
                </p>
              )}
            </div>
          )}

          {/* Info sur le regime selectionne */}
          {selectedRegime && (
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
              <p className="text-sm text-primary leading-relaxed">
                {selectedRegime === 'micro_foncier' && (
                  <>
                    <strong className="block mb-1">Micro-foncier</strong> Abattement forfaitaire de
                    30% sur vos revenus locatifs. Plafond de 15 000 euros/an de revenus fonciers
                    bruts. Idéal pour une gestion simple.
                  </>
                )}
                {selectedRegime === 'reel' && (
                  <>
                    <strong className="block mb-1">Foncier réel</strong> Déduction des charges
                    réelles (intérêts, travaux, taxe foncière...). Obligatoire si revenus &gt; 15
                    000 euros ou si vos charges dépassent 30%.
                  </>
                )}
                {selectedRegime === 'lmnp_micro' && (
                  <>
                    <strong className="block mb-1">LMNP Micro-BIC</strong> Abattement forfaitaire de
                    50% sur vos revenus locatifs meublé. Plafond de 77 700 euros/an de recettes.
                    Très avantageux pour démarrer.
                  </>
                )}
                {selectedRegime === 'lmnp_reel' && (
                  <>
                    <strong className="block mb-1">LMNP Réel</strong> Déduction des charges +
                    amortissement du bien. Permet souvent d&apos;effacer totalement
                    l&apos;imposition grâce à l&apos;amortissement comptable.
                  </>
                )}
              </p>
              <div className="mt-3 pt-3 border-t border-primary/10 flex justify-between items-center">
                <span className="text-xs text-primary/70">Besoin d&apos;aide pour choisir ?</span>
                <button
                  type="button"
                  className="text-xs font-bold underline hover:text-primary-container"
                  onClick={() => {
                    /* Trigger comparateur modal or link */
                  }}
                >
                  Ouvrir le comparateur fiscal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info pour SCI IS */}
      {selectedType === 'sci_is' && (
        <div className="bg-surface-container-low rounded-2xl p-5 space-y-4">
          <p className="text-sm text-on-surface">
            <strong className="text-primary">SCI à l&apos;IS</strong> Vous allez configurer les
            associés et leurs revenus à l&apos;étape suivante pour le calcul du taux
            d&apos;endettement HCSF.
          </p>

          <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <div>
              <p className="font-semibold text-sm text-on-surface">
                Distribuer les bénéfices (Dividendes)
              </p>
              <p className="text-xs text-on-surface-variant">
                Active la distribution annuelle et applique la Flat Tax de 30%.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={watch('distribution_dividendes')}
                onChange={(e) => setValue('distribution_dividendes', e.target.checked)}
              />
              <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <p className="text-xs text-on-surface-variant">
            L&apos;IS permet de déduire l&apos;amortissement du bien et d&apos;être imposé à 15%
            jusqu&apos;à 42 500 euros puis 25% au-delà.
          </p>

          {/* Mode amortissement (AUDIT-104) - aussi pour SCI IS */}
          <div className="bg-forest/5 rounded-xl p-4 border border-forest/10 space-y-3">
            <Select
              label="Mode d'amortissement"
              options={[
                { value: 'simplifie', label: 'Simplifié (linéaire 33 ans)' },
                { value: 'composants', label: 'Par composants (plus précis)' },
              ]}
              error={errors.mode_amortissement?.message}
              {...register('mode_amortissement')}
            />
            {watch('mode_amortissement') === 'composants' && (
              <p className="text-xs text-forest/70">
                Gros oeuvre 40% sur 50 ans, Façade 20% sur 25 ans, Installations 20% sur 15 ans,
                Agencements 20% sur 10 ans.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="secondary" onClick={onPrev}>
          Retour
        </Button>
        <Button type="submit">Continuer</Button>
      </div>
    </form>
  );
}

interface StructureCardProps {
  value: string;
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

function StructureCard({ label, description, isSelected, onSelect }: StructureCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'p-5 rounded-2xl text-left transition-all duration-300',
        isSelected
          ? 'bg-primary/5 ring-2 ring-primary/30'
          : 'bg-surface-container-low hover:bg-surface-container'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5',
            'flex items-center justify-center transition-colors',
            isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
          )}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="4" />
            </svg>
          )}
        </div>
        <div>
          <p
            className={cn(
              'font-bold transition-colors',
              isSelected ? 'text-primary' : 'text-on-surface'
            )}
          >
            {label}
          </p>
          <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
}

interface RegimeCardProps {
  value: string;
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

function RegimeCard({ label, description, isSelected, onSelect }: RegimeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'p-4 rounded-2xl text-left transition-all duration-200',
        isSelected
          ? 'bg-primary/5 ring-1 ring-primary/30'
          : 'bg-surface-container-low hover:bg-surface-container'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-4 h-4 rounded-full border flex-shrink-0 mt-1',
            'flex items-center justify-center',
            isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
          )}
        >
          {isSelected && (
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="5" />
            </svg>
          )}
        </div>
        <div>
          <p
            className={cn('font-semibold text-sm', isSelected ? 'text-primary' : 'text-on-surface')}
          >
            {label}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
        </div>
      </div>
    </button>
  );
}
