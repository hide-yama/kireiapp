import { test, expect } from '@playwright/test';

test.describe('Button Hover Tests', () => {
  test('ログインボタンのホバー状態での視認性確認', async ({ page }) => {
    // ホームページへアクセス
    await page.goto('http://localhost:3000');
    console.log('✅ ホームページにアクセスしました');

    // ログインボタンを取得
    const loginButton = page.locator('text=ログイン');
    await expect(loginButton).toBeVisible();
    console.log('✅ ログインボタンが見つかりました');

    // ホバー前の状態をスクリーンショット
    await page.screenshot({ path: 'test-results/login-button-normal.png', fullPage: true });
    console.log('📸 ホバー前のスクリーンショットを撮影しました');

    // ボタンの初期スタイルを確認
    const initialStyles = await loginButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderColor: styles.borderColor
      };
    });
    console.log('📝 ログインボタンの初期スタイル:', initialStyles);

    // ボタンにホバー
    await loginButton.hover();
    console.log('🖱️ ログインボタンにホバーしました');

    // ホバー時のスタイルを確認
    const hoverStyles = await loginButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderColor: styles.borderColor
      };
    });
    console.log('📝 ログインボタンのホバー時スタイル:', hoverStyles);

    // ホバー後の状態をスクリーンショット
    await page.screenshot({ path: 'test-results/login-button-hover.png', fullPage: true });
    console.log('📸 ホバー時のスクリーンショットを撮影しました');

    // コントラストチェック（基本的な確認）
    if (hoverStyles.backgroundColor === 'rgba(0, 0, 0, 0)' || 
        hoverStyles.backgroundColor === 'transparent') {
      console.log('⚠️ ホバー時の背景色が透明です');
    } else {
      console.log('✅ ホバー時の背景色が設定されています');
    }

    // 新規登録ボタンも確認
    const signupButton = page.locator('text=新規登録');
    await expect(signupButton).toBeVisible();
    
    const signupInitialStyles = await signupButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    console.log('📝 新規登録ボタンの初期スタイル:', signupInitialStyles);

    await signupButton.hover();
    const signupHoverStyles = await signupButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    console.log('📝 新規登録ボタンのホバー時スタイル:', signupHoverStyles);
  });
});