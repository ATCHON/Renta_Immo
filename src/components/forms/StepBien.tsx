'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, CurrencyInput, Select } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { bienSchema, type BienFormData } from '@/lib/validators';
import { TYPE_BIEN_OPTIONS } from '@/lib/constants';
import { useCalculateurStore } from '@/stores/calculateur.store';
import type { BienData } from '@/types';

interface StepBienProps {
  onNext: () => void;
}

export function StepBien({ onNext }: StepBienProps) {
  const { bien, updateBien } = useCalculateurStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BienFormData>({
    resolver: zodResolver(bienSchema),
    defaultValues: {
      adresse: bien.adresse || '',
      prix_achat: bien.prix_achat || undefined,
      surface: bien.surface || undefined,
      type_bien: bien.type_bien || 'appartement',
      annee_construction: bien.annee_construction || undefined,
    },
  });

  const onSubmit = (data: BienFormData) => {
    updateBien(data as BienData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Informations du bien</h2>
        <p className="text-gray-600 mt-1">
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
          error={errors.type_bien?.message}
          {...register('type_bien')}
        />

        <Input
          label="Année de construction"
          type="number"
          placeholder="1990"
          error={errors.annee_construction?.message}
          {...register('annee_construction', { valueAsNumber: true })}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">
          Continuer
        </Button>
      </div>
    </form>
  );
}
