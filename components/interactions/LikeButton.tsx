'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  postId: string
  initialLikeCount?: number
  initialIsLiked?: boolean
  userId?: string
}

export function LikeButton({ postId, initialLikeCount = 0, initialIsLiked = false, userId }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // 初期状態を確認
    const checkLikeStatus = async () => {
      const { data } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      setIsLiked(!!data)
    }

    // いいね数を取得
    const getLikeCount = async () => {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('post_id', postId)

      setLikeCount(count || 0)
    }

    checkLikeStatus()
    getLikeCount()
  }, [postId, userId, supabase])

  const handleLike = async () => {
    if (!userId || isLoading) return

    setIsLoading(true)

    try {
      if (isLiked) {
        // いいねを削除
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)

        if (error) throw error

        setIsLiked(false)
        setLikeCount(prev => prev - 1)
      } else {
        // いいねを追加
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: userId
          })

        if (error) throw error

        setIsLiked(true)
        setLikeCount(prev => prev + 1)

        // 通知を作成（投稿者が自分でない場合）
        const { data: post } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', postId)
          .single()

        if (post && post.user_id !== userId) {
          await supabase
            .from('notifications')
            .insert({
              user_id: post.user_id,
              type: 'like',
              post_id: postId,
              from_user_id: userId
            })
        }
      }
    } catch (error) {
      console.error('Like error:', error)
      alert('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading || !userId}
      className={`flex items-center space-x-2 ${isLiked ? 'text-red-600' : 'text-gray-600'}`}
    >
      <Heart 
        className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`}
      />
      <span>{likeCount}</span>
    </Button>
  )
}