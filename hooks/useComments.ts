'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  body: string
  created_at: string
  user_id: string
  profiles: {
    nickname: string
    avatar_url?: string
  }
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const supabase = createClient()

  // コメント一覧を取得
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            body,
            created_at,
            user_id,
            profiles:user_id (
              nickname,
              avatar_url
            )
          `)
          .eq('post_id', postId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })

        if (error) throw error

        setComments(data || [])
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [postId, refreshTrigger, supabase])

  const addComment = async (body: string, userId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      })

      if (!response.ok) throw new Error('Failed to add comment')

      // コメント一覧を再取得
      refresh()
      return true
    } catch (error) {
      console.error('Add comment error:', error)
      return false
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      // コメント一覧から削除
      setComments(prev => prev.filter(comment => comment.id !== commentId))
      return true
    } catch (error) {
      console.error('Delete comment error:', error)
      return false
    }
  }

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    refresh,
    commentCount: comments.length
  }
}