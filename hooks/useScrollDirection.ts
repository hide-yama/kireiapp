'use client'

import { useState, useEffect } from 'react'

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // スクロール量が少ない場合は無視（スクロールの感度調整）
      if (Math.abs(currentScrollY - lastScrollY) < 10) {
        return
      }

      // スクロール方向を判定
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // 下にスクロール & 80px以上スクロールした場合
        setScrollDirection('down')
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // 上にスクロール
        setScrollDirection('up')
        setIsVisible(true)
      }

      // ページトップ近く（80px以内）では常に表示
      if (currentScrollY < 80) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    // スクロールイベントにスロットリングを適用
    let timeoutId: NodeJS.Timeout
    const throttledHandleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(handleScroll, 10)
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [lastScrollY])

  return { scrollDirection, isVisible }
}