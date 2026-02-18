import { test, expect } from '@playwright/test';

test.describe('Gestion Multi-Scénarios', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/calculateur');
        // Pré-remplir un scénario basique pour avoir des résultats
        await page.getByLabel(/Adresse du bien/i).fill('Test Multi');
        await page.getByLabel(/Prix d'achat/i).fill('100000');
        await page.getByLabel(/Surface/i).fill('20');
        await page.getByRole('button', { name: 'Continuer' }).click();

        await page.getByLabel(/Apport personnel/i).fill('10000');
        await page.getByLabel(/Durée de l'emprunt/i).fill('20');
        await page.getByLabel(/Taux d'intérêt/i).first().fill('3.5');
        await page.getByRole('button', { name: 'Continuer' }).click();

        await page.getByLabel(/Loyer mensuel/i).fill('500');
        await page.getByRole('button', { name: 'Continuer' }).click();

        await page.getByRole('button', { name: 'Location Nue' }).click();
        await page.getByRole('button', { name: /Micro-foncier/i }).click();
        await page.getByRole('button', { name: 'Continuer' }).click();

        await page.getByRole('button', { name: /Calculer/i }).click();
        await expect(page).toHaveURL(/.*\/calculateur\/resultats/);
    });

    test('Duplication et Comparaison', () => {
        // TODO: Implémenter la duplication quand le bouton sera accessible
        // Actuellement, je ne suis pas sûr où est le bouton dupliquer.
        // Dashboard a-t-il un bouton dupliquer?
        // Je vérifie Dashboard.tsx
    });
});
