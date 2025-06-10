"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { LikeButton } from "@/components/interactions/LikeButton"
import { CommentForm } from "@/components/interactions/CommentForm"
import { CommentList } from "@/components/interactions/CommentList"

interface Post {
  id: string
  body: string
  category: string
  place?: string
  created_at: string
  user_id: string
  profiles: {
    nickname: string
    avatar_url?: string
  }
  post_images: {
    id: string
    storage_path: string
    position: number
  }[]
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [refreshComments, setRefreshComments] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchPost()
    getCurrentUser()
  }, [params.id])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchPost = async () => {
    try {
      console.log("Fetching post with ID:", params.id)
      
      // First try simple query without joins
      const { data: simpleData, error: simpleError } = await supabase
        .from("posts")
        .select("id, body, category, place, created_at, user_id, group_id")
        .eq("id", params.id)
        .single()

      console.log("Simple post query result:", { simpleData, simpleError })

      if (simpleError) {
        console.error("Error fetching post:", {
          error: simpleError,
          message: simpleError?.message,
          details: simpleError?.details,
          hint: simpleError?.hint,
          code: simpleError?.code,
          stringified: JSON.stringify(simpleError)
        })
        return
      }

      // Get profile and images separately to avoid JOIN issues
      let finalPostData = { ...simpleData }

      // Try to get profile info
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("nickname, avatar_url")
          .eq("id", simpleData.user_id)
          .single()
        
        if (profileData) {
          finalPostData.profiles = profileData
        }
      } catch (profileError) {
        console.log("Could not fetch profile, continuing without it")
      }

      // Try to get images
      try {
        const { data: imagesData, error: imagesError } = await supabase
          .from("post_images")
          .select("id, storage_path, position")
          .eq("post_id", params.id)
          .order("position")
        
        console.log(`Images for post detail ${params.id}:`, { imagesData, imagesError })
        
        if (imagesData && imagesData.length > 0) {
          finalPostData.post_images = imagesData
          console.log(`Found ${imagesData.length} images for post detail ${params.id}`)
        } else {
          console.log(`No images found for post detail ${params.id}`)
        }
      } catch (imagesError) {
        console.error("Error fetching images for post detail", params.id, imagesError)
      }

      setPost(finalPostData)
    } catch (error: any) {
      console.error("Catch block error:", {
        error,
        message: error?.message,
        stack: error?.stack,
        stringified: JSON.stringify(error),
        type: typeof error
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const nextImage = () => {
    if (post && post.post_images && post.post_images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === post.post_images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (post && post.post_images && post.post_images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? post.post_images.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto py-6">
        <p>投稿が見つかりません</p>
        <Link href="/posts">
          <Button variant="outline">一覧に戻る</Button>
        </Link>
      </div>
    )
  }

  const sortedImages = post.post_images ? post.post_images.sort((a, b) => a.position - b.position) : []
  const isOwner = currentUser?.id === post.user_id

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Link href="/posts">
          <Button variant="outline">← 一覧に戻る</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                {post.profiles?.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium">
                    {post.profiles?.nickname?.[0] || "?"}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-lg">{post.profiles?.nickname}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(post.created_at)}
                </p>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Link href={`/posts/${post.id}/edit`}>
                  <Button variant="outline" size="sm">
                    編集
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {post.category}
            </span>
            {post.place && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                📍 {post.place}
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{post.body}</p>
          </div>

          {sortedImages.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${sortedImages[currentImageIndex].storage_path}`}
                  alt="投稿画像"
                  className="w-full max-h-96 object-contain rounded-lg border"
                />
                
                {sortedImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      →
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-1">
                        {sortedImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex
                                ? "bg-white"
                                : "bg-white bg-opacity-50"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {sortedImages.length > 1 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  {currentImageIndex + 1} / {sortedImages.length}
                </p>
              )}
            </div>
          )}

          {/* インタラクション部分 */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <LikeButton
                postId={post.id}
                userId={currentUser?.id}
              />
            </div>

            {/* コメント部分 */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">コメント</h3>
              
              <CommentForm
                postId={post.id}
                userId={currentUser?.id}
                onCommentAdded={() => setRefreshComments(prev => prev + 1)}
              />

              <CommentList
                postId={post.id}
                currentUserId={currentUser?.id}
                refreshTrigger={refreshComments}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}