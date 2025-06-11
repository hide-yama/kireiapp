'use client'

import React, { memo, useState } from "react"
import Link from "next/link"
import { CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LikeButton } from "@/components/interactions/LikeButton"
import { CommentForm } from "@/components/interactions/CommentForm"
import { CommentList } from "@/components/interactions/CommentList"
import { MessageCircle, MoreHorizontal, MapPin, X } from "lucide-react"
import { PostWithDetails } from "@/types/domain"
import { formatDate, isValidImageUrl } from "@/lib/utils"

interface PostCardProps {
  post: PostWithDetails
  currentUserId?: string
}

const PostCardComponent = ({ post, currentUserId }: PostCardProps) => {
  // 最初の画像を取得（既にソート済みの場合）
  const firstImage = post.post_images?.[0]
  
  // 画像URLの安全性チェック
  const safeImageUrl = firstImage?.url && isValidImageUrl(firstImage.url) ? firstImage.url : null
  
  // 本文が長いかチェック
  const textLength = post.body.length
  const isLongText = textLength > 30
  
  // 展開状態の管理
  const [isExpanded, setIsExpanded] = useState(false)
  
  // コメントモーダルの表示状態
  const [showCommentModal, setShowCommentModal] = useState(false)
  
  // コメント更新トリガー
  const [commentRefreshTrigger, setCommentRefreshTrigger] = useState(0)
  
  // ローカルコメント数の管理
  const [localCommentCount, setLocalCommentCount] = useState(post.comment_count || 0)

  return (
    <div className="border-b border-gray-800 pb-4 mb-4">
      <div className="mb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Link href={`/profile`}>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                {post.profile?.avatar_url ? (
                  <img
                    src={post.profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-300">
                    {post.profile?.nickname?.[0] || "?"}
                  </span>
                )}
              </div>
            </Link>
            <div>
              <p className="font-medium text-white">
                {post.profile?.nickname}
              </p>
              <p className="text-sm text-gray-400">
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-white">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {post.place && (
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {post.place}
          </p>
        )}
        
        <div>
          <p className="text-white leading-relaxed whitespace-pre-wrap">
            {isLongText && !isExpanded ? post.body.substring(0, 30) + '...' : post.body}
          </p>
          {isLongText && !isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-gray-400 hover:text-white text-sm mt-1 inline-block"
            >
              続きを読む
            </button>
          )}
        </div>
        
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

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-1">
            <LikeButton
              postId={post.id}
              initialLikeCount={post.like_count || 0}
              userId={currentUserId}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full"
              onClick={() => setShowCommentModal(true)}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{localCommentCount}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
      
      {/* コメントモーダル */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* オーバーレイ */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowCommentModal(false)}
          />
          
          {/* モーダルコンテンツ */}
          <div className="relative w-full bg-gray-900 rounded-t-xl border-t border-gray-700 max-h-[80vh] flex flex-col animate-slide-up">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">コメント</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* コメント一覧エリア */}
            <div className="flex-1 overflow-y-auto p-4">
              <CommentList 
                postId={post.id} 
                currentUserId={currentUserId}
                refreshTrigger={commentRefreshTrigger}
              />
            </div>
            
            {/* コメント入力フォーム - 固定 */}
            <div className="border-t border-gray-700 p-4 bg-gray-900">
              <CommentForm 
                postId={post.id} 
                userId={currentUserId}
                onCommentAdded={() => {
                  setCommentRefreshTrigger(prev => prev + 1)
                  setLocalCommentCount(prev => prev + 1)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// React.memoで最適化
export const PostCard = memo(PostCardComponent)