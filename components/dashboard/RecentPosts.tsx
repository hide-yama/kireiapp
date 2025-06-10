import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CategoryBadge } from '@/components/posts/CategoryBadge'
import { formatDistanceToNow } from 'date-fns'
// import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { MoreHorizontal } from 'lucide-react'

interface Post {
  id: string
  body: string
  category: string
  created_at: string
  profiles: {
    nickname: string
    avatar_url: string | null
  }
}

interface RecentPostsProps {
  posts: Post[]
  limit?: number
}

export function RecentPosts({ posts, limit = 5 }: RecentPostsProps) {
  const displayPosts = posts.slice(0, limit)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>最近の投稿</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/posts">
            <MoreHorizontal className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <div key={post.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.profiles.avatar_url || undefined} />
                <AvatarFallback>
                  {post.profiles.nickname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {post.profiles.nickname}
                  </p>
                  <CategoryBadge category={post.category} />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.body}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    // locale: ja
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            まだ投稿がありません
          </p>
        )}
        {posts.length > limit && (
          <div className="pt-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/posts">
                すべての投稿を見る ({posts.length}件)
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}