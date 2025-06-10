import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const commentSchema = z.object({
  body: z.string().min(1, 'コメントは必須です').max(500, 'コメントは500文字以内で入力してください'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const postId = params.id

    // 投稿の存在確認
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // リクエストボディの検証
    const body = await request.json()
    const validation = commentSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { body: commentBody } = validation.data

    // コメントを追加
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        body: commentBody
      })
      .select()
      .single()

    if (commentError) {
      console.error('Comment error:', commentError)
      return NextResponse.json(
        { error: 'コメントの投稿に失敗しました' },
        { status: 500 }
      )
    }

    // 通知を作成（投稿者が自分でない場合）
    if (post.user_id !== user.id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: post.user_id,
          type: 'comment',
          post_id: postId,
          from_user_id: user.id
        })
    }

    return NextResponse.json({
      success: true,
      comment
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const postId = params.id

    // コメント一覧を取得
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        body,
        created_at,
        user_id,
        profiles:user_id (
          nickname,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Comments fetch error:', error)
      return NextResponse.json(
        { error: 'コメントの取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      comments: comments || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}