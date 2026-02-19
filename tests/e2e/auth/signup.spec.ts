import { test, expect } from '@playwright/test';

test.describe('Inscription', () => {
  test("la page d'inscription affiche le formulaire", async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /s'inscrire/i })).toBeVisible();
  });

  test('email déjà utilisé affiche une erreur', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByLabel(/nom/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test-auth-script@example.com');
    await page.getByLabel(/mot de passe/i).fill('Password123!');
    await page.getByRole('button', { name: /s'inscrire/i }).click();
    await expect(page.getByText(/existe déjà|already|utilisé|error/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('inscription avec email unique et mot de passe fort', async ({ page }) => {
    const email = `test-e2e-${Date.now()}@example.com`;
    await page.goto('/auth/signup');
    await page.getByLabel(/nom/i).fill('Test E2E');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/mot de passe/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /s'inscrire/i }).click();
    await expect(page).toHaveURL(/\/(calculateur|simulations)/, { timeout: 15000 });
  });
});
