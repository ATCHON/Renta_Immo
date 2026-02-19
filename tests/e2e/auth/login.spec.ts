import { test, expect } from '@playwright/test';
import { TEST_USER } from '../helpers/auth';

test.describe('Connexion email/mot de passe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('connexion valide redirige vers le calculateur ou simulations', async ({ page }) => {
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/mot de passe/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /se connecter/i }).click();
    await expect(page).toHaveURL(/\/(calculateur|simulations)/, { timeout: 15000 });
  });

  test('mot de passe incorrect affiche une erreur', async ({ page }) => {
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/mot de passe/i).fill('mauvais-mot-de-passe');
    await page.getByRole('button', { name: /se connecter/i }).click();
    await expect(
      page.getByRole('alert').or(page.getByText(/erreur|incorrect|invalide|invalid/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('email inexistant affiche une erreur', async ({ page }) => {
    await page.getByLabel(/email/i).fill('inexistant-xyz-123@example.com');
    await page.getByLabel(/mot de passe/i).fill('Password123!');
    await page.getByRole('button', { name: /se connecter/i }).click();
    await expect(
      page.getByRole('alert').or(page.getByText(/erreur|incorrect|invalide|invalid/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('le champ mot de passe est masqué (type=password)', async ({ page }) => {
    const passwordField = page.getByLabel(/mot de passe/i);
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test("un lien vers l'inscription est présent", async ({ page }) => {
    await expect(page.getByRole('link', { name: /inscription|s'inscrire|créer/i })).toBeVisible();
  });
});
