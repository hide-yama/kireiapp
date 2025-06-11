import { test, expect } from '@playwright/test';

test.describe('Kireiapp E2E Tests', () => {
  test('ホームページが表示される', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/キレイにできるもん/);
    await expect(page.getByRole('heading', { name: 'キレイにできるもん' })).toBeVisible();
  });

  test('ログインページへの遷移', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=ログイン');
    await expect(page).toHaveURL(/.*signin/);
  });

  test('新規登録ページへの遷移', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=新規登録');
    await expect(page).toHaveURL(/.*signup/);
  });
});