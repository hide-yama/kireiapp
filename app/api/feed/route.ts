import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const groupIds = searchParams.get('groups')?.split(',').filter(Boolean)
    const categories = searchParams.get('categories')?.split(',').filter(Boolean)
    const offset = (page - 1) * limit

    // Get user's groups if no specific groups are requested
    let targetGroupIds = groupIds
    if (!targetGroupIds || targetGroupIds.length === 0) {
      const { data: userGroups } = await supabase
        .from('family_members')
        .select('group_id')
        .eq('user_id', user.id)

      if (!userGroups || userGroups.length === 0) {
        return NextResponse.json({ posts: [], totalCount: 0, hasMore: false })
      }

      targetGroupIds = userGroups.map(ug => ug.group_id)
    }

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        id,
        body,
        category,
        place,
        time_spent,
        created_at,
        group_id,
        user_id,
        profiles:user_id (
          nickname,
          avatar_url
        ),
        family_groups:group_id (
          name,
          avatar_url
        ),
        post_images (
          id,
          storage_path,
          position
        ),
        likes (
          user_id
        )
      `, { count: 'exact' })
      .in('group_id', targetGroupIds)

    // Apply category filter
    if (categories && categories.length > 0) {
      query = query.in('category', categories)
    }

    // Apply pagination and ordering
    const { data: posts, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Transform posts to include computed fields
    const transformedPosts = posts?.map(post => ({
      ...post,
      user: post.profiles,
      group: post.family_groups,
      images: post.post_images || [],
      likes: post.likes || [],
      likedByUser: post.likes?.some((like: any) => like.user_id === user.id) || false,
      likesCount: post.likes?.length || 0
    })) || []

    const totalCount = count || 0
    const hasMore = offset + limit < totalCount

    return NextResponse.json({
      posts: transformedPosts,
      totalCount,
      hasMore,
      page,
      limit
    })

  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}