import { test, expect } from '@playwright/test';

test.describe('Routes protégées', () => {
  test('accéder à /simulations sans auth redirige vers /auth/login', async ({ page }) => {
    await page.goto('/simulations');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("l'URL de callback est préservée dans la redirection", async ({ page }) => {
    await page.goto('/simulations');
    await expect(page).toHaveURL(/callbackUrl/);
  });

  test('/calculateur est accessible sans authentification', async ({ page }) => {
    await page.goto('/calculateur');
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });

  test('la page de login affiche le formulaire correctement', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
  });
});
