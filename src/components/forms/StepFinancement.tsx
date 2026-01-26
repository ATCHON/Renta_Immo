'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CurrencyInput, PercentInput, Input } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { financementSchema, type FinancementFormData } from '@/lib/validators';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { calculateMensualite, formatCurrency } from '@/lib/utils';
import type { FinancementData } from '@/types';

interface StepFinancementProps {
  onNext: () => void;
  onPrev: () => void;
}

export function StepFinancement({ onNext, onPrev }: StepFinancementProps) {
  const { bien, financement, updateFinancement } = useCalculateurStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FinancementFormData>({
    resolver: zodResolver(financementSchema),
    defaultValues: {
      apport: financement.apport ?? 0,
      taux_interet: financement.taux_interet ?? 3.5,
      duree_emprunt: financement.duree_emprunt ?? 20,
      assurance_pret: financement.assurance_pret ?? 0.3,
    },
  });

  const watchedValues = watch();
  const prixAchat = bien.prix_achat || 0;
  const montantEmprunt = Math.max(0, prixAchat - (watchedValues.apport || 0));
  const mensualite = calculateMensualite(
    montantEmprunt,
    watchedValues.taux_interet || 0,
    watchedValues.duree_emprunt || 1
  );

  const onSubmit = (data: FinancementFormData) => {
    updateFinancement(data as FinancementData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Financement</h2>
        <p className="text-gray-600 mt-1">
          Configurez les paramètres de votre emprunt
        </p>
      </div>

      {/* Résumé du bien */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600">
          Prix d&apos;achat : <span className="font-semibold">{formatCurrency(prixAchat)}</span>
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

        <div className="bg-primary-50 rounded-lg p-4 flex flex-col justify-center">
          <p className="text-sm text-primary-600">Montant à emprunter</p>
          <p className="text-2xl font-bold text-primary-700">
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

      <PercentInput
        label="Taux d'assurance emprunteur"
        placeholder="0.3"
        hint="Taux annuel sur le capital initial"
        error={errors.assurance_pret?.message}
        {...register('assurance_pret', { valueAsNumber: true })}
      />

      {/* Simulation mensualité */}
      {mensualite > 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600">Mensualité estimée (hors assurance)</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(mensualite)} / mois
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
