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
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get user's groups
    const { data: userGroups } = await supabase
      .from('family_members')
      .select('group_id')
      .eq('user_id', user.id)

    if (!userGroups || userGroups.length === 0) {
      return NextResponse.json({ posts: [], totalCount: 0 })
    }

    const groupIds = userGroups.map(ug => ug.group_id)

    // Build base query
    let searchQuery = supabase
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
      .in('group_id', groupIds)

    // Apply text search if provided
    if (query.trim()) {
      searchQuery = searchQuery.ilike('body', `%${query}%`)
    }

    // Apply category filter
    if (category && category !== '') {
      searchQuery = searchQuery.eq('category', category)
    }

    // Apply date range filters
    if (dateFrom) {
      searchQuery = searchQuery.gte('created_at', `${dateFrom}T00:00:00.000Z`)
    }
    if (dateTo) {
      searchQuery = searchQuery.lte('created_at', `${dateTo}T23:59:59.999Z`)
    }

    // Apply author filter (search by nickname)
    if (author && author.trim()) {
      // First get user IDs that match the nickname
      const { data: matchingProfiles } = await supabase
        .from('profiles')
        .select('id')
        .ilike('nickname', `%${author}%`)

      if (matchingProfiles && matchingProfiles.length > 0) {
        const userIds = matchingProfiles.map(p => p.id)
        searchQuery = searchQuery.in('user_id', userIds)
      } else {
        // No matching users found
        return NextResponse.json({ posts: [], totalCount: 0 })
      }
    }

    // Execute query with pagination
    const { data: posts, count } = await searchQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Transform posts
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
      limit,
      query: {
        q: query,
        category,
        author,
        dateFrom,
        dateTo
      }
    })

  } catch (error) {
    console.error('Error searching posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}