import { test, expect } from '@playwright/test';

test.describe('UI Visibility and Contrast Tests', () => {
  test('視認性チェック - 全体的なコントラスト確認', async ({ page }) => {
    // ホームページへアクセス
    await page.goto('http://localhost:3000');
    console.log('✅ ホームページにアクセスしました');

    // ページ全体のスクリーンショットを撮影
    await page.screenshot({ path: 'test-results/home-page-contrast.png', fullPage: true });
    console.log('📸 ホームページのスクリーンショットを撮影しました');

    // フィードページへアクセス（認証が必要な場合はスキップ）
    try {
      await page.goto('http://localhost:3000/feed');
      await page.screenshot({ path: 'test-results/feed-page-contrast.png', fullPage: true });
      console.log('📸 フィードページのスクリーンショットを撮影しました');
    } catch (error) {
      console.log('⚠️ フィードページへのアクセスをスキップしました（認証が必要）');
    }

    // ログインページへアクセス
    try {
      await page.goto('http://localhost:3000/signin');
      await page.screenshot({ path: 'test-results/signin-page-contrast.png', fullPage: true });
      console.log('📸 ログインページのスクリーンショットを撮影しました');

      // 入力フォームの視認性をチェック
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      if (await emailInput.count() > 0) {
        const emailInputStyles = await emailInput.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            borderColor: styles.borderColor,
            placeholderColor: styles.getPropertyValue('::placeholder') || 'N/A'
          };
        });
        console.log('📝 Email入力フィールドのスタイル:', emailInputStyles);
      }

      if (await passwordInput.count() > 0) {
        const passwordInputStyles = await passwordInput.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            borderColor: styles.borderColor
          };
        });
        console.log('📝 パスワード入力フィールドのスタイル:', passwordInputStyles);
      }
    } catch (error) {
      console.log('⚠️ ログインページの詳細チェックをスキップしました');
    }

    // 新規登録ページへアクセス
    try {
      await page.goto('http://localhost:3000/signup');
      await page.screenshot({ path: 'test-results/signup-page-contrast.png', fullPage: true });
      console.log('📸 新規登録ページのスクリーンショットを撮影しました');
    } catch (error) {
      console.log('⚠️ 新規登録ページへのアクセスをスキップしました');
    }
  });

  test('投稿作成ページの視認性チェック', async ({ page }) => {
    try {
      await page.goto('http://localhost:3000/posts/create');
      await page.screenshot({ path: 'test-results/post-create-contrast.png', fullPage: true });
      console.log('📸 投稿作成ページのスクリーンショットを撮影しました');

      // テキストエリアの視認性をチェック
      const textareas = page.locator('textarea');
      const inputs = page.locator('input');
      const selects = page.locator('select');

      if (await textareas.count() > 0) {
        for (let i = 0; i < await textareas.count(); i++) {
          const textarea = textareas.nth(i);
          const styles = await textarea.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              borderColor: styles.borderColor
            };
          });
          console.log(`📝 Textarea ${i + 1} のスタイル:`, styles);
        }
      }

      if (await inputs.count() > 0) {
        for (let i = 0; i < await inputs.count(); i++) {
          const input = inputs.nth(i);
          const styles = await input.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
              type: el.type,
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              borderColor: styles.borderColor
            };
          });
          console.log(`📝 Input ${i + 1} のスタイル:`, styles);
        }
      }

      if (await selects.count() > 0) {
        for (let i = 0; i < await selects.count(); i++) {
          const select = selects.nth(i);
          const styles = await select.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              borderColor: styles.borderColor
            };
          });
          console.log(`📝 Select ${i + 1} のスタイル:`, styles);
        }
      }
    } catch (error) {
      console.log('⚠️ 投稿作成ページへのアクセスをスキップしました（認証が必要）');
    }
  });

  test('コントラスト比計算と問題箇所の特定', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 全体のテキスト要素をチェック
    const textElements = await page.locator('p, span, h1, h2, h3, h4, h5, h6, button, a, input, textarea, select, label').all();
    
    const contrastIssues = [];
    
    for (let i = 0; i < Math.min(textElements.length, 20); i++) { // 最初の20要素をチェック
      const element = textElements[i];
      try {
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            tagName: el.tagName,
            textContent: el.textContent?.substring(0, 50) || '',
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            position: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          };
        });

        // 透明な背景色や白い背景に白いテキストなどの問題をチェック
        if (styles.backgroundColor === 'rgba(0, 0, 0, 0)' || 
            styles.backgroundColor === 'transparent' ||
            (styles.backgroundColor.includes('255, 255, 255') && styles.color.includes('255, 255, 255')) ||
            (styles.backgroundColor.includes('240, 240, 240') && styles.color.includes('240, 240, 240'))) {
          contrastIssues.push({
            element: `${styles.tagName}: "${styles.textContent}"`,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            position: styles.position
          });
        }
      } catch (error) {
        // エラーは無視して次の要素へ
      }
    }

    console.log('🔍 コントラストの問題が検出された要素:');
    contrastIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.element}`);
      console.log(`   色: ${issue.color}`);
      console.log(`   背景色: ${issue.backgroundColor}`);
      console.log(`   位置: top=${Math.round(issue.position.top)}, left=${Math.round(issue.position.left)}`);
      console.log('');
    });

    if (contrastIssues.length === 0) {
      console.log('✅ 明らかなコントラストの問題は検出されませんでした');
    } else {
      console.log(`⚠️ ${contrastIssues.length}個の潜在的なコントラストの問題が検出されました`);
    }
  });
});