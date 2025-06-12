"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileInput } from "@/components/ui/file-input"
import { createClient } from "@/lib/supabase/client"

const categories = ["料理", "掃除", "洗濯", "買い物", "その他"] as const

interface PostImage {
  id: string
  storage_path: string
  position: number
}

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const [body, setBody] = useState("")
  const [category, setCategory] = useState<string>("")
  const [place, setPlace] = useState("")
  const [existingImages, setExistingImages] = useState<PostImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPost()
  }, [params.id])

  const fetchPost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/signin")
        return
      }

      const { data: post, error } = await supabase
        .from("posts")
        .select(`
          *,
          post_images (id, storage_path, position)
        `)
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

      if (error || !post) {
        alert("投稿が見つからないか、編集権限がありません")
        router.push("/posts")
        return
      }

      setBody(post.body)
      setCategory(post.category)
      setPlace(post.place || "")
      setExistingImages(post.post_images.sort((a, b) => a.position - b.position))
    } catch (error) {
      console.error("Error fetching post:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length + newImages.length + files.length
    
    if (totalImages > 4) {
      alert("画像は最大4枚まで添付できます")
      return
    }
    
    setNewImages(prev => [...prev, ...files])
  }

  const removeExistingImage = (imageId: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!body.trim() || !category) {
      alert("テキストとカテゴリは必須です")
      return
    }

    setIsSubmitting(true)

    try {
      const updateData = {
        body,
        category,
        place: place || null,
      }

      const { error: updateError } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", params.id)

      if (updateError) {
        throw new Error("投稿の更新に失敗しました")
      }

      // Handle image updates
      if (newImages.length > 0) {
        const imagePromises = newImages.map(async (file, index) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${params.id}/${Date.now()}_${index}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("post-images")
            .upload(fileName, file)

          if (uploadError) {
            console.error("Image upload error:", uploadError)
            return null
          }

          const { error: imageRecordError } = await supabase
            .from("post_images")
            .insert({
              post_id: params.id as string,
              storage_path: uploadData.path,
              position: existingImages.length + index,
            })

          if (imageRecordError) {
            console.error("Image record error:", imageRecordError)
          }

          return uploadData
        })

        await Promise.all(imagePromises)
      }

      router.push(`/posts/${params.id}`)
    } catch (error) {
      console.error("Error updating post:", error)
      alert("投稿の更新に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？この操作は元に戻せません。")) {
      return
    }

    setIsDeleting(true)

    try {
      // Delete post (images will be deleted automatically via cascade)
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", params.id)

      if (error) {
        throw new Error("投稿の削除に失敗しました")
      }

      // Delete images from storage
      for (const image of existingImages) {
        await supabase.storage
          .from("post-images")
          .remove([image.storage_path])
      }

      router.push("/posts")
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("投稿の削除に失敗しました")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>投稿を編集</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="body">投稿内容 *</Label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full min-h-[120px] p-3 border rounded-md resize-vertical text-black"
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
                className="w-full p-3 border rounded-md text-black"
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


            <div>
              <Label>既存の画像</Label>
              {existingImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {existingImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${image.storage_path}`}
                        alt="既存画像"
                        className="w-full h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-3">既存の画像はありません</p>
              )}

              <Label htmlFor="newImages">新しい画像を追加</Label>
              <FileInput
                id="newImages"
                accept="image/*"
                multiple
                onChange={handleNewImageUpload}
                className="mb-2"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {newImages.length > 0 
                  ? `選択されたファイル: ${newImages.map(img => img.name).join(', ')}`
                  : 'ファイルが選択されていません'
                }
              </p>
              
              {newImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {newImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`新しい画像 ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="whitespace-normal min-w-0 sm:whitespace-nowrap"
              >
                {isDeleting ? "削除中..." : "投稿を削除"}
              </Button>
              
              <div className="flex gap-3 justify-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "更新中..." : "更新する"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}