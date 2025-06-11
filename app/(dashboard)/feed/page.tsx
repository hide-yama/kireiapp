'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { postService } from '@/lib/services/posts'
import { PostCard } from '@/components/posts/PostCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Loading } from '@/components/ui/loading'
import { Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { PostWithDetails } from '@/types/domain'

export default function FeedPage() {
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setCurrentUserId(user.id)

        // PostServiceを使用して投稿を取得
        const { data, error } = await postService.getPosts({ limit: 20 })
        if (error) {
          console.error('Error fetching posts:', error)
          return
        }

        setPosts(data || [])
      } catch (error) {
        console.error('Error in fetchData:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase.auth])

  if (loading) {
    return <Loading message="読み込み中..." />
  }

  if (!currentUserId) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">フィード</h1>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <div key={post.id} className="animate-fade-in">
                <PostCard
                  post={post}
                  currentUserId={currentUserId}
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
                <Button asChild size="lg">
                  <Link href="/posts/create">
                    <Plus className="h-4 w-4 mr-2" />
                    投稿を作成
                  </Link>
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}