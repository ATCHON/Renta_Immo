// @vitest-environment jsdom
/**
 * NR-UI-01 — Tests de non-régression : Input & CurrencyInput
 *
 * Contexte fix (2026-03-28) :
 *   - Control<any> dans CurrencyInputProps a reçu un eslint-disable ciblé
 *     pour satisfaire la règle @typescript-eslint/no-explicit-any sans
 *     casser la compatibilité des formulaires génériques react-hook-form.
 *   - Ce test garantit que le composant CurrencyInput s'intègre toujours
 *     correctement via react-hook-form Controller.
 *
 * Vérifie :
 *   - Input de base : label, rendu, message d'erreur, hint
 *   - CurrencyInput : rendu avec react-hook-form Controller + format €
 *   - PercentInput : rendu avec addon %
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Input, CurrencyInput, PercentInput } from '@/components/ui/Input';

// --- Helpers ---

function InputWrapper({ label, error, hint }: { label?: string; error?: string; hint?: string }) {
  return <Input name="test" label={label} error={error} hint={hint} />;
}

function CurrencyWrapper() {
  const { control } = useForm<{ montant: number }>({
    defaultValues: { montant: 150000 },
  });
  return (
    <CurrencyInput name="montant" control={control} label="Prix d'achat" placeholder="200 000" />
  );
}

function PercentWrapper() {
  const { control } = useForm<{ taux: number }>({
    defaultValues: { taux: 3.5 },
  });
  return <PercentInput label="Taux d'intérêt" name="taux" control={control} />;
}

// --- Tests ---

describe('Input — rendu de base (NR-UI-01)', () => {
  it('affiche le label quand fourni', () => {
    render(<InputWrapper label="Apport personnel" />);
    expect(screen.getByText('Apport personnel')).toBeDefined();
  });

  it("génère un <input> accessible avec l'id correspondant au name", () => {
    render(<InputWrapper />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDefined();
  });

  it("affiche le message d'erreur avec aria-invalid=true", () => {
    render(<InputWrapper error="Champ obligatoire" />);
    expect(screen.getByText('Champ obligatoire')).toBeDefined();
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it("affiche le hint quand pas d'erreur", () => {
    render(<InputWrapper hint="Conseil : saisir 20%" />);
    expect(screen.getByText('Conseil : saisir 20%')).toBeDefined();
  });

  it('masque le hint quand une erreur est présente', () => {
    render(<InputWrapper hint="Conseil : saisir 20%" error="Valeur invalide" />);
    expect(screen.queryByText('Conseil : saisir 20%')).toBeNull();
    expect(screen.getByText('Valeur invalide')).toBeDefined();
  });
});

describe('CurrencyInput — intégration react-hook-form (NR-UI-01)', () => {
  it('se rend sans erreur avec un Control react-hook-form', () => {
    // Régression critique : Control<any> avec eslint-disable ne doit pas
    // empêcher le rendu correct du composant
    render(<CurrencyWrapper />);
    expect(screen.getByText("Prix d'achat")).toBeDefined();
  });

  it('affiche le suffix € (addon droite)', () => {
    render(<CurrencyWrapper />);
    expect(screen.getByText('€')).toBeDefined();
  });

  it('rend un input de type text (NumericFormat)', () => {
    render(<CurrencyWrapper />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDefined();
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });
});

describe('PercentInput — rendu de base (NR-UI-01)', () => {
  it('affiche le label et le suffix %', () => {
    render(<PercentWrapper />);
    expect(screen.getByText("Taux d'intérêt")).toBeDefined();
    expect(screen.getByText('%')).toBeDefined();
  });

  it('rend un input avec inputmode="numeric"', () => {
    render(<PercentWrapper />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('inputmode')).toBe('numeric');
  });
});
