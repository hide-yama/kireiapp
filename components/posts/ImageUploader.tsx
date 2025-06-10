"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { compressImage } from "@/lib/image-utils"

interface ImageUploaderProps {
  images: File[]
  onImagesChange: (images: File[]) => void
  maxImages?: number
  label?: string
}

export function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 4,
  label = "画像"
}: ImageUploaderProps) {
  const [isCompressing, setIsCompressing] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (images.length + files.length > maxImages) {
      alert(`画像は最大${maxImages}枚まで添付できます`)
      return
    }
    
    setIsCompressing(true)
    
    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const compressedFile = await compressImage(file, 1200, 1200, 0.8)
          console.log(`Original: ${file.size} bytes, Compressed: ${compressedFile.size} bytes`)
          return compressedFile
        })
      )
      onImagesChange([...images, ...compressedFiles])
    } catch (error) {
      console.error('Image compression failed:', error)
      alert('画像の圧縮に失敗しました')
    } finally {
      setIsCompressing(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  return (
    <div>
      <Label htmlFor="images">{label}（最大{maxImages}枚）</Label>
      <Input
        id="images"
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="mb-3"
        disabled={isCompressing}
      />
      {isCompressing && (
        <p className="text-sm text-blue-600 mb-3">画像を圧縮しています...</p>
      )}
      
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {images.length > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          {images.length}/{maxImages}枚選択済み
        </p>
      )}
    </div>
  )
}