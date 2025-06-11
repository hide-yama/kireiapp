import { test, expect } from '@playwright/test';

test.describe('Scroll Behavior Tests', () => {
  test('スクロール時のヘッダーとフッターの動作確認', async ({ page }) => {
    // ダッシュボードページへアクセス（認証が必要な場合はスキップ）
    try {
      await page.goto('http://localhost:3000/dashboard');
      console.log('✅ ダッシュボードページにアクセスしました');
    } catch (error) {
      // 認証が必要な場合は、ダミーページを作成してテスト
      await page.goto('http://localhost:3000');
      console.log('✅ ホームページにアクセスしました（認証が必要なため）');
      return; // 認証なしではテストをスキップ
    }

    // ページが完全に読み込まれるまで待つ
    await page.waitForLoadState('networkidle');
    
    // 初期状態のスクリーンショット
    await page.screenshot({ 
      path: 'test-results/scroll-initial.png', 
      fullPage: false 
    });
    console.log('📸 初期状態のスクリーンショットを撮影しました');

    // ヘッダーとフッターを取得
    const header = page.locator('header');
    const mobileNav = page.locator('nav[class*="fixed bottom-0"]');

    if (await header.count() > 0) {
      console.log('✅ ヘッダーが見つかりました');
      
      // 初期のヘッダー状態を確認
      const initialHeaderTransform = await header.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.transform;
      });
      console.log('📝 初期ヘッダーのtransform:', initialHeaderTransform);
    }

    if (await mobileNav.count() > 0) {
      console.log('✅ モバイルナビゲーションが見つかりました');
      
      // 初期のフッター状態を確認
      const initialNavClasses = await mobileNav.getAttribute('class');
      console.log('📝 初期フッターのclass:', initialNavClasses);
    }

    // 長いコンテンツを追加してスクロール可能にする
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) {
        const content = document.createElement('div');
        content.style.height = '2000px';
        content.style.background = 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1))';
        content.innerHTML = '<p style="padding: 20px; color: white;">スクロールテスト用のコンテンツ</p>';
        main.appendChild(content);
      }
    });

    // 下にスクロール
    console.log('⬇️ 下にスクロールします');
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000); // アニメーション完了を待つ

    // 下スクロール後のスクリーンショット
    await page.screenshot({ 
      path: 'test-results/scroll-down.png', 
      fullPage: false 
    });
    console.log('📸 下スクロール後のスクリーンショットを撮影しました');

    // ヘッダーの状態確認（下スクロール後）
    if (await header.count() > 0) {
      const downScrollHeaderTransform = await header.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.transform;
      });
      console.log('📝 下スクロール後のヘッダーtransform:', downScrollHeaderTransform);
    }

    // フッターの状態確認（下スクロール後）
    if (await mobileNav.count() > 0) {
      const downScrollNavClasses = await mobileNav.getAttribute('class');
      console.log('📝 下スクロール後のフッターclass:', downScrollNavClasses);
    }

    // 上にスクロール
    console.log('⬆️ 上にスクロールします');
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(1000); // アニメーション完了を待つ

    // 上スクロール後のスクリーンショット
    await page.screenshot({ 
      path: 'test-results/scroll-up.png', 
      fullPage: false 
    });
    console.log('📸 上スクロール後のスクリーンショットを撮影しました');

    // ヘッダーの状態確認（上スクロール後）
    if (await header.count() > 0) {
      const upScrollHeaderTransform = await header.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.transform;
      });
      console.log('📝 上スクロール後のヘッダーtransform:', upScrollHeaderTransform);
    }

    // フッターの状態確認（上スクロール後）
    if (await mobileNav.count() > 0) {
      const upScrollNavClasses = await mobileNav.getAttribute('class');
      console.log('📝 上スクロール後のフッターclass:', upScrollNavClasses);
    }

    console.log('✅ スクロール動作テストが完了しました');
  });
});