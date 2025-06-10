import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const commentId = params.id

    // コメントの存在確認と権限チェック
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, user_id')
      .eq('id', commentId)
      .eq('is_deleted', false)
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { error: 'コメントが見つかりません' },
        { status: 404 }
      )
    }

    // 権限チェック（コメント投稿者のみ削除可能）
    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    // コメントを論理削除
    const { error: deleteError } = await supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', commentId)

    if (deleteError) {
      console.error('Delete comment error:', deleteError)
      return NextResponse.json(
        { error: 'コメントの削除に失敗しました' },
        { status: 500 }
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