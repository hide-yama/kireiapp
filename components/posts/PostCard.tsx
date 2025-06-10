import React, { memo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LikeButton } from "@/components/interactions/LikeButton"
import { MessageCircle } from "lucide-react"
import { PostWithDetails } from "@/types/domain"
import { formatDate, getCategoryColor, isValidImageUrl } from "@/lib/utils"

interface PostCardProps {
  post: PostWithDetails
  currentUserId?: string
}

const PostCardComponent = ({ post, currentUserId }: PostCardProps) => {
  // 最初の画像を取得（既にソート済みの場合）
  const firstImage = post.post_images?.[0]
  
  // 画像URLの安全性チェック
  const safeImageUrl = firstImage?.url && isValidImageUrl(firstImage.url) ? firstImage.url : null

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
            <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(post.category)}`}>
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
        
        {safeImageUrl && (
          <div className="mb-4">
            <div className="aspect-square max-w-[300px] mx-auto">
              <img
                src={safeImageUrl}
                alt="投稿画像"
                className="w-full h-full object-cover rounded border"
                loading="lazy" // 遅延読み込み
                onError={(e) => {
                  // エラー時はデフォルト画像または非表示
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            {post.post_images && post.post_images.length > 1 && (
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
              initialLikeCount={post.like_count || 0}
              userId={currentUserId}
            />
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/posts/${post.id}`} className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>{post.comment_count || 0}</span>
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

// React.memoで最適化
export const PostCard = memo(PostCardComponent)