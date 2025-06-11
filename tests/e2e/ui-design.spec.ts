import { test, expect } from '@playwright/test';

test.describe('UI Design Tests', () => {
  test('新しいUIデザインが正しく表示される', async ({ page }) => {
    await page.goto('/');
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'test-results/home-page.png', fullPage: true });
    
    // 背景のグラデーションが適用されているか確認
    const body = page.locator('body');
    await expect(body).toHaveClass(/bg-gradient-to-br/);
    
    // ヘッダーのタイトルが表示されているか
    await expect(page.getByRole('heading', { name: 'キレイにできるもん' })).toBeVisible();
    
    // ボタンのスタイルが適用されているか
    const signinButton = page.getByRole('link', { name: 'ログイン' });
    await expect(signinButton).toBeVisible();
    
    // カードコンポーネントが表示されているか
    const card = page.locator('.rounded-2xl').first();
    await expect(card).toBeVisible();
  });

  test('ログインページのUIデザイン', async ({ page }) => {
    await page.goto('/signin');
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'test-results/signin-page.png', fullPage: true });
    
    // フォーム要素の確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    
    // ボタンのスタイル確認
    const submitButton = page.getByRole('button', { name: 'ログイン' });
    await expect(submitButton).toHaveClass(/rounded-xl/);
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    // モバイルビューポート
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });
    
    // デスクトップビューポート
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await page.screenshot({ path: 'test-results/desktop-view.png', fullPage: true });
  });
});