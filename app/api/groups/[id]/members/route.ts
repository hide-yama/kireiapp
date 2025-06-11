import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
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

    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: 'ユーザーIDは必須です' }, { status: 400 })
    }

    // Cannot remove the owner
    if (user_id === group.owner_id) {
      return NextResponse.json({ error: 'オーナーは削除できません' }, { status: 400 })
    }

    // Remove the member
    const { error: deleteError } = await supabase
      .from('family_members')
      .delete()
      .eq('group_id', id)
      .eq('user_id', user_id)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json({ error: 'メンバーの削除に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // Check if user is a member of the group
    const { data: membership } = await supabase
      .from('family_members')
      .select('*')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'このグループのメンバーではありません' }, { status: 403 })
    }

    // Get all members of the group
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select(`
        user_id,
        role,
        joined_at,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('group_id', id)
      .order('joined_at', { ascending: true })

    if (membersError) {
      console.error('Error loading members:', membersError)
      return NextResponse.json({ error: 'メンバーの取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ members })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}