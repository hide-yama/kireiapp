'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLike(postId: string, userId?: string) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // 初期状態を取得
  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        // いいね数を取得
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact' })
          .eq('post_id', postId)

        setLikeCount(count || 0)

        // ユーザーのいいね状態を取得
        if (userId) {
          const { data } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single()

          setIsLiked(!!data)
        }
      } catch (error) {
        console.error('Error fetching like data:', error)
      }
    }

    fetchLikeData()
  }, [postId, userId, supabase])

  const toggleLike = async () => {
    if (!userId || isLoading) return

    setIsLoading(true)

    try {
      if (isLiked) {
        // いいねを削除
        const response = await fetch(`/api/posts/${postId}/like`, {
          method: 'DELETE',
        })

        if (!response.ok) throw new Error('Failed to unlike')

        const result = await response.json()
        setIsLiked(false)
        setLikeCount(result.likeCount)
      } else {
        // いいねを追加
        const response = await fetch(`/api/posts/${postId}/like`, {
          method: 'POST',
        })

        if (!response.ok) throw new Error('Failed to like')

        const result = await response.json()
        setIsLiked(true)
        setLikeCount(result.likeCount)
      }
    } catch (error) {
      console.error('Like toggle error:', error)
      alert('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLiked,
    likeCount,
    isLoading,
    toggleLike
  }
}