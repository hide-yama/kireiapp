import { test, expect } from '@playwright/test';

test.describe('Login Check', () => {
  test('ログイン機能の動作確認', async ({ page }) => {
    // コンソールログとエラーを監視
    const logs: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const message = `${msg.type()}: ${msg.text()}`;
      logs.push(message);
      console.log(`Browser Console: ${message}`);
    });
    
    page.on('pageerror', error => {
      const errorMsg = `Page Error: ${error.message}`;
      errors.push(errorMsg);
      console.log(errorMsg);
    });

    // ネットワークリクエストを監視
    const requests: string[] = [];
    page.on('request', request => {
      requests.push(`${request.method()} ${request.url()}`);
    });

    page.on('response', response => {
      if (!response.ok()) {
        console.log(`Failed Request: ${response.status()} ${response.url()}`);
      }
    });

    try {
      // ログインページに移動
      console.log('Navigating to signin page...');
      await page.goto('/signin');
      
      // ページロード完了まで待機
      await page.waitForLoadState('networkidle');
      
      // スクリーンショット（ログインページ）
      await page.screenshot({ path: 'test-results/01-signin-page.png', fullPage: true });
      
      console.log(`Current URL: ${page.url()}`);
      
      // ログインフォームの要素が存在するか確認
      const emailInput = page.locator('input[name="email"]');
      const passwordInput = page.locator('input[name="password"]');
      const submitButton = page.locator('button[type="submit"]');
      
      console.log(`Email input exists: ${await emailInput.count() > 0}`);
      console.log(`Password input exists: ${await passwordInput.count() > 0}`);
      console.log(`Submit button exists: ${await submitButton.count() > 0}`);
      
      if (await emailInput.count() > 0) {
        // ログイン情報を入力
        console.log('Filling login form...');
        await emailInput.fill('y.hideki225@gmail.com');
        await passwordInput.fill('7Sebunnsuta');
        
        // 入力後のスクリーンショット
        await page.screenshot({ path: 'test-results/02-form-filled.png', fullPage: true });
        
        // ログインボタンをクリック
        console.log('Clicking login button...');
        await submitButton.click();
        
        // レスポンスを待機
        await page.waitForTimeout(3000);
        
        // ログイン後のスクリーンショット
        await page.screenshot({ path: 'test-results/03-after-login.png', fullPage: true });
        
        console.log(`URL after login attempt: ${page.url()}`);
        
        // エラーメッセージの確認
        const errorMessages = await page.locator('[role="alert"], .text-destructive, .error').allTextContents();
        if (errorMessages.length > 0) {
          console.log('Error messages found:', errorMessages);
        }
        
        // トーストメッセージの確認
        const toastMessages = await page.locator('[data-sonner-toast], .toast').allTextContents();
        if (toastMessages.length > 0) {
          console.log('Toast messages:', toastMessages);
        }
        
      } else {
        console.log('Login form not found - page might be broken');
      }
      
      // 収集した情報を出力
      console.log('\n=== Network Requests ===');
      requests.forEach(req => console.log(req));
      
      console.log('\n=== Browser Logs ===');
      logs.forEach(log => console.log(log));
      
      console.log('\n=== Errors ===');
      errors.forEach(error => console.log(error));
      
    } catch (error) {
      console.log(`Test error: ${error}`);
      await page.screenshot({ path: 'test-results/error-state.png', fullPage: true });
    }
  });
});