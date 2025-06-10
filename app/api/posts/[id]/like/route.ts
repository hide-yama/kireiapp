import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // 既にいいねしているかチェック
    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      return NextResponse.json(
        { error: '既にいいねしています' },
        { status: 400 }
      )
    }

    // いいねを追加
    const { error: likeError } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: user.id
      })

    if (likeError) {
      console.error('Like error:', likeError)
      return NextResponse.json(
        { error: 'いいねの追加に失敗しました' },
        { status: 500 }
      )
    }

    // 通知を作成（投稿者が自分でない場合）
    if (post.user_id !== user.id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: post.user_id,
          type: 'like',
          post_id: postId,
          from_user_id: user.id
        })
    }

    // いいね数を取得
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)

    return NextResponse.json({
      success: true,
      likeCount: count || 0
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // いいねを削除
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Unlike error:', error)
      return NextResponse.json(
        { error: 'いいねの削除に失敗しました' },
        { status: 500 }
      )
    }

    // いいね数を取得
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact' })
      .eq('post_id', postId)

    return NextResponse.json({
      success: true,
      likeCount: count || 0
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}