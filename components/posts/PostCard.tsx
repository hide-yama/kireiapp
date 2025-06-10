import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LikeButton } from "@/components/interactions/LikeButton"
import { MessageCircle } from "lucide-react"

interface PostCardProps {
  post: {
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
    likes?: { count: number }[]
    comments?: { count: number }[]
  }
  currentUserId?: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const firstImage = post.post_images
    .sort((a, b) => a.position - b.position)[0]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {post.profiles?.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {post.profiles?.nickname?.[0] || "?"}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium">{post.profiles?.nickname}</p>
              <p className="text-sm text-gray-500">
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {post.category}
            </span>
            {post.place && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {post.place}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 whitespace-pre-wrap line-clamp-3">{post.body}</p>
        
        {firstImage && (
          <div className="mb-4">
            <div className="aspect-square max-w-[300px] mx-auto">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${firstImage.storage_path}`}
                alt="投稿画像"
                className="w-full h-full object-cover rounded border"
              />
            </div>
            {post.post_images.length > 1 && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                +{post.post_images.length - 1}枚の画像
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <LikeButton
              postId={post.id}
              initialLikeCount={post.likes?.[0]?.count || 0}
              userId={currentUserId}
            />
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/posts/${post.id}`} className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments?.[0]?.count || 0}</span>
              </Link>
            </Button>
          </div>
          <Link href={`/posts/${post.id}`}>
            <Button variant="outline" size="sm">
              詳細を見る
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}