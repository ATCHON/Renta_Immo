'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CurrencyInput, PercentInput, Input, Select } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { financementSchema, type FinancementFormDataInput, type FinancementFormData } from '@/lib/validators';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useScenarioFormReset } from '@/hooks/useScenarioFormReset';
import { calculateMensualite, formatCurrency } from '@/lib/utils';
import type { FinancementData } from '@/types';
import { useState } from 'react';

interface StepFinancementProps {
  onNext: () => void;
  onPrev: () => void;
}

export function StepFinancement({ onNext, onPrev }: StepFinancementProps) {
  const { getActiveScenario, updateFinancement, updateOptions, activeScenarioId } = useCalculateurStore();
  const { bien, financement, options } = getActiveScenario();
  const [ponderationLoyers, setPonderationLoyers] = useState<number>(options.ponderation_loyers ?? 70);

  const {
    register,
    handleSubmit,
    watch,
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

  useScenarioFormReset(reset, {
    apport: financement.apport ?? 0,
    taux_interet: financement.taux_interet ?? 3.5,
    duree_emprunt: financement.duree_emprunt ?? 20,
    assurance_pret: Number((financement.assurance_pret ?? 0.3).toFixed(2)),
    frais_dossier: financement.frais_dossier ?? 0,
    frais_garantie: financement.frais_garantie ?? 2000,
    mode_assurance: financement.mode_assurance ?? 'capital_initial',
  }, activeScenarioId);

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal">Financement</h2>
        <p className="text-pebble mt-1">
          Configurez les paramètres de votre emprunt
        </p>
      </div>

      {/* Résumé du bien */}
      <div className="bg-surface rounded-xl p-4 mb-6 border border-sand">
        <p className="text-sm text-pebble">
          Prix d&apos;achat : <span className="font-semibold text-charcoal">{formatCurrency(prixAchat)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          label="Apport personnel"
          placeholder="20000"
          hint="Montant de votre apport"
          error={errors.apport?.message}
          {...register('apport', { valueAsNumber: true })}
        />

        <div className="bg-forest/5 rounded-xl p-4 flex flex-col justify-center border border-forest/10">
          <p className="text-sm text-forest font-medium">Montant à emprunter</p>
          <p className="text-2xl font-bold text-forest">
            {formatCurrency(montantEmprunt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PercentInput
          label="Taux d'intérêt annuel"
          placeholder="3.5"
          error={errors.taux_interet?.message}
          {...register('taux_interet', { valueAsNumber: true })}
        />

        <Input
          label="Durée de l'emprunt"
          type="number"
          min="1"
          max="30"
          placeholder="20"
          rightAddon="ans"
          error={errors.duree_emprunt?.message}
          {...register('duree_emprunt', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PercentInput
          label="Taux d'assurance prêt"
          placeholder="0.3"
          error={errors.assurance_pret?.message}
          {...register('assurance_pret', { valueAsNumber: true })}
        />

        <Select
          label="Mode d'assurance"
          {...register('mode_assurance')}
          options={[
            { value: 'capital_initial', label: 'Capital initial (fixe)' },
            { value: 'capital_restant_du', label: 'Capital restant dû (décroissant)' },
          ]}
          hint="L'assurance CRD diminue avec le remboursement"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          label="Frais de dossier bancaire"
          placeholder="500"
          error={errors.frais_dossier?.message}
          {...register('frais_dossier', { valueAsNumber: true })}
        />

        <CurrencyInput
          label="Frais de garantie (hypothèque/caution)"
          placeholder="2000"
          error={errors.frais_garantie?.message}
          {...register('frais_garantie', { valueAsNumber: true })}
        />
      </div>

      {/* Simulation mensualité */}
      {mensualite > 0 && (
        <div className="bg-sage/10 rounded-xl p-4 border border-sage/20">
          <p className="text-sm text-forest font-medium">Mensualité estimée (hors assurance)</p>
          <p className="text-2xl font-bold text-forest">
            {formatCurrency(mensualite)} / mois
          </p>
        </div>
      )}

      {/* V2-S18 : Pondération loyers HCSF */}
      <div className="border border-sand rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-charcoal">Pondération loyers HCSF</p>
            <p className="text-xs text-pebble mt-0.5">
              La banque peut prendre en compte 70 à 80% des loyers selon les établissements.
              Avec une GLI (Garantie Loyers Impayés), certaines banques appliquent 80%.
            </p>
          </div>
          <span className="text-2xl font-bold text-forest ml-4 shrink-0">{ponderationLoyers}%</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={60}
            max={90}
            step={5}
            value={ponderationLoyers}
            onChange={(e) => setPonderationLoyers(Number(e.target.value))}
            className="flex-1 accent-forest"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPonderationLoyers(80)}
            className="shrink-0 text-xs"
          >
            Avec GLI (80%)
          </Button>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="secondary" onClick={onPrev}>
          Retour
        </Button>
        <Button type="submit">
          Continuer
        </Button>
      </div>
    </form>
  );
}
