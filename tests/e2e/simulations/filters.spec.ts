import { test, expect } from '@playwright/test';
import { loginAs, TEST_USER } from '../helpers/auth';

test.describe('Filtres et recherche simulations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/simulations');
  });

  test('la page simulations se charge', async ({ page }) => {
    await expect(page).toHaveURL(/\/simulations/);
    await expect(page.getByRole('button', { name: /Favoris/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Archivés/i })).toBeVisible();
  });

  test("filtre Favoris reflète status=favorites dans l'URL", async ({ page }) => {
    await page.getByRole('button', { name: /Favoris/i }).click();
    await expect(page).toHaveURL(/status=favorites/);
  });

  test("filtre Archivés reflète status=archived dans l'URL", async ({ page }) => {
    await page.getByRole('button', { name: /Archivés/i }).click();
    await expect(page).toHaveURL(/status=archived/);
  });

  test('filtre Tous efface le filtre de status', async ({ page }) => {
    await page.getByRole('button', { name: /Favoris/i }).click();
    await page.getByRole('button', { name: /Tous/i }).click();
    // Soit l'URL n'a plus de status, soit status=all
    const url = page.url();
    expect(url).not.toMatch(/status=favorites/);
    expect(url).not.toMatch(/status=archived/);
  });

  test("la recherche par nom reflète q= dans l'URL", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/rechercher/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('test-inexistant-xyz');
    await page.waitForTimeout(600); // debounce
    await expect(page).toHaveURL(/q=test-inexistant-xyz/);
  });

  test('les filtres sont restaurés après navigation arrière/avant', async ({ page }) => {
    await page.getByRole('button', { name: /Favoris/i }).click();
    await expect(page).toHaveURL(/status=favorites/);
    await page.goBack();
    await page.goForward();
    await expect(page).toHaveURL(/status=favorites/);
  });
});
