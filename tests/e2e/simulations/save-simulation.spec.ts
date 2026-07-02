import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from '../helpers/auth';

test.describe('Sauvegarde de simulation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
  });

  test('ouvrir la modal de sauvegarde et remplir le nom via fill()', async ({ page }) => {
    // Naviguer jusqu'aux résultats en complétant le formulaire calculateur
    await page.goto('/calculateur');

    // Étape 1 : Le bien
    await expect(page.getByRole('heading', { name: 'Informations du bien' })).toBeVisible();
    await page.getByLabel(/Adresse du bien/i).fill('10 rue de la Paix, 75002 Paris');
    await page.getByLabel(/Prix d'achat/i).fill('200000');
    await page.getByLabel(/Surface/i).fill('40');
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Étape 2 : Financement
    await expect(page.getByRole('heading', { name: 'Financement' })).toBeVisible();
    await page.getByLabel(/Apport personnel/i).fill('40000');
    await page.getByLabel(/Durée de l'emprunt/i).fill('20');
    await page.getByLabel(/Taux d'intérêt/i).first().fill('3.5');
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Étape 3 : Exploitation
    await expect(page.getByRole('heading', { name: 'Exploitation' })).toBeVisible();
    await page.getByLabel(/Loyer mensuel/i).fill('900');
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Étape 4 : Structure
    await expect(page.getByRole('heading', { name: 'Structure juridique' })).toBeVisible();
    await page.getByRole('button', { name: /Nom propre/i }).click();
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Étape 5 : Lancer le calcul
    await page.getByRole('button', { name: /Calculer|Terminer|Voir les résultats/i }).click();

    // Page résultats
    await expect(page).toHaveURL(/\/calculateur\/resultats/, { timeout: 20000 });

    // Ouvrir la modal de sauvegarde
    await page.getByRole('button', { name: /Sauvegarder la simulation/i }).click();

    // Vérifier que la modal est ouverte
    await expect(page.getByRole('dialog').or(page.locator('h2').filter({ hasText: 'Sauvegarder la simulation' }))).toBeVisible({ timeout: 5000 });

    // IMPORTANT : utiliser fill() de Playwright (pas d'injection JS directe)
    // Cela déclenche correctement l'événement onChange de React
    await page.getByLabel(/Nom de la simulation/i).fill('Simulation E2E Test');

    // Le bouton Sauvegarder doit être activé après fill()
    const saveBtn = page.getByRole('button', { name: /^Sauvegarder$/ });
    await expect(saveBtn).toBeEnabled({ timeout: 3000 });
  });

  test('le bouton Sauvegarder reste désactivé si le nom est vide', async ({ page }) => {
    await page.goto('/calculateur');

    // Étape 1
    await expect(page.getByRole('heading', { name: 'Informations du bien' })).toBeVisible();
    await page.getByLabel(/Adresse du bien/i).fill('5 avenue Victor Hugo, 69006 Lyon');
    await page.getByLabel(/Prix d'achat/i).fill('180000');
    await page.getByLabel(/Surface/i).fill('35');
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Étape 2
    await expect(page.getByRole('heading', { name: 'Financement' })).toBeVisible();
    await page.getByLabel(/Apport personnel/i).fill('36000');
    await page.getByLabel(/Durée de l'emprunt/i).fill('20');
    await page.getByLabel(/Taux d'intérêt/i).first().fill('3.5');
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Étape 3
    await expect(page.getByRole('heading', { name: 'Exploitation' })).toBeVisible();
    await page.getByLabel(/Loyer mensuel/i).fill('800');
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Étape 4
    await expect(page.getByRole('heading', { name: 'Structure juridique' })).toBeVisible();
    await page.getByRole('button', { name: /Nom propre/i }).click();
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Étape 5
    await page.getByRole('button', { name: /Calculer|Terminer|Voir les résultats/i }).click();

    await expect(page).toHaveURL(/\/calculateur\/resultats/, { timeout: 20000 });

    // Ouvrir la modal
    await page.getByRole('button', { name: /Sauvegarder la simulation/i }).click();
    await expect(page.locator('h2').filter({ hasText: 'Sauvegarder la simulation' })).toBeVisible({ timeout: 5000 });

    // Le champ nom est vide → bouton désactivé
    const nameInput = page.getByLabel(/Nom de la simulation/i);
    await expect(nameInput).toHaveValue('');
    const saveBtn = page.getByRole('button', { name: /^Sauvegarder$/ });
    await expect(saveBtn).toBeDisabled();
  });
});
