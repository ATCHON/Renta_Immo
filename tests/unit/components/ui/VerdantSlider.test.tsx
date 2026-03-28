// @vitest-environment jsdom
/**
 * UX-S02 — Tests unitaires : VerdantSlider
 *
 * Verifie :
 * - Rendu du label et de l'unite
 * - Valeur initiale correcte
 * - Appel onChange sur range change
 * - Appel onChange sur input numerique
 * - Clampage min/max
 * - Affichage des bornes min/max
 * - Affichage de l'hint
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VerdantSlider } from '@/components/ui/VerdantSlider';

describe('VerdantSlider — rendu de base', () => {
  it('affiche le label', () => {
    render(<VerdantSlider value={50} onChange={vi.fn()} min={0} max={100} label="Taux" />);
    expect(screen.getByText('Taux')).toBeDefined();
  });

  it("affiche l'unite dans le span", () => {
    render(<VerdantSlider value={50} onChange={vi.fn()} min={0} max={100} label="Taux" unit="%" />);
    const units = screen.getAllByText('%');
    expect(units.length).toBeGreaterThanOrEqual(1);
  });

  it("affiche la valeur dans l'input numerique", () => {
    render(<VerdantSlider value={70} onChange={vi.fn()} min={0} max={100} label="Occupation" />);
    const numericInput = screen.getByRole('spinbutton');
    expect((numericInput as HTMLInputElement).value).toBe('70');
  });

  it('affiche les bornes min et max', () => {
    render(<VerdantSlider value={0} onChange={vi.fn()} min={10} max={90} unit="%" />);
    expect(document.body.textContent).toContain('10%');
    expect(document.body.textContent).toContain('90%');
  });

  it('affiche le hint quand fourni', () => {
    render(
      <VerdantSlider
        value={50}
        onChange={vi.fn()}
        min={0}
        max={100}
        hint="Valeur recommandee : 70%"
      />
    );
    expect(screen.getByText('Valeur recommandee : 70%')).toBeDefined();
  });
});

describe('VerdantSlider — interactions', () => {
  it('appelle onChange avec la valeur numerique du range', () => {
    const handleChange = vi.fn();
    render(<VerdantSlider value={50} onChange={handleChange} min={0} max={100} label="Slider" />);
    const rangeInput = screen.getByRole('slider');
    fireEvent.change(rangeInput, { target: { value: '75' } });
    expect(handleChange).toHaveBeenCalledWith(75);
  });

  it("appelle onChange via l'input numerique", () => {
    const handleChange = vi.fn();
    render(
      <VerdantSlider value={50} onChange={handleChange} min={0} max={100} label="Occupation" />
    );
    const numericInput = screen.getByRole('spinbutton');
    fireEvent.change(numericInput, { target: { value: '80' } });
    expect(handleChange).toHaveBeenCalledWith(80);
  });

  it("clamp la valeur au max si l'input numerique depasse le max", () => {
    const handleChange = vi.fn();
    render(
      <VerdantSlider value={50} onChange={handleChange} min={0} max={100} label="Occupation" />
    );
    const numericInput = screen.getByRole('spinbutton');
    fireEvent.change(numericInput, { target: { value: '150' } });
    expect(handleChange).toHaveBeenCalledWith(100);
  });

  it("clamp la valeur au min si l'input numerique est en dessous du min", () => {
    const handleChange = vi.fn();
    render(
      <VerdantSlider value={50} onChange={handleChange} min={10} max={100} label="Occupation" />
    );
    const numericInput = screen.getByRole('spinbutton');
    fireEvent.change(numericInput, { target: { value: '5' } });
    expect(handleChange).toHaveBeenCalledWith(10);
  });

  it('appelle onChange avec min quand la valeur est vide (jsdom number input)', () => {
    const handleChange = vi.fn();
    render(
      <VerdantSlider value={50} onChange={handleChange} min={10} max={100} label="Occupation" />
    );
    const numericInput = screen.getByRole('spinbutton');
    // jsdom convertit les valeurs invalides en chaine vide → Number('') = 0 → clampe au min
    fireEvent.change(numericInput, { target: { value: '' } });
    expect(handleChange).toHaveBeenCalledWith(10);
  });
});
