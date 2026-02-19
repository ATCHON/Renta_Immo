import { test, expect } from '@playwright/test';

test.describe('Validation formulaire calculateur', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculateur');
  });

  test('la page calculateur se charge sans redirection vers login', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page.locator('main, [role="main"], form').first()).toBeVisible();
  });

  test("passer l'étape 1 sans remplir le formulaire affiche une validation", async ({ page }) => {
    const nextBtn = page
      .getByRole('button', { name: /suivant|continuer|next|étape suivante/i })
      .first();
    if (await nextBtn.isVisible({ timeout: 3000 })) {
      await nextBtn.click();
      // Une erreur de validation ou un message d'alerte doit apparaître
      await expect(
        page.getByText(/requis|obligatoire|required|renseigner/i).or(page.getByRole('alert'))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("le calculateur contient un champ prix d'achat ou similaire", async ({ page }) => {
    // Vérifier qu'au moins un champ de saisie est présent dans l'étape 1
    const inputField = page.getByRole('spinbutton').or(page.getByRole('textbox')).first();
    await expect(inputField).toBeVisible({ timeout: 5000 });
  });
});
