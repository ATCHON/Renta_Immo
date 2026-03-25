// @vitest-environment jsdom
/**
 * UX-S02a — Tests unitaires : SimulatorLayout
 *
 * Vérifie le rendu du layout split-screen avec les bonnes régions ARIA
 * et la propagation correcte du currentStep vers ResultsAnchor.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock ResultsAnchor pour isoler SimulatorLayout
vi.mock('@/components/layout/ResultsAnchor', () => ({
  ResultsAnchor: ({ currentStep, compact }: { currentStep: number; compact?: boolean }) => (
    <div
      data-testid="results-anchor"
      data-step={currentStep}
      data-compact={compact ? 'true' : 'false'}
    >
      ResultsAnchor mock step={currentStep}
    </div>
  ),
}));

import { SimulatorLayout } from '@/components/layout/SimulatorLayout';

describe('SimulatorLayout', () => {
  it('renders children in the content area (desktop + mobile)', () => {
    render(
      <SimulatorLayout currentStep={1}>
        <div data-testid="form-content">Form Content</div>
      </SimulatorLayout>
    );
    // Children rendered in both desktop and mobile panes
    const instances = screen.getAllByTestId('form-content');
    expect(instances.length).toBeGreaterThanOrEqual(1);
    expect(instances[0].textContent).toBe('Form Content');
  });

  it('renders ResultsAnchor with the correct currentStep', () => {
    render(
      <SimulatorLayout currentStep={3}>
        <div>children</div>
      </SimulatorLayout>
    );
    // Both desktop (full) and mobile (compact) anchors are rendered
    const anchors = screen.getAllByTestId('results-anchor');
    expect(anchors.length).toBeGreaterThanOrEqual(1);
    expect(anchors[0].getAttribute('data-step')).toBe('3');
  });

  it('passes compact=true to the mobile bottom panel', () => {
    render(
      <SimulatorLayout currentStep={2}>
        <div>children</div>
      </SimulatorLayout>
    );
    const anchors = screen.getAllByTestId('results-anchor');
    // One should be compact (mobile) and one not (desktop)
    const compactValues = anchors.map((a) => a.getAttribute('data-compact'));
    expect(compactValues).toContain('true');
    expect(compactValues).toContain('false');
  });

  it('renders desktop aside with correct aria-label', () => {
    render(
      <SimulatorLayout currentStep={1}>
        <div>children</div>
      </SimulatorLayout>
    );
    expect(screen.getByRole('complementary', { name: /résultats en temps réel/i })).toBeTruthy();
  });
});
