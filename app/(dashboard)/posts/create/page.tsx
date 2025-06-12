"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { compressImage } from "@/lib/image-utils"
import { createClient } from "@/lib/supabase/client"

const categories = ["料理", "掃除", "洗濯", "買い物", "その他"] as const

export default function CreatePostPage() {
  const [body, setBody] = useState("")
  const [category, setCategory] = useState<string>("")
  const [place, setPlace] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [userGroups, setUserGroups] = useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUserGroups()
  }, [])

  const fetchUserGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's groups (both owned and member of)
      const { data: ownedGroups, error: ownedError } = await supabase
        .from("family_groups")
        .select("id, name")
        .eq("owner_id", user.id)

      const { data: memberData, error: memberError } = await supabase
        .from("family_members")
        .select("group_id")
        .eq("user_id", user.id)

      if (ownedError && memberError) {
        console.error("Error fetching groups:", { ownedError, memberError })
        return
      }

      // Get full group info for member groups
      let memberGroups: {id: string, name: string}[] = []
      if (memberData && memberData.length > 0) {
        const { data: groupNames } = await supabase
          .from("family_groups")
          .select("id, name")
          .in("id", memberData.map(m => m.group_id))
        
        memberGroups = groupNames || []
      }

      // Combine owned and member groups
      const allGroups = [
        ...(ownedGroups || []),
        ...memberGroups
      ]

      // Remove duplicates
      const uniqueGroups = allGroups.filter((group, index, self) => 
        index === self.findIndex(g => g.id === group.id)
      )

      setUserGroups(uniqueGroups)
      
      // Auto-select first group if available
      if (uniqueGroups.length > 0) {
        setSelectedGroup(uniqueGroups[0].id)
      }
    } catch (error) {
      console.error("Error fetching user groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 4) {
      alert("画像は最大4枚まで添付できます")
      return
    }

    // Compress images before setting state
    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const compressedFile = await compressImage(file, 1200, 1200, 0.8)
          console.log(`Original: ${file.size} bytes, Compressed: ${compressedFile.size} bytes`)
          return compressedFile
        })
      )
      setImages(prev => [...prev, ...compressedFiles])
    } catch (error) {
      console.error('Image compression failed:', error)
      alert('画像の圧縮に失敗しました')
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!body.trim() || !category) {
      alert("テキストとカテゴリは必須です")
      return
    }

    if (!selectedGroup) {
      alert("グループを選択してください")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("body", body)
      formData.append("category", category)
      formData.append("place", place)
      formData.append("group_id", selectedGroup)
      
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image)
      })

      const response = await fetch("/api/posts/create", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        router.push("/posts")
      } else {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(errorData.error || "投稿の作成に失敗しました")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      alert("投稿の作成に失敗しました")
    } finally {
      setIsSubmitting(false)
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
          <CardTitle>家事投稿を作成</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="group">投稿先グループ *</Label>
              <select
                id="group"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:border-primary focus:outline-none"
                required
              >
                <option value="">グループを選択</option>
                {userGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="body">投稿内容 *</Label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full min-h-[120px] p-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:border-primary focus:outline-none resize-vertical"
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
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:border-primary focus:outline-none"
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
              <Label htmlFor="images">画像（最大4枚）</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="mb-2"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {images.length > 0 
                  ? `選択されたファイル: ${images.map(img => img.name).join(', ')}`
                  : 'ファイルが選択されていません'
                }
              </p>
              
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
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "投稿中..." : "投稿する"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}