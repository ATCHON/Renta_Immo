'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { STRUCTURE_OPTIONS, TMI_OPTIONS } from '@/lib/constants';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { cn } from '@/lib/utils';
import type { TypeStructure } from '@/types';

const structureStepSchema = z.object({
  type: z.enum(['nom_propre', 'sci_is']),
  tmi: z.number().min(0).max(50),
});

type StructureStepFormData = z.infer<typeof structureStepSchema>;

interface StepStructureProps {
  onNext: () => void;
  onPrev: () => void;
}

export function StepStructure({ onNext, onPrev }: StepStructureProps) {
  const { structure, updateStructure } = useCalculateurStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StructureStepFormData>({
    resolver: zodResolver(structureStepSchema),
    defaultValues: {
      type: structure.type || 'nom_propre',
      tmi: structure.tmi ?? 30,
    },
  });

  const selectedType = watch('type');

  const onSubmit = (data: StructureStepFormData) => {
    updateStructure({
      type: data.type as TypeStructure,
      tmi: data.tmi,
      associes: data.type === 'nom_propre' ? [] : structure.associes || [],
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Structure juridique</h2>
        <p className="text-gray-600 mt-1">
          Choisissez le mode de détention du bien
        </p>
      </div>

      {/* Sélection de la structure */}
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
        {errors.type && (
          <p className="error-message">{errors.type.message}</p>
        )}
      </div>

      {/* TMI pour nom propre */}
      {selectedType === 'nom_propre' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <Select
            label="Tranche marginale d'imposition (TMI)"
            options={TMI_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            hint="Votre TMI actuelle pour les revenus fonciers"
            error={errors.tmi?.message}
            {...register('tmi', { valueAsNumber: true })}
          />
        </div>
      )}

      {/* Info pour SCI IS */}
      {selectedType === 'sci_is' && (
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>SCI à l&apos;IS :</strong> Vous allez configurer les associés
            et leurs revenus à l&apos;étape suivante pour le calcul du taux
            d&apos;endettement HCSF.
          </p>
        </div>
      )}

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

interface StructureCardProps {
  value: string;
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

function StructureCard({
  value,
  label,
  description,
  isSelected,
  onSelect,
}: StructureCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'p-4 rounded-lg border-2 text-left transition-all duration-200',
        isSelected
          ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5',
            'flex items-center justify-center',
            isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
          )}
        >
          {isSelected && (
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <circle cx="10" cy="10" r="4" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}
