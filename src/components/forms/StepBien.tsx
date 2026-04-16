'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Input,
  CurrencyInput,
  NumberInput,
  PercentInput,
  Select,
  Alert,
  LabelTooltip,
  Collapsible,
} from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Home, Building2, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    control,
    handleSubmit,
    watch,
    setValue,
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

  useScenarioFormReset(
    reset,
    {
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
    },
    activeScenarioId
  );

  // Mise à jour du store en temps réel pour la preview sidebar
  useEffect(() => {
    const subscription = watch((values) => {
      updateBien(values as Partial<BienData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateBien]);

  const onSubmit = (data: BienFormData) => {
    // Convertir part_terrain de % vers ratio (ex: 10 → 0.10)
    const bienData: BienData = {
      ...(data as BienData),
      part_terrain: data.part_terrain != null ? data.part_terrain / 100 : undefined,
    };
    updateBien(bienData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-on-surface">Informations du bien</h2>
          <Home className="h-6 w-6 text-primary/60" />
        </div>
        <p className="text-on-surface-variant mt-1">
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
          name="prix_achat"
          control={control}
          label="Prix d'achat"
          placeholder="ex: 200 000"
          error={errors.prix_achat?.message}
        />

        <NumberInput
          name="surface"
          control={control}
          label="Surface (m²)"
          placeholder="ex: 50"
          rightAddon="m²"
          error={errors.surface?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* S6 — Cards radio type de bien */}
        <div className="md:col-span-2">
          <label className="label">Type de bien</label>
          <div className="grid grid-cols-3 gap-3">
            {(() => {
              const iconMap = { Building2, Home, Building } as const;
              return TYPE_BIEN_OPTIONS.map(({ value, label, icon: iconName }) => {
                const Icon = iconMap[iconName as keyof typeof iconMap];
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setValue('type_bien', value as 'appartement' | 'maison' | 'immeuble', {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      watch('type_bien') === value
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface border-outline-variant hover:border-primary/50 text-on-surface'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                );
              });
            })()}
          </div>
          {errors.type_bien && (
            <p className="text-error text-xs mt-1">{errors.type_bien.message}</p>
          )}
        </div>

        <div>
          <label className="label">État du bien</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'ancien', label: 'Ancien' },
              { value: 'neuf', label: 'Neuf (VEFA)' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setValue('etat_bien', value as 'ancien' | 'neuf', { shouldValidate: true })
                }
                className={cn(
                  'flex items-center justify-center py-3 px-4 rounded-xl border-2 transition-all',
                  watch('etat_bien') === value
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface border-outline-variant hover:border-primary/50 text-on-surface'
                )}
              >
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
          {errors.etat_bien && (
            <p className="text-error text-xs mt-1">{errors.etat_bien.message}</p>
          )}
        </div>

        <NumberInput
          name="annee_construction"
          control={control}
          label="Année de construction"
          placeholder="1990"
          error={errors.annee_construction?.message}
          thousandSeparator={false}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          name="montant_travaux"
          control={control}
          label="Montant des travaux"
          placeholder="0"
          error={errors.montant_travaux?.message}
        />

        <CurrencyInput
          name="valeur_mobilier"
          control={control}
          label="Valeur du mobilier"
          placeholder="0"
          error={errors.valeur_mobilier?.message}
        />
      </div>

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

      {/* Options avancées */}
      <Collapsible title="Options avancées">
        <div className="space-y-4">
          <PercentInput
            name="part_terrain"
            control={control}
            label={
              <LabelTooltip content="Seule la partie bâti est amortissable en LMNP/SCI IS. Le terrain (en général 15 à 20% du prix) ne s'amortit pas.">
                Part terrain (%, pour amortissement)
              </LabelTooltip>
            }
            placeholder="10"
            hint="Appart: 10%, Maison: 20%, Immeuble: 10%. Laissez vide pour la valeur par défaut."
            error={errors.part_terrain?.message}
          />

          {/* Rénovation énergétique (V2-S15) */}
          <div className="pt-2">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary transition duration-fast cursor-pointer"
                  {...register('renovation_energetique')}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                  <LabelTooltip content="Travaux permettant de sortir le bien des classes DPE E, F ou G. Ils ouvrent droit à un plafond de déficit foncier imputable sur le revenu global majoré (21 400€/an).">
                    Rénovation énergétique éligible
                  </LabelTooltip>
                </span>
                <span className="text-xs text-on-surface-variant mt-1">
                  Cochez cette case si les travaux permettent de passer d&apos;une classe E/F/G à
                  A/B/C/D. Le plafond du déficit foncier est doublé à <strong>21 400 €</strong> pour
                  les paiements effectués entre 2023 et 2025.
                </span>
              </div>
            </label>

            {watch('renovation_energetique') && (
              <div className="mt-4 pl-7 space-y-3">
                <div className="max-w-xs">
                  <NumberInput
                    name="annee_travaux"
                    control={control}
                    label="Année de paiement des travaux"
                    placeholder={new Date().getFullYear().toString()}
                    error={errors.annee_travaux?.message}
                    hint="Année de réalisation et de paiement définitif des travaux."
                    thousandSeparator={false}
                  />
                </div>

                {(() => {
                  const annee = watch('annee_travaux') as number | undefined;
                  if (annee && (annee < 2023 || annee > 2025)) {
                    return (
                      <Alert
                        variant="warning"
                        icon={AlertTriangle}
                        title="Dispositif non applicable"
                        className="mt-2 text-sm"
                      >
                        Le plafond majoré de 21 400 € s&apos;applique uniquement aux travaux payés
                        entre le 01/01/2023 et le 31/12/2025.
                        <br />
                        Pour l&apos;année {annee}, le plafond standard de 10 700 €
                        s&apos;appliquera.
                      </Alert>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        </div>
      </Collapsible>

      <div className="flex justify-end pt-4">
        <Button type="submit">Continuer</Button>
      </div>
    </form>
  );
}
