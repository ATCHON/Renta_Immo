import { Page } from '@playwright/test';

export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'test-auth-script@example.com',
  password: process.env.E2E_TEST_PASSWORD ?? 'Password123!',
};

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mot de passe/i).fill(password);
  await page.getByRole('button', { name: /se connecter/i }).click();
  await page.waitForURL(/\/(calculateur|simulations)/);
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /se déconnecter/i }).click();
  await page.waitForURL('/auth/login');
}
