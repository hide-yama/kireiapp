import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { invitation_code } = await request.json()

    if (!invitation_code || invitation_code.trim().length === 0) {
      return NextResponse.json({ error: '招待コードは必須です' }, { status: 400 })
    }

    // Find the group with the invitation code
    const { data: group, error: groupError } = await supabase
      .from('family_groups')
      .select('*')
      .eq('invitation_code', invitation_code.trim().toUpperCase())
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: '無効な招待コードです' }, { status: 404 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('*')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'すでにこのグループのメンバーです' }, { status: 400 })
    }

    // Check member count limit (20 members max)
    const { count: memberCount } = await supabase
      .from('family_members')
      .select('*', { count: 'exact' })
      .eq('group_id', group.id)

    if (memberCount && memberCount >= 20) {
      return NextResponse.json({ error: 'このグループは満員です（最大20人）' }, { status: 400 })
    }

    // Add user as a member
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'member'
      })

    if (memberError) {
      console.error('Member join error:', memberError)
      return NextResponse.json({ error: 'グループへの参加に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ group })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}