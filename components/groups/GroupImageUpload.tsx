'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface GroupImageUploadProps {
  onUploadComplete: (url: string) => void
  currentImageUrl?: string | null
}

export function GroupImageUpload({ onUploadComplete, currentImageUrl }: GroupImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)

      // ファイルサイズチェック (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('ファイルサイズは5MB以内にしてください')
      }

      // ファイル形式チェック
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('対応しているファイル形式: JPEG, PNG, WebP')
      }

      // ファイル名を生成
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `group-images/${fileName}`

      // 新しい画像をアップロード
      const { error: uploadError } = await supabase.storage
        .from('group-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      // 公開URLを取得
      const { data } = supabase.storage
        .from('group-images')
        .getPublicUrl(filePath)

      const publicUrl = data.publicUrl

      onUploadComplete(publicUrl)
      setPreview(publicUrl)

    } catch (error: any) {
      console.error('Error uploading group image:', error)
      
      let errorMessage = 'グループアイコンのアップロードに失敗しました'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.error?.message) {
        errorMessage = error.error.message
      }
      
      alert('エラーが発生しました: ' + errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // プレビュー表示
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    uploadImage(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Label>グループアイコン（任意）</Label>
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="Group icon preview"
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <span className="text-gray-500 text-sm">アイコンなし</span>
          )}
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={uploading}
          >
            {uploading ? 'アップロード中...' : 'アイコンを選択'}
          </Button>
          <p className="text-sm text-gray-500 mt-1">
            JPEG, PNG, WebP / 最大5MB
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}