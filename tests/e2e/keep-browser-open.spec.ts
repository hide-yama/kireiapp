import { test, expect } from '@playwright/test';

test('ブラウザを開いたままにする', async ({ page }) => {
  console.log('ブラウザを開いています...');
  
  // ホームページに移動
  await page.goto('/');
  await page.screenshot({ path: 'test-results/browser-kept-open-home.png', fullPage: true });
  
  console.log('✅ ホームページが表示されました: http://localhost:4000');
  
  // ログインページに移動
  await page.goto('/signin');
  await page.screenshot({ path: 'test-results/browser-kept-open-signin.png', fullPage: true });
  
  console.log('✅ ログインページが表示されました: http://localhost:4000/signin');
  
  // フィードページに移動（認証が必要な場合はリダイレクトされる）
  await page.goto('/feed');
  await page.screenshot({ path: 'test-results/browser-kept-open-feed.png', fullPage: true });
  
  console.log('✅ フィードページにアクセスしました: http://localhost:4000/feed');
  
  // ブラウザを開いたままにするため、長時間待機
  console.log('🌐 ブラウザを開いたままにします。手動で閉じるまで待機します...');
  console.log('📍 アクセスURL: http://localhost:4000');
  
  // 10分間待機（手動で閉じるまで）
  await page.waitForTimeout(600000); // 10分 = 600秒
  
  console.log('⏰ タイムアウトしました。ブラウザを閉じます。');
});