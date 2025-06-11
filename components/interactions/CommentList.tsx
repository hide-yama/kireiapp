'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CommentCard } from './CommentCard'

interface Comment {
  id: string
  body: string
  created_at: string
  user_id: string
  profiles?: {
    nickname: string
    avatar_url?: string
  }
}

interface CommentListProps {
  postId: string
  currentUserId?: string
  refreshTrigger?: number
}

export function CommentList({ postId, currentUserId, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true)
      try {
        console.log('Fetching comments for post:', postId)
        
        // First try simple query without profile join
        const { data: simpleData, error: simpleError } = await supabase
          .from('comments')
          .select('id, body, created_at, user_id')
          .eq('post_id', postId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })

        console.log('Simple comments query result:', { simpleData, simpleError })

        if (simpleError) {
          console.error('Error fetching comments:', {
            error: simpleError,
            message: simpleError?.message,
            details: simpleError?.details,
            hint: simpleError?.hint,
            code: simpleError?.code,
            stringified: JSON.stringify(simpleError)
          })
          return
        }

        // Get profiles separately for each comment
        const commentsWithProfiles = await Promise.all(
          simpleData.map(async (comment) => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('nickname, avatar_url')
                .eq('id', comment.user_id)
                .single()
              
              return {
                ...comment,
                profiles: profileData || { nickname: 'Unknown User', avatar_url: null }
              }
            } catch (profileError) {
              console.log('Could not fetch profile for comment', comment.id)
              return {
                ...comment,
                profiles: { nickname: 'Unknown User', avatar_url: null }
              }
            }
          })
        )

        setComments(commentsWithProfiles)
      } catch (error: any) {
        console.error('Catch block error in comments:', {
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

    fetchComments()
  }, [postId, refreshTrigger, supabase])

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId))
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-sm text-white text-center py-4">
        まだコメントがありません
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onDeleted={() => handleCommentDeleted(comment.id)}
        />
      ))}
    </div>
  )
}