'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface UseRealtimeSubscriptionProps<T = Record<string, unknown>> {
  table: string
  filter?: string
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void
}

export function useRealtimeSubscription<T = Record<string, unknown>>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete
}: UseRealtimeSubscriptionProps<T>) {
  const supabase = createClient()

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel> | null = null

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
            (payload: RealtimePostgresChangesPayload<T>) => {
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