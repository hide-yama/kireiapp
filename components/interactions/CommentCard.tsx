'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface CommentCardProps {
  comment: {
    id: string
    body: string
    created_at: string
    user_id: string
    profiles?: {
      nickname: string
      avatar_url?: string
    }
  }
  currentUserId?: string
  onDeleted?: () => void
}

export function CommentCard({ comment, currentUserId, onDeleted }: CommentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!currentUserId || currentUserId !== comment.user_id || isDeleting) return

    if (!confirm('このコメントを削除しますか？')) return

    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true })
        .eq('id', comment.id)

      if (error) throw error

      onDeleted?.()
    } catch (error) {
      console.error('Delete comment error:', error)
      alert('エラーが発生しました')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric'
    })
  }

  return (
    <div className="flex space-x-3">
      <ProfileAvatar
        avatarUrl={comment.profiles?.avatar_url}
        nickname={comment.profiles?.nickname || 'Unknown User'}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            {comment.profiles?.nickname || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(comment.created_at)}
          </span>
          {currentUserId === comment.user_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-600 p-1 h-auto"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-700 mt-1 break-words">
          {comment.body}
        </p>
      </div>
    </div>
  )
}