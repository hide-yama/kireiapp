import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { RefreshCw, Filter } from 'lucide-react'
import Link from 'next/link'

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
    .limit(50)

  // Get group names for filter
  const { data: groups } = await supabase
    .from('family_groups')
    .select('id, name')
    .in('id', groupIds)

  return { posts: posts || [], groups: groups || [] }
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { posts, groups } = await getFeedData(supabase, user.id)

  const categories = ['料理', '掃除', '洗濯', '買い物', 'その他']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">フィード</h2>
          <p className="text-muted-foreground">
            参加グループの最新投稿をチェック
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            フィルター
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">フィルター</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Group Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">グループ</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                すべて
              </Button>
              {groups.map((group) => (
                <Button key={group.id} variant="ghost" size="sm">
                  {group.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">カテゴリ</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                すべて
              </Button>
              {categories.map((category) => (
                <Button key={category} variant="ghost" size="sm">
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                user: post.profiles,
                group: post.family_groups,
                images: post.post_images || [],
                likes: post.likes || [],
                likedByUser: post.likes?.some((like: any) => like.user_id === user.id) || false
              }}
              currentUserId={user.id}
            />
          ))
        ) : (
          <EmptyState
            title="投稿がありません"
            description="まだ投稿がないか、グループに参加していません"
            action={
              <div className="space-x-2">
                <Button asChild>
                  <Link href="/posts/create">投稿を作成</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/groups">グループに参加</Link>
                </Button>
              </div>
            }
          />
        )}
      </div>

      {/* Load More */}
      {posts.length >= 50 && (
        <div className="text-center">
          <Button variant="outline">
            さらに読み込む
          </Button>
        </div>
      )}
    </div>
  )
}