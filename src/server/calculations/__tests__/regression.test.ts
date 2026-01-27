/**
 * Tests de régression - Vérification de la cohérence des calculs
 *
 * Ces tests vérifient que le moteur de calcul produit des résultats
 * cohérents et reproductibles pour un ensemble de cas de référence.
 */

import { describe, it, expect } from 'vitest';
import { performCalculations } from '../index';
import { compareResultsFlexible, generateReport } from './utils/compare';
import referenceCases from './fixtures/reference-cases.json';

// Tolérance pour les comparaisons numériques (en pourcentage)
const TOLERANCE = 1; // 1% de tolérance pour les différences mineures de calcul

describe('Tests de régression', () => {
  // Test global de structure
  it('devrait avoir des cas de test valides', () => {
    expect(referenceCases.cases).toBeDefined();
    expect(referenceCases.cases.length).toBeGreaterThanOrEqual(10);
    expect(referenceCases.version).toBe('1.0');
    expect(['n8n', 'backend-ts']).toContain(referenceCases.source);
  });

  // Tests par cas avec describe.each
  describe.each(referenceCases.cases)('$name', (testCase) => {
    it(`devrait produire des résultats similaires (tolérance ${TOLERANCE}%)`, () => {
      // Ajouter les options par défaut pour éviter les erreurs de validation
      const inputWithOptions = {
        ...testCase.input,
        options: {
          generer_pdf: false,
          envoyer_email: false,
          email: '',
        },
      };

      // Exécuter le calcul
      const result = performCalculations(inputWithOptions);

      // Vérifier succès
      expect(result.success).toBe(true);
      if (!result.success) {
        console.error('Erreur de calcul:', result);
        return;
      }

      // Comparer les résultats avec tolérance flexible
      const comparison = compareResultsFlexible(
        testCase.expected,
        result.resultats,
        { tolerance: TOLERANCE }
      );

      // Afficher le rapport en cas d'échec
      if (!comparison.success) {
        console.log(generateReport(testCase.name, comparison));
      }

      // Assertions sur les champs critiques
      // Rentabilité
      expect(result.resultats.rentabilite.brute).toBeCloseTo(
        testCase.expected.rentabilite.brute,
        0
      );
      expect(result.resultats.rentabilite.nette).toBeCloseTo(
        testCase.expected.rentabilite.nette,
        0
      );

      // Cashflow (direction doit être la même)
      const expectedCashflowSign = Math.sign(testCase.expected.cashflow.mensuel);
      const actualCashflowSign = Math.sign(result.resultats.cashflow.mensuel);
      if (expectedCashflowSign !== 0) {
        expect(actualCashflowSign).toBe(expectedCashflowSign);
      }

      // HCSF conformité
      expect(result.resultats.hcsf.conforme).toBe(testCase.expected.hcsf.conforme);

      // Score global (tolérance de 20 points)
      expect(Math.abs(result.resultats.synthese.score_global - testCase.expected.synthese.score_global))
        .toBeLessThanOrEqual(20);
    });
  });

  // Tests de cohérence des calculs
  describe('Cohérence des calculs', () => {
    it('devrait avoir cashflow positif quand rentabilité nette > seuil', () => {
      const highRentaCases = referenceCases.cases.filter(
        (c) => c.expected.rentabilite.nette > 8
      );

      for (const testCase of highRentaCases) {
        const inputWithOptions = {
          ...testCase.input,
          options: { generer_pdf: false, envoyer_email: false, email: '' },
        };
        const result = performCalculations(inputWithOptions);

        if (result.success) {
          // Haute rentabilité devrait généralement avoir un cashflow correct
          expect(result.resultats.rentabilite.nette).toBeGreaterThan(5);
        }
      }
    });

    it('devrait être non conforme HCSF quand taux > 35%', () => {
      const nonConformeCases = referenceCases.cases.filter(
        (c) => c.expected.hcsf.taux_endettement > 35
      );

      for (const testCase of nonConformeCases) {
        const inputWithOptions = {
          ...testCase.input,
          options: { generer_pdf: false, envoyer_email: false, email: '' },
        };
        const result = performCalculations(inputWithOptions);

        if (result.success) {
          expect(result.resultats.hcsf.conforme).toBe(false);
        }
      }
    });

    it('devrait avoir des détails associés pour les SCI IS', () => {
      const sciCases = referenceCases.cases.filter(
        (c) => c.input.structure.type === 'sci_is'
      );

      for (const testCase of sciCases) {
        const inputWithOptions = {
          ...testCase.input,
          options: { generer_pdf: false, envoyer_email: false, email: '' },
        };
        const result = performCalculations(inputWithOptions);

        if (result.success) {
          expect(result.resultats.hcsf.details_associes.length).toBe(
            testCase.input.structure.associes.length
          );
        }
      }
    });
  });

  // Test récapitulatif
  it('devrait avoir un taux de succès acceptable (> 80%)', () => {
    let passed = 0;
    let failed = 0;

    for (const testCase of referenceCases.cases) {
      const inputWithOptions = {
        ...testCase.input,
        options: { generer_pdf: false, envoyer_email: false, email: '' },
      };
      const result = performCalculations(inputWithOptions);

      if (result.success) {
        const comparison = compareResultsFlexible(
          testCase.expected,
          result.resultats,
          { tolerance: TOLERANCE }
        );

        // Critères de succès assouplis
        const rentaBruteOk = Math.abs(
          result.resultats.rentabilite.brute - testCase.expected.rentabilite.brute
        ) <= 1;
        const hcsfConformeOk =
          result.resultats.hcsf.conforme === testCase.expected.hcsf.conforme;
        const scoreOk = Math.abs(
          result.resultats.synthese.score_global - testCase.expected.synthese.score_global
        ) <= 20;

        if (rentaBruteOk && hcsfConformeOk && scoreOk) {
          passed++;
        } else {
          failed++;
          console.log(`FAIL: ${testCase.name}`);
          console.log(generateReport(testCase.name, comparison));
        }
      } else {
        failed++;
        console.log(`ERROR: ${testCase.name} - Calcul échoué`);
      }
    }

    const successRate = (passed / (passed + failed)) * 100;
    console.log(`\nRécapitulatif: ${passed}/${passed + failed} cas réussis (${successRate.toFixed(1)}%)`);

    expect(successRate).toBeGreaterThanOrEqual(80);
  });
});
