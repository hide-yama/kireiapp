import { test, expect } from '@playwright/test'

test.describe('Dark UI Visibility Check', () => {
  test('Check for low contrast icons and emojis throughout the app', async ({ page }) => {
    // テスト用のログイン
    await page.goto('http://localhost:3000/signin')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword')
    await page.click('button[type="submit"]')
    
    const visibilityIssues: string[] = []

    // ダッシュボード/フィード画面をチェック
    await page.goto('http://localhost:3000/feed')
    await page.waitForLoadState('networkidle')
    
    // 絵文字とアイコンの視認性をチェック
    const darkElements = await page.evaluate(() => {
      const issues: string[] = []
      
      // 全ての要素を取得
      const allElements = document.querySelectorAll('*')
      
      allElements.forEach((element, index) => {
        const computedStyle = window.getComputedStyle(element)
        const backgroundColor = computedStyle.backgroundColor
        const color = computedStyle.color
        const text = element.textContent?.trim()
        
        // 背景が暗い（グレー系、黒系）かチェック
        const isDarkBackground = backgroundColor.includes('rgb(') && (
          backgroundColor.includes('rgb(0,') || 
          backgroundColor.includes('rgb(17,') ||
          backgroundColor.includes('rgb(31,') ||
          backgroundColor.includes('rgb(55,') ||
          backgroundColor.includes('rgb(75,') ||
          backgroundColor.includes('rgb(107,') ||
          backgroundColor.includes('rgb(156,') ||
          backgroundColor === 'rgba(0, 0, 0, 0)'
        )
        
        // テキストが暗い色かチェック  
        const isDarkText = color.includes('rgb(') && (
          color.includes('rgb(0,') ||
          color.includes('rgb(17,') ||
          color.includes('rgb(31,') ||
          color.includes('rgb(55,') ||
          color.includes('rgb(75,') ||
          color.includes('rgb(107,')
        )
        
        // 絵文字やアイコンを含むかチェック
        const hasEmoji = text && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(text)
        const hasIcon = element.tagName === 'SVG' || element.closest('svg') || element.classList.contains('lucide')
        
        if (isDarkBackground && (isDarkText || hasEmoji || hasIcon)) {
          const elementInfo = {
            tag: element.tagName,
            className: element.className,
            text: text?.substring(0, 50),
            backgroundColor,
            color,
            hasEmoji,
            hasIcon
          }
          issues.push(`Element ${index}: ${JSON.stringify(elementInfo)}`)
        }
      })
      
      return issues
    })
    
    visibilityIssues.push(...darkElements)

    // グループ一覧ページをチェック
    await page.goto('http://localhost:3000/groups')
    await page.waitForLoadState('networkidle')
    
    const groupPageIssues = await page.evaluate(() => {
      const issues: string[] = []
      
      // 特定の問題のあるセレクターをチェック
      const problematicSelectors = [
        'button[variant="outline"]',
        '.text-gray-500',
        '.text-gray-600', 
        '.text-gray-700',
        '.text-gray-800',
        '.text-gray-900',
        '.bg-gray-100',
        '.bg-gray-200',
        'svg',
        '[class*="lucide"]'
      ]
      
      problematicSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((element, index) => {
          const computedStyle = window.getComputedStyle(element)
          const rect = element.getBoundingClientRect()
          
          if (rect.width > 0 && rect.height > 0) { // 表示されている要素のみ
            issues.push(`${selector}[${index}]: color=${computedStyle.color}, bg=${computedStyle.backgroundColor}`)
          }
        })
      })
      
      return issues
    })
    
    visibilityIssues.push(...groupPageIssues)

    // プロフィールページをチェック
    await page.goto('http://localhost:3000/profile')
    await page.waitForLoadState('networkidle')
    
    // 投稿詳細ページをチェック（投稿があれば）
    await page.goto('http://localhost:3000/posts')
    await page.waitForLoadState('networkidle')
    
    const postLinks = await page.locator('a[href*="/posts/"]').first()
    if (await postLinks.count() > 0) {
      await postLinks.click()
      await page.waitForLoadState('networkidle')
      
      const postDetailIssues = await page.evaluate(() => {
        const issues: string[] = []
        
        // 投稿詳細ページ特有の要素をチェック
        const detailSelectors = [
          '.text-gray-500',
          '.text-blue-800', 
          '.text-gray-600',
          'button[variant="outline"]',
          'code'
        ]
        
        detailSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector)
          elements.forEach((element, index) => {
            const computedStyle = window.getComputedStyle(element)
            const text = element.textContent?.trim()
            issues.push(`Post detail ${selector}[${index}]: "${text}" - color=${computedStyle.color}, bg=${computedStyle.backgroundColor}`)
          })
        })
        
        return issues
      })
      
      visibilityIssues.push(...postDetailIssues)
    }

    // 結果をログ出力
    console.log('=== VISIBILITY ISSUES FOUND ===')
    visibilityIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`)
    })
    
    // 問題が見つかった場合はテストを失敗させる
    if (visibilityIssues.length > 0) {
      throw new Error(`Found ${visibilityIssues.length} potential visibility issues. Check console for details.`)
    }
  })
  
  test('Check specific dark-on-dark patterns', async ({ page }) => {
    await page.goto('http://localhost:3000/signin')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword')
    await page.click('button[type="submit"]')
    
    // グループ詳細ページでの招待コードチェック
    await page.goto('http://localhost:3000/groups')
    await page.waitForLoadState('networkidle')
    
    const groupLink = page.locator('a[href*="/groups/"]').first()
    if (await groupLink.count() > 0) {
      await groupLink.click()
      await page.waitForLoadState('networkidle')
      
      // 招待コードの視認性をチェック
      const codeElement = page.locator('code')
      if (await codeElement.count() > 0) {
        const styles = await codeElement.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            text: el.textContent
          }
        })
        
        console.log('Invitation code styles:', styles)
        
        // 色のコントラストが十分かチェック
        expect(styles.color).not.toBe('rgb(17, 24, 39)') // dark gray text
        expect(styles.backgroundColor).not.toBe('rgb(243, 244, 246)') // light gray background
      }
    }
    
    // 絵文字の場所をチェック
    const emojiElements = await page.evaluate(() => {
      const emojis: any[] = []
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      )
      
      let node
      while (node = walker.nextNode()) {
        const text = node.textContent || ''
        const emojiMatch = text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|📍/gu)
        
        if (emojiMatch) {
          const parent = node.parentElement
          if (parent) {
            const computed = window.getComputedStyle(parent)
            emojis.push({
              emoji: emojiMatch.join(', '),
              text: text.trim(),
              parentTag: parent.tagName,
              parentClass: parent.className,
              color: computed.color,
              backgroundColor: computed.backgroundColor
            })
          }
        }
      }
      
      return emojis
    })
    
    console.log('=== EMOJI VISIBILITY CHECK ===')
    emojiElements.forEach((item, index) => {
      console.log(`${index + 1}. ${item.emoji} in "${item.text}" - ${item.parentTag}.${item.parentClass} - color: ${item.color}, bg: ${item.backgroundColor}`)
    })
  })
})