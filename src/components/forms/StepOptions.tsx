'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Select, PercentInput } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { optionsSchema, type OptionsFormData } from '@/lib/validators';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useScenarioFormReset } from '@/hooks/useScenarioFormReset';
import { cn } from '@/lib/utils';

interface StepOptionsProps {
  onSubmit: () => void;
  onPrev: () => void;
  isLoading?: boolean;
}

export function StepOptions({ onSubmit, onPrev, isLoading }: StepOptionsProps) {
  const { getActiveScenario, updateOptions, activeScenarioId } = useCalculateurStore();
  const { options } = getActiveScenario();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(optionsSchema),
    defaultValues: {
      generer_pdf: options.generer_pdf ?? true,
      envoyer_email: options.envoyer_email ?? false,
      email: options.email || '',
      horizon_projection: options.horizon_projection ?? 20,
      taux_evolution_loyer: options.taux_evolution_loyer ?? 2,
      taux_evolution_charges: options.taux_evolution_charges ?? 2.5,
    },
  });

  useScenarioFormReset(reset, {
    generer_pdf: options.generer_pdf ?? true,
    envoyer_email: options.envoyer_email ?? false,
    email: options.email || '',
    horizon_projection: options.horizon_projection ?? 20,
    taux_evolution_loyer: options.taux_evolution_loyer ?? 2,
    taux_evolution_charges: options.taux_evolution_charges ?? 2.5,
  }, activeScenarioId);

  const watchedValues = watch();

  const handleFormSubmit = (data: OptionsFormData) => {
    updateOptions({
      generer_pdf: data.generer_pdf,
      envoyer_email: data.envoyer_email,
      email: data.email || '',
      horizon_projection: Number(data.horizon_projection),
      taux_evolution_loyer: Number(data.taux_evolution_loyer),
      taux_evolution_charges: Number(data.taux_evolution_charges),
    });
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal">Options</h2>
        <p className="text-pebble mt-1">
          Configurez les options de génération des résultats
        </p>
      </div>

      {/* Options de génération */}
      <div className="space-y-4">
        <OptionToggle
          label="Générer un PDF récapitulatif"
          description="Un document PDF détaillé sera généré avec tous les résultats"
          checked={watchedValues.generer_pdf}
          onChange={(checked) => setValue('generer_pdf', checked)}
        />

        <OptionToggle
          label="Envoyer par email"
          description="Recevez les résultats et le PDF directement par email"
          checked={watchedValues.envoyer_email}
          onChange={(checked) => setValue('envoyer_email', checked)}
        />
      </div>

      {/* Horizon de projection */}
      <div className="bg-surface p-4 rounded-xl border border-sand">
        <Select
          label="Horizon de projection"
          {...register('horizon_projection', { valueAsNumber: true })}
          options={[
            { value: 5, label: '5 ans' },
            { value: 10, label: '10 ans' },
            { value: 15, label: '15 ans' },
            { value: 20, label: '20 ans' },
            { value: 25, label: '25 ans' },
          ]}
          hint="Durée de la simulation financière"
        />
      </div>

      {/* Paramètres de projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-sand">
          <PercentInput
            label="Évolution annuelle loyers"
            hint="Indice IRL (historique 2%)"
            error={errors.taux_evolution_loyer?.message}
            {...register('taux_evolution_loyer', { valueAsNumber: true })}
          />
        </div>
        <div className="bg-surface p-4 rounded-xl border border-sand">
          <PercentInput
            label="Évolution annuelle charges"
            hint="Inflation (historique 2.5%)"
            error={errors.taux_evolution_charges?.message}
            {...register('taux_evolution_charges', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Champ email si option activée */}
      {watchedValues.envoyer_email && (
        <div className="pl-4 border-l-2 border-forest/30">
          <Input
            label="Adresse email"
            type="email"
            placeholder="votre@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
      )}

      {/* Récapitulatif */}
      <div className="bg-forest/5 rounded-xl p-5 border border-forest/10">
        <h3 className="font-bold text-charcoal mb-3">Récapitulatif</h3>
        <ul className="text-sm text-pebble space-y-2">
          <li className="flex items-center gap-2">
            <span className="text-forest">✓</span> Calcul de rentabilité (brute, nette, nette-nette)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-forest">✓</span> Analyse du cashflow mensuel et annuel
          </li>
          <li className="flex items-center gap-2">
            <span className="text-forest">✓</span> Simulation fiscale selon votre structure
          </li>
          <li className="flex items-center gap-2">
            <span className="text-forest">✓</span> Vérification conformité HCSF
          </li>
          <li className="flex items-center gap-2">
            <span className="text-forest">✓</span> Projection pluriannuelle sur {watchedValues.horizon_projection} ans
          </li>
          {watchedValues.generer_pdf && (
            <li className="flex items-center gap-2">
              <span className="text-forest">✓</span> Génération du PDF récapitulatif
            </li>
          )}
          {watchedValues.envoyer_email && (
            <li className="flex items-center gap-2">
              <span className="text-forest">✓</span> Envoi par email
            </li>
          )}
        </ul>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="secondary" onClick={onPrev}>
          Retour
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isLoading ? 'Calcul en cours...' : 'Calculer la rentabilité'}
        </Button>
      </div>
    </form>
  );
}

interface OptionToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function OptionToggle({ label, description, checked, onChange }: OptionToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'w-full p-5 rounded-xl border-2 text-left transition-all duration-300',
        'flex items-start gap-4',
        checked
          ? 'border-forest bg-surface shadow-[0_0_0_1px_rgba(45,90,69,1)]'
          : 'border-sand bg-white hover:border-pebble shadow-sm'
      )}
    >
      <div
        className={cn(
          'w-6 h-6 rounded border-2 flex-shrink-0 mt-0.5',
          'flex items-center justify-center transition-colors',
          checked
            ? 'bg-forest border-forest'
            : 'bg-white border-sand'
        )}
      >
        {checked && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <div>
        <p className={cn(
          'font-bold transition-colors',
          checked ? 'text-forest' : 'text-charcoal'
        )}>{label}</p>
        <p className="text-sm text-pebble mt-1 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}
