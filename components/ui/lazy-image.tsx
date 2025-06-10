"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallback?: string
  className?: string
  skeletonClassName?: string
}

export function LazyImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  className,
  skeletonClassName,
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoading(false)
    setIsError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setIsError(true)
  }

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {isLoading && !isError && (
        <Skeleton className={cn("absolute inset-0", skeletonClassName)} />
      )}
      {isInView && (
        <img
          src={isError ? fallback : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-200",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          {...props}
        />
      )}
    </div>
  )
}