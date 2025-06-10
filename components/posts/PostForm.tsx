"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUploader } from "./ImageUploader"
import { compressImage } from "@/lib/image-utils"

const categories = ["料理", "掃除", "洗濯", "買い物", "その他"] as const

interface PostFormProps {
  initialData?: {
    body: string
    category: string
    place: string
  }
  onSubmit: (data: {
    body: string
    category: string
    place: string
    images: File[]
  }) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

export function PostForm({
  initialData = {
    body: "",
    category: "",
    place: ""
  },
  onSubmit,
  onCancel,
  submitLabel = "投稿する",
  isSubmitting = false
}: PostFormProps) {
  const [body, setBody] = useState(initialData.body)
  const [category, setCategory] = useState(initialData.category)
  const [place, setPlace] = useState(initialData.place)
  const [images, setImages] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!body.trim() || !category) {
      alert("テキストとカテゴリは必須です")
      return
    }

    await onSubmit({
      body,
      category,
      place,
      images
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="body">投稿内容 *</Label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full min-h-[120px] p-3 border rounded-md resize-vertical"
          placeholder="今日の家事について書いてください..."
          required
        />
      </div>

      <div>
        <Label htmlFor="category">カテゴリ *</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 border rounded-md"
          required
        >
          <option value="">カテゴリを選択</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="place">場所</Label>
        <Input
          id="place"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="キッチン、リビングなど"
        />
      </div>


      <ImageUploader
        images={images}
        onImagesChange={setImages}
        maxImages={4}
        label="画像"
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}