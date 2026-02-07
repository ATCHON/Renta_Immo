'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, CurrencyInput, PercentInput } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useScenarioFormReset } from '@/hooks/useScenarioFormReset';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { cn } from '@/lib/utils';
import type { AssocieData } from '@/types';

const associeSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  parts: z.number().min(0).max(100),
  revenus: z.number().min(0),
  mensualites: z.number().min(0),
  charges: z.number().min(0),
});

const associesStepSchema = z.object({
  associes: z.array(associeSchema).min(1, 'Au moins un associé est requis').refine(
    (items) => {
      const total = items.reduce((sum, item) => sum + item.parts, 0);
      return Math.abs(total - 100) < 0.01;
    },
    { message: 'Le total des parts doit être égal à 100%' }
  ),
});

type AssociesStepFormData = z.infer<typeof associesStepSchema>;

interface StepAssociesProps {
  onNext: () => void;
  onPrev: () => void;
}

export function StepAssocies({ onNext, onPrev }: StepAssociesProps) {
  const { getActiveScenario, updateStructure, activeScenarioId } = useCalculateurStore();
  const hasHydrated = useHasHydrated();
  const { structure } = getActiveScenario();

  const defaultAssocies = structure.associes?.length
    ? structure.associes
    : [{ nom: '', parts: 100, revenus: 0, mensualites: 0, charges: 0 }];

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssociesStepFormData>({
    resolver: zodResolver(associesStepSchema),
    defaultValues: {
      associes: defaultAssocies,
    },
  });

  useScenarioFormReset(reset, {
    associes: structure.associes?.length
      ? structure.associes
      : [{ nom: '', parts: 100, revenus: 0, mensualites: 0, charges: 0 }],
  }, activeScenarioId);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'associes',
  });

  const watchedAssocies = watch('associes');
  const totalParts = watchedAssocies?.reduce((sum: number, a: { parts?: number }) => sum + (a.parts || 0), 0) || 0;

  // Si nom propre, passer directement à l'étape suivante
  useEffect(() => {
    if (structure.type === 'nom_propre') {
      onNext();
    }
  }, [structure.type, onNext]);

  const onSubmit = (data: AssociesStepFormData) => {
    updateStructure({
      ...structure,
      associes: data.associes as AssocieData[],
    });
    onNext();
  };

  const addAssocie = () => {
    const remainingParts = Math.max(0, 100 - totalParts);
    append({
      nom: '',
      parts: remainingParts,
      revenus: 0,
      mensualites: 0,
      charges: 0,
    });
  };

  // Ne pas rendre si pas hydraté ou nom propre
  if (!hasHydrated || structure.type === 'nom_propre') {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal">Associés de la SCI</h2>
        <p className="text-pebble mt-1">
          Renseignez les informations de chaque associé pour le calcul HCSF
        </p>
      </div>

      {/* Indicateur total des parts */}
      <div
        className={cn(
          'rounded-xl p-4 border transition-colors',
          Math.abs(totalParts - 100) < 0.01
            ? 'bg-sage/10 border-sage/20'
            : 'bg-amber/10 border-amber/20'
        )}
      >
        <p className="text-sm font-medium text-charcoal">
          Total des parts : {' '}
          <span
            className={cn(
              'text-lg font-bold',
              Math.abs(totalParts - 100) < 0.01 ? 'text-forest' : 'text-amber-700'
            )}
          >
            {totalParts.toFixed(1)}%
          </span>
          {Math.abs(totalParts - 100) >= 0.01 && (
            <span className="text-amber-700 ml-2 font-normal">
              (doit être égal à 100%)
            </span>
          )}
        </p>
      </div>

      {/* Liste des associés */}
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-surface border border-sand rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sand/50">
              <h3 className="font-bold text-charcoal">
                Associé {index + 1}
              </h3>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Supprimer
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom"
                placeholder="Jean Dupont"
                error={errors.associes?.[index]?.nom?.message}
                {...register(`associes.${index}.nom`)}
              />

              <PercentInput
                label="Parts (%)"
                placeholder="50"
                error={errors.associes?.[index]?.parts?.message}
                {...register(`associes.${index}.parts`, { valueAsNumber: true })}
              />

              <CurrencyInput
                label="Revenus mensuels nets"
                placeholder="3000"
                hint="Revenus nets imposables"
                error={errors.associes?.[index]?.revenus?.message}
                {...register(`associes.${index}.revenus`, { valueAsNumber: true })}
              />

              <CurrencyInput
                label="Mensualités de crédit"
                placeholder="500"
                hint="Total des mensualités existantes"
                error={errors.associes?.[index]?.mensualites?.message}
                {...register(`associes.${index}.mensualites`, { valueAsNumber: true })}
              />

              <CurrencyInput
                label="Charges mensuelles"
                placeholder="800"
                hint="Loyer, pensions, etc."
                error={errors.associes?.[index]?.charges?.message}
                {...register(`associes.${index}.charges`, { valueAsNumber: true })}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Erreur globale sur les parts */}
      {errors.associes?.root && (
        <p className="error-message">{errors.associes.root.message}</p>
      )}

      {/* Bouton ajouter */}
      <Button
        type="button"
        variant="secondary"
        onClick={addAssocie}
        className="w-full"
      >
        + Ajouter un associé
      </Button>

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
