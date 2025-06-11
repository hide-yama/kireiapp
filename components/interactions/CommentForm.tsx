'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

interface CommentFormProps {
  postId: string
  userId?: string
  onCommentAdded?: () => void
}

export function CommentForm({ postId, userId, onCommentAdded }: CommentFormProps) {
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId || !comment.trim() || isLoading) return

    setIsLoading(true)

    try {
      // コメントを追加
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          body: comment.trim()
        })

      if (error) throw error

      // 投稿者に通知を送信（自分の投稿でない場合）
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
            type: 'comment',
            post_id: postId,
            from_user_id: userId
          })
      }

      setComment('')
      onCommentAdded?.()
    } catch (error) {
      console.error('Comment error:', error)
      alert('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (!userId) {
    return (
      <div className="text-sm text-gray-300 text-center py-4">
        ログインしてコメントを投稿
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        type="text"
        placeholder="コメントを入力..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isLoading}
        maxLength={500}
        className="flex-1"
      />
      <Button
        type="submit"
        size="sm"
        disabled={isLoading || !comment.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}