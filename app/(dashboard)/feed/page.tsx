import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { FeedFilter } from '@/components/feed/FeedFilter'

async function getFeedData(supabase: any, userId: string) {
  // Get user's groups
  const { data: userGroups } = await supabase
    .from('family_members')
    .select('group_id')
    .eq('user_id', userId)

  if (!userGroups || userGroups.length === 0) {
    return { posts: [], groups: [] }
  }

  const groupIds = userGroups.map(ug => ug.group_id)

  // Get all posts from user's groups with complete data
  const { data: posts } = await supabase
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
    `)
    .in('group_id', groupIds)
    .order('created_at', { ascending: false })
    .limit(20)

  // Transform posts data for PostCard component
  const transformedPosts = posts?.map((post: any) => ({
    id: post.id,
    body: post.body,
    category: post.category,
    place: post.place,
    created_at: post.created_at,
    user_id: post.user_id,
    group_id: post.group_id,
    profile: post.profiles,
    group: post.family_groups,
    post_images: post.post_images?.map((img: any) => ({
      id: img.id,
      url: img.storage_path,
      position: img.position
    })) || [],
    like_count: post.likes?.length || 0,
    comment_count: 0, // Will be fetched separately if needed
  }))

  // Get group names for filter
  const { data: groups } = await supabase
    .from('family_groups')
    .select('id, name')
    .in('id', groupIds)

  return { posts: transformedPosts || [], groups: groups || [] }
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { posts, groups } = await getFeedData(supabase, user.id)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Floating Action Button */}
      <Link href="/posts/create">
        <Button 
          size="icon"
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 w-14 h-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-200"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">フィード</h1>
        </div>
        <FeedFilter groups={groups} />
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <div key={post.id} className="animate-fade-in">
                <PostCard
                  post={post}
                  currentUserId={user.id}
                />
              </div>
            ))}
            
            {/* Load More */}
            {posts.length >= 20 && (
              <div className="text-center py-8">
                <Button variant="outline" size="lg" className="rounded-full">
                  もっと見る
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-20">
            <EmptyState
              title="まだ投稿がありません"
              description="最初の投稿を作成して、家事の記録を始めましょう"
              action={
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg">
                    <Link href="/posts/create">
                      <Plus className="h-4 w-4 mr-2" />
                      投稿を作成
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="lg">
                    <Link href="/groups">
                      グループに参加
                    </Link>
                  </Button>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}