import { test, expect } from '@playwright/test';

test.describe('Parcours Simulation Complète', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', exception => console.log(`PAGE ERROR: "${exception}"`));
        await page.goto('/calculateur');
    });

    test('Simulation Nom Propre - Location Nue', async ({ page }) => {
        test.setTimeout(60000);

        // Validation étape 1: Le bien
        await expect(page.getByRole('heading', { name: 'Informations du bien' })).toBeVisible();
        await page.getByLabel(/Adresse du bien/i).fill('10 rue de Rivoli, 75001 Paris');
        await page.getByLabel(/Prix d'achat/i).fill('150000');
        await page.getByLabel(/Surface/i).fill('15');

        // Remplir les champs optionnels
        await page.getByLabel(/Année de construction/i).fill('1990');
        await page.getByLabel(/Montant des travaux/i).fill('0');
        await page.getByLabel(/Valeur du mobilier/i).fill('0');

        await page.getByRole('button', { name: 'Continuer' }).click();

        // Check for validation errors if navigation fails
        const errorText = page.locator('.error-message');
        if (await errorText.count() > 0) {
            console.log('Validation Errors Step 1:', await errorText.allInnerTexts());
        }

        // Validation étape 2: Financement
        await expect(page.getByRole('heading', { name: 'Financement' })).toBeVisible();
        await page.getByLabel(/Apport personnel/i).fill('30000');
        await page.getByLabel(/Durée de l'emprunt/i).fill('20');
        await page.getByLabel(/Taux d'intérêt/i).first().fill('3.5');
        await page.getByLabel(/Taux d'assurance/i).fill('0.3');
        await page.getByLabel(/Frais de dossier/i).fill('500');
        await page.getByLabel(/Frais de garantie/i).fill('2000');
        await page.getByRole('button', { name: 'Continuer' }).click();

        // Validation étape 3: Exploitation
        await expect(page.getByRole('heading', { name: 'Exploitation' })).toBeVisible();
        await page.getByLabel(/Loyer mensuel/i).fill('750');
        await page.getByLabel(/Charges de copropriété/i).fill('1200');
        await page.getByLabel(/Taxe foncière/i).fill('800');
        // Type location defaults to nue
        await page.getByRole('button', { name: 'Continuer' }).click();

        // Validation étape 4: Structure
        await expect(page.getByRole('heading', { name: 'Structure juridique' })).toBeVisible();

        // Click Structure 'Nom propre' (Card)
        await page.getByRole('button', { name: /Nom propre/i }).click();

        // Click 'Location Nue' type exploitation
        await page.getByRole('button', { name: 'Location Nue' }).click();

        // Click 'Micro-foncier' regime
        await page.getByRole('button', { name: /Micro-foncier/i }).click();

        await page.getByRole('button', { name: 'Continuer' }).click();

        // Validation étape 5: Options
        // Assuming there is a submit button.
        await page.getByRole('button', { name: /Calculer|Terminer|Voir les résultats/i }).click();

        // Validation Résultats
        await expect(page).toHaveURL(/.*\/calculateur\/resultats/);
        await expect(page.getByText('Indice de Performance')).toBeVisible({ timeout: 20000 });
        await expect(page.getByText('Cash-flow Net')).toBeVisible();
    });
});
