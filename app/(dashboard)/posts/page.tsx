"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PostCard } from "@/components/posts/PostCard"
import { Loading } from "@/components/ui/loading"
import { EmptyState } from "@/components/ui/empty-state"
import { createClient } from "@/lib/supabase/client"
import { postService } from "@/lib/services/posts"
import { PostWithDetails, PostCategory } from "@/types/domain"
import { formatDate } from "@/lib/utils"

const categories: readonly PostCategory[] = ["料理", "掃除", "洗濯", "買い物", "その他"] as const

interface GroupOption {
  id: string
  name: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "">("")
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [userGroups, setUserGroups] = useState<GroupOption[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  // ユーザー情報とグループ情報の取得
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setCurrentUserId(user.id)

        // ユーザーのグループを取得
        const { data: groups, error } = await postService.getUserGroupsWithNames(user.id)
        if (error) {
          console.error("Error fetching user groups:", error)
          return
        }

        setUserGroups(groups || [])
      } catch (error) {
        console.error("Error initializing user data:", error)
      }
    }

    initializeUserData()
  }, [supabase.auth])

  // 投稿データの取得
  const fetchPosts = useCallback(async () => {
    if (!currentUserId) return

    setLoading(true)
    try {
      // ユーザーのグループIDを取得
      const { data: allGroupIds, error: groupError } = await postService.getUserGroupIds(currentUserId)
      if (groupError) {
        console.error("Error fetching group IDs:", groupError)
        return
      }

      if (!allGroupIds || allGroupIds.length === 0) {
        setPosts([])
        return
      }

      // 選択されたグループがある場合はそれのみ、なければ全グループ
      const targetGroupIds = selectedGroup ? [selectedGroup] : allGroupIds

      // 投稿を取得
      const { data, error } = await postService.getPosts({
        group_ids: targetGroupIds,
        category: selectedCategory || undefined,
        limit: 50 // 初期表示件数
      })

      if (error) {
        console.error("Error fetching posts:", error)
        return
      }

      setPosts(data || [])
    } catch (error) {
      console.error("Error in fetchPosts:", error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, selectedCategory, selectedGroup])

  // 投稿データの更新
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // フィルタリングされた投稿の計算（メモ化）
  const filteredPostsCount = useMemo(() => {
    return posts.length
  }, [posts])

  // ローディング中の表示
  if (loading && !currentUserId) {
    return (
      <div className="container mx-auto py-6">
        <Loading message="読み込み中..." />
      </div>
    )
  }

  // 認証されていない場合
  if (!currentUserId) {
    return (
      <div className="container mx-auto py-6">
        <EmptyState
          title="ログインが必要です"
          description="投稿を表示するにはログインしてください"
          action={
            <Link href="/signin">
              <Button>ログイン</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">家事投稿</h1>
        <Link href="/posts/create">
          <Button>新しい投稿</Button>
        </Link>
      </div>

      {/* フィルター */}
      <div className="mb-6 space-y-4">
        {/* グループ選択 */}
        {userGroups.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">グループで絞り込み</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full max-w-xs p-2 border-2 border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-no-repeat bg-right bg-[length:12px_12px] pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 8px center'
              }}
            >
              <option value="">すべてのグループ</option>
              {userGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* カテゴリ選択 */}
        <div>
          <label className="block text-sm font-medium mb-2">カテゴリで絞り込み</label>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("")}
            >
              すべて
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* 結果の件数表示 */}
        {!loading && (
          <div className="text-sm text-gray-500">
            {filteredPostsCount}件の投稿が見つかりました
          </div>
        )}
      </div>

      {/* 投稿一覧 */}
      <div className="space-y-4">
        {loading ? (
          <Loading message="投稿を読み込み中..." />
        ) : posts.length === 0 ? (
          <EmptyState
            title="投稿がありません"
            description={
              selectedCategory || selectedGroup
                ? "条件に一致する投稿が見つかりませんでした"
                : "まだ投稿がありません。最初の投稿を作成してみましょう！"
            }
            action={
              <Link href="/posts/create">
                <Button>新しい投稿を作成</Button>
              </Link>
            }
          />
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  )
}