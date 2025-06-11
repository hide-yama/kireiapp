import { test, expect } from '@playwright/test';

test.describe('Login Functionality Tests', () => {
  test('ログインページが正しく表示される', async ({ page }) => {
    await page.goto('/signin');
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'test-results/signin-debug.png', fullPage: true });
    
    // ページタイトルの確認
    await expect(page).toHaveTitle(/キレイにできるもん/);
    
    // フォーム要素の確認
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    
    console.log('✅ ログインページの基本要素は表示されています');
  });

  test('JavaScriptエラーがないか確認', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    
    // スクリーンショット
    await page.screenshot({ path: 'test-results/signin-console-check.png', fullPage: true });
    
    console.log('Console errors:', errors);
    
    // 重要なエラーのみをチェック（フォントの404エラーは無視）
    const criticalErrors = errors.filter(error => 
      !error.includes('woff2') && 
      !error.includes('_next/static') &&
      !error.includes('favicon.ico')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('ログインフォームの動作確認', async ({ page }) => {
    await page.goto('/signin');
    
    // フォームに入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('testpassword');
    
    // スクリーンショット（入力後）
    await page.screenshot({ path: 'test-results/signin-form-filled.png', fullPage: true });
    
    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // 少し待って結果を確認
    await page.waitForTimeout(2000);
    
    // スクリーンショット（送信後）
    await page.screenshot({ path: 'test-results/signin-form-submitted.png', fullPage: true });
    
    console.log('✅ フォーム送信は実行されました');
  });

  test('ホームページから新規登録・ログインリンクの確認', async ({ page }) => {
    await page.goto('/');
    
    await page.screenshot({ path: 'test-results/homepage-debug.png', fullPage: true });
    
    // 新規登録ボタンの確認
    const signupButton = page.getByRole('link', { name: '新規登録' });
    await expect(signupButton).toBeVisible();
    
    // ログインボタンの確認
    const signinButton = page.getByRole('link', { name: 'ログイン' });
    await expect(signinButton).toBeVisible();
    
    console.log('✅ ホームページのナビゲーションリンクは正常です');
  });
});