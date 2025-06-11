'use client'

import React, { memo, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LikeButton } from "@/components/interactions/LikeButton"
import { CommentForm } from "@/components/interactions/CommentForm"
import { CommentList } from "@/components/interactions/CommentList"
import { MessageCircle, MoreHorizontal, MapPin, X, Edit2, Trash2 } from "lucide-react"
import { ImageSlider } from "@/components/ui/image-slider"
import { PostWithDetails } from "@/types/domain"
import { formatDate, isValidImageUrl } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface PostCardProps {
  post: PostWithDetails
  currentUserId?: string
}

const PostCardComponent = ({ post, currentUserId }: PostCardProps) => {
  const router = useRouter()
  const supabase = createClient()
  const menuRef = useRef<HTMLDivElement>(null)
  
  // 画像データを準備
  const validImages = post.post_images?.filter(img => img.url && isValidImageUrl(img.url)).map(img => ({
    url: img.url,
    alt: `投稿画像`
  })) || []
  
  // 本文が長いかチェック
  const textLength = post.body.length
  const isLongText = textLength > 30
  
  // 展開状態の管理
  const [isExpanded, setIsExpanded] = useState(false)
  
  // コメントモーダルの表示状態
  const [showCommentModal, setShowCommentModal] = useState(false)
  
  // ドロップダウンメニューの表示状態
  const [showMenu, setShowMenu] = useState(false)
  
  // 削除中の状態
  const [isDeleting, setIsDeleting] = useState(false)
  
  // コメント更新トリガー
  const [commentRefreshTrigger, setCommentRefreshTrigger] = useState(0)
  
  // ローカルコメント数の管理
  const [localCommentCount, setLocalCommentCount] = useState(post.comment_count || 0)
  
  // メニューの外側をクリックしたときに閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])
  
  // 投稿の削除処理
  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？")) {
      return
    }
    
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
      
      if (error) {
        throw error
      }
      
      // ページをリロード
      window.location.reload()
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("投稿の削除に失敗しました")
    } finally {
      setIsDeleting(false)
      setShowMenu(false)
    }
  }

  return (
    <div className="border-b border-gray-800 pb-4 mb-4">
      <div className="mb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.user_id}`}>
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
          <div className="relative" ref={menuRef}>
            <button 
              className="p-2 text-gray-400 hover:text-white"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {/* ドロップダウンメニュー */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                {currentUserId === post.user_id && (
                  <>
                    <button
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2 rounded-t-lg"
                      onClick={() => {
                        router.push(`/posts/${post.id}/edit`)
                        setShowMenu(false)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                      編集
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2 rounded-b-lg"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? "削除中..." : "削除"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
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
        
        {validImages.length > 0 && (
          <ImageSlider 
            images={validImages}
          />
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