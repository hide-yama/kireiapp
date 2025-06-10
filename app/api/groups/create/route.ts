import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { name, avatar_url } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'グループ名は必須です' }, { status: 400 })
    }

    // Generate unique invitation code (simple version)
    const invitationCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('family_groups')
      .insert({
        name: name.trim(),
        avatar_url: avatar_url || null,
        invitation_code: invitationCode,
        owner_id: user.id
      })
      .select()
      .single()

    if (groupError) {
      console.error('Group creation error:', groupError)
      return NextResponse.json({ error: 'グループの作成に失敗しました' }, { status: 500 })
    }

    // Add the creator as a member with owner role
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'owner'
      })

    if (memberError) {
      console.error('Member creation error:', memberError)
      // Clean up the created group
      await supabase.from('family_groups').delete().eq('id', group.id)
      return NextResponse.json({ error: 'メンバー追加に失敗しました' }, { status: 500 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}