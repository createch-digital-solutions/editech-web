import { test, expect } from '@playwright/test';

test.describe('E2E Smoke Tests', () => {
  test('homepage loads successfully with branding and route links', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Createch/);
    await expect(
      page.getByRole('heading', {
        name: 'Welcome to Createch Learning Platform',
      })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Learner Portal' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Instructor Portal' })
    ).toBeVisible();
  });
});
