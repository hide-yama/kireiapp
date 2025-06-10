'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  onUploadComplete: (url: string) => void
}

export function AvatarUpload({ userId, currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // currentAvatarUrlが変更された時にプレビューを更新
  useEffect(() => {
    setPreview(currentAvatarUrl || null)
  }, [currentAvatarUrl])

  const uploadAvatar = async (file: File) => {
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
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // 古い画像を削除
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop()
        if (oldPath && oldPath !== fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldPath}`])
        }
      }

      // 新しい画像をアップロード
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      // 公開URLを取得
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = data.publicUrl

      // プロフィールテーブルを更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      onUploadComplete(publicUrl)
      setPreview(publicUrl)
      alert('アバター画像を更新しました')
      
      // アバター更新後にページをリロードして最新状態を反映
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      
      // エラーメッセージを詳細に表示
      let errorMessage = 'アバターのアップロードに失敗しました'
      
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

    uploadAvatar(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Label>アバター画像</Label>
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-sm">画像なし</span>
          )}
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={uploading}
          >
            {uploading ? 'アップロード中...' : '画像を変更'}
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