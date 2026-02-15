'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, CurrencyInput, Select, Alert } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import { bienSchema, type BienFormDataInput, type BienFormData } from '@/lib/validators';
import { TYPE_BIEN_OPTIONS } from '@/lib/constants';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useScenarioFormReset } from '@/hooks/useScenarioFormReset';
import type { BienData } from '@/types';

interface StepBienProps {
  onNext: () => void;
}

export function StepBien({ onNext }: StepBienProps) {
  const { getActiveScenario, updateBien, activeScenarioId } = useCalculateurStore();
  const { bien } = getActiveScenario();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BienFormDataInput, unknown, BienFormData>({
    resolver: zodResolver(bienSchema),
    defaultValues: {
      adresse: bien.adresse || '',
      prix_achat: bien.prix_achat || undefined,
      surface: bien.surface || undefined,
      type_bien: bien.type_bien || 'appartement',
      annee_construction: bien.annee_construction || undefined,
      etat_bien: bien.etat_bien || 'ancien',
      montant_travaux: bien.montant_travaux || 0,
      valeur_mobilier: bien.valeur_mobilier || 0,
      part_terrain: bien.part_terrain != null ? bien.part_terrain * 100 : undefined,
      dpe: bien.dpe || undefined,
    },
  });

  useScenarioFormReset(reset, {
    adresse: bien.adresse || '',
    prix_achat: bien.prix_achat || undefined,
    surface: bien.surface || undefined,
    type_bien: bien.type_bien || 'appartement',
    annee_construction: bien.annee_construction || undefined,
    etat_bien: bien.etat_bien || 'ancien',
    montant_travaux: bien.montant_travaux || 0,
    valeur_mobilier: bien.valeur_mobilier || 0,
    part_terrain: bien.part_terrain != null ? bien.part_terrain * 100 : undefined,
    dpe: bien.dpe || undefined,
    renovation_energetique: bien.renovation_energetique || false,
    annee_travaux: bien.annee_travaux || undefined,
  }, activeScenarioId);

  const onSubmit = (data: BienFormData) => {
    // Convertir part_terrain de % vers ratio (ex: 10 → 0.10)
    const bienData: BienData = {
      ...data as BienData,
      part_terrain: data.part_terrain != null ? data.part_terrain / 100 : undefined,
    };
    updateBien(bienData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal">Informations du bien</h2>
        <p className="text-pebble mt-1">
          Renseignez les caractéristiques du bien immobilier
        </p>
      </div>

      <Input
        label="Adresse du bien"
        placeholder="123 rue de Paris, 75001 Paris"
        error={errors.adresse?.message}
        {...register('adresse')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          label="Prix d'achat"
          placeholder="200000"
          error={errors.prix_achat?.message}
          {...register('prix_achat', { valueAsNumber: true })}
        />

        <Input
          label="Surface (m²)"
          type="number"
          placeholder="50"
          rightAddon="m²"
          error={errors.surface?.message}
          {...register('surface', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Type de bien"
          options={TYPE_BIEN_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          value={watch('type_bien')}
          error={errors.type_bien?.message}
          {...register('type_bien')}
        />

        <Select
          label="État du bien"
          options={[
            { value: 'ancien', label: 'Ancien' },
            { value: 'neuf', label: 'Neuf (VEFA)' },
          ]}
          value={watch('etat_bien')}
          error={errors.etat_bien?.message}
          {...register('etat_bien')}
        />


        <Input
          label="Année de construction"
          type="number"
          placeholder="1990"
          error={errors.annee_construction?.message}
          {...register('annee_construction', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          label="Montant des travaux"
          placeholder="0"
          error={errors.montant_travaux?.message}
          {...register('montant_travaux', { valueAsNumber: true })}
        />

        <CurrencyInput
          label="Valeur du mobilier"
          placeholder="0"
          error={errors.valeur_mobilier?.message}
          {...register('valeur_mobilier', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Part terrain (%, pour amortissement)"
          type="number"
          placeholder="10"
          rightAddon="%"
          hint="Appart: 10%, Maison: 20%, Immeuble: 10%. Laissez vide pour la valeur par défaut."
          error={errors.part_terrain?.message}
          {...register('part_terrain', { valueAsNumber: true })}
        />

        <Select
          label="Performance énergétique (DPE)"
          options={[
            { value: '', label: 'Non renseigné' },
            { value: 'A', label: 'A - Excellent' },
            { value: 'B', label: 'B - Très bon' },
            { value: 'C', label: 'C - Bon' },
            { value: 'D', label: 'D - Moyen' },
            { value: 'E', label: 'E - Insuffisant' },
            { value: 'F', label: 'F - Très insuffisant' },
            { value: 'G', label: 'G - Extrêmement insuffisant' },
          ]}
          error={errors.dpe?.message}
          {...register('dpe')}
        />
      </div>

      {/* Rénovation énergétique (V2-S15) */}
      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-start space-x-3 cursor-pointer group">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 transition duration-150 ease-in-out cursor-pointer"
              {...register('renovation_energetique')}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 group-hover:text-brand-700 transition-colors">
              Rénovation énergétique éligible
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Cochez cette case si les travaux permettent de passer d&apos;une classe E/F/G à A/B/C/D.
              <br />
              Le plafond du déficit foncier est doublé à <strong>21 400 €</strong> pour les paiements effectués entre 2023 et 2025.
            </span>
          </div>
        </label>

        {watch('renovation_energetique') && (
          <div className="mt-4 pl-7 space-y-3">
            <div className="max-w-xs">
              <Input
                label="Année de paiement des travaux"
                type="number"
                placeholder={new Date().getFullYear().toString()}
                error={errors.annee_travaux?.message}
                {...register('annee_travaux', { valueAsNumber: true })}
                hint="Année de réalisation et de paiement définitif des travaux."
              />
            </div>

            {(() => {
              const annee = watch('annee_travaux') as number | undefined;
              if (annee && (annee < 2023 || annee > 2025)) {
                return (
                  <Alert variant="warning" icon={AlertTriangle} title="Dispositif non applicable" className="mt-2 text-sm">
                    Le plafond majoré de 21 400 € s&apos;applique uniquement aux travaux payés entre le 01/01/2023 et le 31/12/2025.
                    <br />
                    Pour l&apos;année {annee}, le plafond standard de 10 700 € s&apos;appliquera.
                  </Alert>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">
          Continuer
        </Button>
      </div>
    </form>
  );
}
