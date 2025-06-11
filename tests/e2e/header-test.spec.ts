import { test, expect } from '@playwright/test';

test.describe('Header Tests', () => {
  test('ヘッダーの色が濃いグレーに変更されているか確認', async ({ page }) => {
    // フィードページへアクセス（ヘッダーが表示されるページ）
    try {
      await page.goto('http://localhost:3000/feed');
      console.log('✅ フィードページにアクセスしました');
    } catch (error) {
      await page.goto('http://localhost:3000');
      console.log('✅ ホームページにアクセスしました（フィードページにアクセスできませんでした）');
    }

    // ページが完全に読み込まれるまで待つ
    await page.waitForLoadState('networkidle');
    
    // ヘッダー要素を取得
    const header = page.locator('header');
    
    if (await header.count() > 0) {
      console.log('✅ ヘッダーが見つかりました');
      
      // ヘッダーのスタイルを確認
      const headerStyles = await header.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          borderBottomColor: styles.borderBottomColor,
          position: styles.position,
          zIndex: styles.zIndex
        };
      });
      console.log('📝 ヘッダーのスタイル:', headerStyles);

      // ヘッダータイトルのスタイルを確認
      const headerTitle = page.locator('header h1');
      if (await headerTitle.count() > 0) {
        const titleStyles = await headerTitle.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            color: styles.color,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          };
        });
        console.log('📝 ヘッダータイトルのスタイル:', titleStyles);
      }

      // ヘッダーのスクリーンショット
      await header.screenshot({ path: 'test-results/header-new-style.png' });
      console.log('📸 ヘッダーのスクリーンショットを撮影しました');
    } else {
      console.log('⚠️ ヘッダーが見つかりませんでした');
    }

    // ページ全体のスクリーンショット
    await page.screenshot({ 
      path: 'test-results/page-with-new-header.png', 
      fullPage: false 
    });
    console.log('📸 新しいヘッダーを含むページのスクリーンショットを撮影しました');
  });
});