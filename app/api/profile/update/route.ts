import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
  nickname: z.string().min(1, 'ニックネームは必須です').max(50, 'ニックネームは50文字以内で入力してください'),
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
    const validation = updateProfileSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { nickname } = validation.data

    // プロフィールの更新または作成
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        nickname,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: 'プロフィールの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}