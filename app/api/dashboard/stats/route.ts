import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Dashboard stats API called')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    console.log('User authenticated:', !!user)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's groups (both owned and member of)
    const { data: ownedGroups, error: ownedError } = await supabase
      .from('family_groups')
      .select('id')
      .eq('owner_id', user.id)

    const { data: memberData, error: memberError } = await supabase
      .from('family_members')
      .select('group_id')
      .eq('user_id', user.id)

    console.log('Groups data:', { ownedGroups, memberData, ownedError, memberError })

    const allGroupIds = [
      ...(ownedGroups?.map(g => g.id) || []),
      ...(memberData?.map(m => m.group_id) || [])
    ]

    console.log('All group IDs:', allGroupIds)

    if (allGroupIds.length === 0) {
      console.log('No groups found, returning zero stats')
      return NextResponse.json({
        totalPosts: 0,
        thisWeekPosts: 0,
        categoryStats: {},
        userStats: {}
      })
    }

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get total posts
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .in('group_id', allGroupIds)

    console.log('Total posts count:', totalPosts)

    // Get this week's posts
    const { count: thisWeekPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .in('group_id', allGroupIds)
      .gte('created_at', weekAgo.toISOString())

    console.log('This week posts count:', thisWeekPosts)

    // Get posts data
    const { data: postsData } = await supabase
      .from('posts')
      .select('category, user_id, created_at, profiles:user_id(nickname)')
      .in('group_id', allGroupIds)


    // Calculate category stats
    const categoryStats = postsData?.reduce((acc, post) => {
      const category = post.category
      if (!acc[category]) {
        acc[category] = { count: 0 }
      }
      acc[category].count += 1
      return acc
    }, {} as Record<string, { count: number }>) || {}

    // Calculate user stats (top contributors)
    const userStats = postsData?.reduce((acc, post) => {
      const userId = post.user_id
      const nickname = post.profiles?.nickname || 'Unknown'
      if (!acc[userId]) {
        acc[userId] = { nickname, count: 0 }
      }
      acc[userId].count += 1
      return acc
    }, {} as Record<string, { nickname: string; count: number }>) || {}

    const result = {
      totalPosts: totalPosts || 0,
      thisWeekPosts: thisWeekPosts || 0,
      categoryStats,
      userStats
    }

    console.log('Returning stats result:', result)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}