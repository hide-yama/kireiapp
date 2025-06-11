'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, MessageCircle, FileText } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

interface NotificationCardProps {
  notification: {
    id: string
    type: 'like' | 'comment' | 'post'
    read: boolean
    created_at: string
    post_id?: string
    from_user_id?: string
    from_user?: {
      nickname: string
      avatar_url?: string
    }
    post?: {
      body: string
    }
  }
  onMarkAsRead?: () => void
}

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const [isRead, setIsRead] = useState(notification.read)
  const { decrementUnreadCount } = useNotification()
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

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'post':
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getNotificationText = () => {
    const fromUser = notification.from_user?.nickname || 'ユーザー'
    const postPreview = notification.post?.body?.substring(0, 30) + '...' || '投稿'

    switch (notification.type) {
      case 'like':
        return `${fromUser}さんがあなたの投稿にいいねしました`
      case 'comment':
        return `${fromUser}さんがあなたの投稿にコメントしました`
      case 'post':
        return `${fromUser}さんが新しい投稿をしました`
      default:
        return '通知があります'
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!isRead) {
      setIsRead(true)
      decrementUnreadCount()  // 即座に通知数を減らす
      onMarkAsRead?.()
    }
  }

  return (
    <Card 
      className={`transition-colors hover:bg-gray-700 cursor-pointer ${
        !isRead ? 'border-l-4 border-l-blue-500 bg-gray-700 shadow-sm' : ''
      }`}
    >
      <CardContent className="p-4">
        <Link 
          href={notification.post_id ? `/posts/${notification.post_id}` : '/notifications'}
          onClick={handleClick}
          className="block"
        >
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <ProfileAvatar
                avatarUrl={notification.from_user?.avatar_url}
                nickname={notification.from_user?.nickname || 'User'}
                size="sm"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {getNotificationIcon()}
                <p className="text-sm font-medium text-white">
                  {getNotificationText()}
                </p>
                {!isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
              {notification.post?.body && (
                <p className="text-sm text-gray-400 mt-1 truncate">
                  「{notification.post.body.substring(0, 50)}...」
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(notification.created_at)}
              </p>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}