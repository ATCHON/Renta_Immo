'use client';

/**
 * UX-S02a — Page Calculateur avec SimulatorLayout split-screen
 */

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormWizard } from '@/components/forms';
import { SimulatorLayout } from '@/components/layout/SimulatorLayout';
import { useCalculateurStore } from '@/stores/calculateur.store';
import type { SidebarStep } from '@/components/layout/ResultsAnchor';

export default function CalculateurPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reset = useCalculateurStore((state) => state.reset);
  const storeStep = useCalculateurStore((state) => state.currentStep);

  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      reset();
      router.replace('/calculateur');
    }
  }, [searchParams, reset, router]);

  // Map du step store (0–5) vers le step sidebar (1–5)
  const sidebarStep = Math.min(Math.max(storeStep + 1, 1), 5) as SidebarStep;

  return (
    <SimulatorLayout currentStep={sidebarStep}>
      <FormWizard />
    </SimulatorLayout>
  );
}
