import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // Check if user is the owner of the group
    const { data: group, error: groupError } = await supabase
      .from('family_groups')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'グループが見つからないか、権限がありません' }, { status: 404 })
    }

    const { action } = await request.json()

    if (action === 'regenerate_code') {
      // Generate new invitation code
      const newInvitationCode = nanoid(8).toUpperCase()

      const { error: updateError } = await supabase
        .from('family_groups')
        .update({ invitation_code: newInvitationCode })
        .eq('id', id)

      if (updateError) {
        console.error('Error regenerating invitation code:', updateError)
        return NextResponse.json({ error: '招待コードの再生成に失敗しました' }, { status: 500 })
      }

      return NextResponse.json({ invitation_code: newInvitationCode })
    }

    return NextResponse.json({ error: '無効なアクションです' }, { status: 400 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}