import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from '../helpers/auth';

test.describe('Déconnexion', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
  });

  test('déconnexion depuis une session active redirige vers login', async ({ page }) => {
    await page.getByRole('button', { name: /se déconnecter/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test('après déconnexion, /simulations redirige vers login', async ({ page }) => {
    await page.getByRole('button', { name: /se déconnecter/i }).click();
    await page.waitForURL(/\/auth\/login/);
    await page.goto('/simulations');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
