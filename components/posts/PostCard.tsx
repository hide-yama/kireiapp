import React, { memo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LikeButton } from "@/components/interactions/LikeButton"
import { MessageCircle, MoreHorizontal, MapPin } from "lucide-react"
import { PostWithDetails } from "@/types/domain"
import { formatDate, getCategoryColor, isValidImageUrl } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Link href={`/profile`} className="group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-200">
                  {post.profile?.avatar_url ? (
                    <img
                      src={post.profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-semibold text-primary">
                      {post.profile?.nickname?.[0] || "?"}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
              </div>
            </Link>
            <div>
              <p className="font-semibold text-foreground hover:text-primary transition-colors">
                {post.profile?.nickname}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full -mr-2">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="text-xs">
            {post.category}
          </Badge>
          {post.place && (
            <Badge variant="outline" className="text-xs gap-1">
              <MapPin className="h-3 w-3" />
              {post.place}
            </Badge>
          )}
        </div>
        
        <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
          {post.body}
        </p>
        
        {safeImageUrl && (
          <div className="relative group cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              <img
                src={safeImageUrl}
                alt="投稿画像"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {post.post_images && post.post_images.length > 1 && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-lg backdrop-blur-sm">
                +{post.post_images.length - 1}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <LikeButton
              postId={post.id}
              initialLikeCount={post.like_count || 0}
              userId={currentUserId}
            />
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link href={`/posts/${post.id}`} className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{post.comment_count || 0}</span>
              </Link>
            </Button>
          </div>
          <Link href={`/posts/${post.id}`}>
            <Button variant="ghost" size="sm" className="text-xs hover:text-primary">
              続きを読む
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// React.memoで最適化
export const PostCard = memo(PostCardComponent)