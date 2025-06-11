'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageSliderProps {
  images: Array<{
    url: string
    alt?: string
  }>
  className?: string
}

export function ImageSlider({ images, className = '' }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // スワイプ検知の最小距離
  const minSwipeDistance = 50

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentIndex < images.length - 1) {
      nextImage()
    }
    if (isRightSwipe && currentIndex > 0) {
      prevImage()
    }
  }

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className={`relative group cursor-pointer ${className}`}>
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          <img
            src={images[0].url}
            alt={images[0].alt || '投稿画像'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    )
  }

  return (
    <div className={`relative group cursor-pointer ${className}`}>
      <div 
        ref={sliderRef}
        className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* 画像 */}
        <div 
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              <img
                src={image.url}
                alt={image.alt || `投稿画像 ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          ))}
        </div>

        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* 左矢印ボタン */}
        {currentIndex > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 bg-white/80 hover:bg-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
          >
            <ChevronLeft className="h-4 w-4 text-gray-800" />
          </Button>
        )}

        {/* 右矢印ボタン */}
        {currentIndex < images.length - 1 && (
          <Button
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 bg-white/80 hover:bg-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
          >
            <ChevronRight className="h-4 w-4 text-gray-800" />
          </Button>
        )}

        {/* インジケーター */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                goToImage(index)
              }}
            />
          ))}
        </div>

        {/* 画像カウンター */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-lg backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}