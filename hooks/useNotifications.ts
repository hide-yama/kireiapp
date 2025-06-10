'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
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

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            id,
            type,
            read,
            created_at,
            post_id,
            from_user_id,
            from_user:from_user_id (
              nickname,
              avatar_url
            ),
            post:post_id (
              body
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        setNotifications(data || [])
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // リアルタイム更新の設定
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // 新しい通知を追加
            setNotifications(prev => [payload.new as Notification, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            // 通知を更新
            setNotifications(prev =>
              prev.map(notification =>
                notification.id === payload.new.id
                  ? { ...notification, ...payload.new }
                  : notification
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, supabase])

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      })

      if (!response.ok) throw new Error('Failed to mark as read')

      // ローカル状態を更新
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAll: true }),
      })

      if (!response.ok) throw new Error('Failed to mark all as read')

      // ローカル状態を更新
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead
  }
}