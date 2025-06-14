'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NotificationCard } from '@/components/notifications/NotificationCard'
import { useNotification } from '@/contexts/NotificationContext'

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { refreshUnreadCount } = useNotification()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchNotifications(user.id)
      }
    }

    getUser()
  }, [supabase])

  const fetchNotifications = async (userId: string) => {
    setLoading(true)
    try {
      // まずシンプルなクエリで通知データを取得
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          read,
          created_at,
          post_id,
          from_user_id
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // 通知データがあれば、関連データを個別に取得
      if (data && data.length > 0) {
        const notificationsWithDetails = await Promise.all(
          data.map(async (notification) => {
            let from_user = null
            let post = null

            // from_user情報を取得
            if (notification.from_user_id) {
              const { data: userData } = await supabase
                .from('profiles')
                .select('nickname, avatar_url')
                .eq('id', notification.from_user_id)
                .maybeSingle()
              from_user = userData
            }

            // post情報を取得
            if (notification.post_id) {
              const { data: postData } = await supabase
                .from('posts')
                .select('body')
                .eq('id', notification.post_id)
                .single()
              post = postData
            }

            return {
              ...notification,
              from_user,
              post
            }
          })
        )
        setNotifications(notificationsWithDetails)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

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
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      // ローカル状態を更新
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
      
      // 通知数をリフレッシュ
      refreshUnreadCount()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>通知</CardTitle>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                すべて既読にする ({unreadCount})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">通知はありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}