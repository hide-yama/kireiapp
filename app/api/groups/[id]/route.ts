import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id: groupId } = await params

    // Check if user is the owner of the group
    const { data: group, error: groupError } = await supabase
      .from('family_groups')
      .select('owner_id')
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'グループが見つかりません' }, { status: 404 })
    }

    if (group.owner_id !== user.id) {
      return NextResponse.json({ error: 'グループオーナーのみが削除できます' }, { status: 403 })
    }

    // Delete all related data first (due to foreign key constraints)
    
    // Delete family members
    const { error: membersError } = await supabase
      .from('family_members')
      .delete()
      .eq('group_id', groupId)

    if (membersError) {
      console.error('Error deleting members:', membersError)
      return NextResponse.json({ error: 'メンバーの削除に失敗しました' }, { status: 500 })
    }

    // Delete posts and related data if they exist
    // Note: This would require cascading deletes for post_images, likes, comments, notifications
    // For now, we'll assume no posts exist or handle them separately

    // Finally delete the group
    const { error: deleteError } = await supabase
      .from('family_groups')
      .delete()
      .eq('id', groupId)

    if (deleteError) {
      console.error('Error deleting group:', deleteError)
      return NextResponse.json({ error: 'グループの削除に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ message: 'グループを削除しました' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}