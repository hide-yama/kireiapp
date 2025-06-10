import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const markReadSchema = z.object({
  notificationId: z.string().uuid().optional(),
  markAll: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // リクエストボディの検証
    const body = await request.json()
    const validation = markReadSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { notificationId, markAll } = validation.data

    if (markAll) {
      // すべて既読にする
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Mark all read error:', error)
        return NextResponse.json(
          { error: 'すべての通知を既読にできませんでした' },
          { status: 500 }
        )
      }
    } else if (notificationId) {
      // 特定の通知を既読にする
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Mark read error:', error)
        return NextResponse.json(
          { error: '通知を既読にできませんでした' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'notificationId または markAll が必要です' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}