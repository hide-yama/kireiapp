'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseRealtimeSubscriptionProps {
  table: string
  filter?: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
}

export function useRealtimeSubscription({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete
}: UseRealtimeSubscriptionProps) {
  const supabase = createClient()

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        // 認証状態をチェック
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // リアルタイム購読を設定
        let channel = supabase
          .channel(`realtime-${table}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              ...(filter && { filter })
            },
            (payload) => {
              switch (payload.eventType) {
                case 'INSERT':
                  onInsert?.(payload)
                  break
                case 'UPDATE':
                  onUpdate?.(payload)
                  break
                case 'DELETE':
                  onDelete?.(payload)
                  break
              }
            }
          )

        subscription = channel.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to ${table} realtime updates`)
          }
        })

      } catch (error) {
        console.error('Realtime subscription error:', error)
      }
    }

    setupSubscription()

    // クリーンアップ
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [table, filter, onInsert, onUpdate, onDelete, supabase])
}