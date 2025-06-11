import { test, expect } from '@playwright/test';

test.describe('Visual Hover Tests', () => {
  test('ログインボタンのホバー効果を視覚的に確認', async ({ page }) => {
    // ホームページへアクセス
    await page.goto('http://localhost:3000');
    console.log('✅ ホームページにアクセスしました');

    // 少し待機してページが完全に読み込まれるまで待つ
    await page.waitForLoadState('networkidle');
    
    // ログインボタンを取得
    const loginButton = page.locator('text=ログイン');
    await expect(loginButton).toBeVisible();
    
    // ホバー前のスクリーンショット（全体）
    await page.screenshot({ 
      path: 'test-results/hover-before.png', 
      fullPage: false 
    });
    console.log('📸 ホバー前のスクリーンショットを撮影しました');

    // ボタンにホバー
    await loginButton.hover();
    
    // ホバー効果が反映されるまで少し待機
    await page.waitForTimeout(500);
    
    // ホバー後のスクリーンショット（全体）
    await page.screenshot({ 
      path: 'test-results/hover-after.png', 
      fullPage: false 
    });
    console.log('📸 ホバー後のスクリーンショットを撮影しました');

    // ボタンだけのクローズアップスクリーンショット
    await loginButton.screenshot({ 
      path: 'test-results/login-button-hover-closeup.png' 
    });
    console.log('📸 ログインボタンのクローズアップを撮影しました');

    // 新規登録ボタンでも同様にテスト
    const signupButton = page.locator('text=新規登録');
    await signupButton.hover();
    await page.waitForTimeout(500);
    
    await signupButton.screenshot({ 
      path: 'test-results/signup-button-hover-closeup.png' 
    });
    console.log('📸 新規登録ボタンのクローズアップを撮影しました');

    // 最終状態のスクリーンショット
    await page.screenshot({ 
      path: 'test-results/final-state.png', 
      fullPage: false 
    });
    console.log('📸 最終状態のスクリーンショットを撮影しました');
  });
});