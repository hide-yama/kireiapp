"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface Post {
  id: string
  body: string
  category: string
  place?: string
  created_at: string
  user_id: string
  profiles?: {
    nickname: string
    avatar_url?: string
  }
  post_images?: {
    id: string
    storage_path: string
    position: number
  }[]
}

const categories = ["料理", "掃除", "洗濯", "買い物", "その他"] as const

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [userGroups, setUserGroups] = useState<{id: string, name: string}[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory, selectedGroup])

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's groups (both owned and member of)
      console.log("Fetching groups for user:", user.id)
      
      const { data: ownedGroups, error: ownedError } = await supabase
        .from("family_groups")
        .select("id")
        .eq("owner_id", user.id)

      console.log("Owned groups result:", { ownedGroups, ownedError })

      const { data: memberData, error: memberError } = await supabase
        .from("family_members")
        .select("group_id")
        .eq("user_id", user.id)

      console.log("Member data result:", { memberData, memberError })

      if (ownedError && memberError) {
        console.error("Error fetching groups:", { ownedError, memberError })
        return
      }

      // Get full group info for the dropdown
      const allGroups = [
        ...(ownedGroups?.map(g => ({ id: g.id, name: g.name })) || []),
        ...(memberData?.map(m => ({ id: m.group_id, name: m.group_id })) || [])
      ]
      
      // Get group names for member groups
      if (memberData && memberData.length > 0) {
        const { data: groupNames } = await supabase
          .from("family_groups")
          .select("id, name")
          .in("id", memberData.map(m => m.group_id))
        
        if (groupNames) {
          groupNames.forEach(group => {
            const existingIndex = allGroups.findIndex(g => g.id === group.id)
            if (existingIndex !== -1) {
              allGroups[existingIndex].name = group.name
            }
          })
        }
      }

      // Remove duplicates and set user groups for dropdown
      const uniqueGroups = allGroups.filter((group, index, self) => 
        index === self.findIndex(g => g.id === group.id)
      )
      setUserGroups(uniqueGroups)

      // Combine owned and member groups
      const allGroupIds = uniqueGroups.map(g => g.id)

      console.log("All group IDs:", allGroupIds)
      console.log("User groups for dropdown:", uniqueGroups)

      if (allGroupIds.length === 0) {
        console.log("No groups found for user")
        return
      }

      // Filter by selected group if one is selected
      const targetGroupIds = selectedGroup ? [selectedGroup] : allGroupIds

      // First try a simple query to test connectivity
      console.log("Testing simple posts query...")
      const { data: testData, error: testError } = await supabase
        .from("posts")
        .select("id, body, category")
        .limit(1)

      console.log("Test query result:", { testData, testError })

      // Try without joins first to isolate the issue
      let query = supabase
        .from("posts")
        .select("id, body, category, place, created_at, user_id, group_id")
        .in("group_id", targetGroupIds)
        .order("created_at", { ascending: false })

      if (selectedCategory) {
        query = query.eq("category", selectedCategory)
      }

      console.log("Executing posts query...")
      const { data, error } = await query

      console.log("Posts query result:", { data, error })

      if (error) {
        console.error("Error fetching posts:", {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          stringified: JSON.stringify(error)
        })
        return
      }

      console.log("Setting posts data:", data)
      
      // Get profiles and images for each post
      if (data && data.length > 0) {
        const postsWithDetails = await Promise.all(
          data.map(async (post) => {
            let postWithDetails = { ...post }

            // Get profile info
            try {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("nickname, avatar_url")
                .eq("id", post.user_id)
                .single()
              
              if (profileData) {
                postWithDetails.profiles = profileData
              }
            } catch (profileError) {
              console.log("Could not fetch profile for post", post.id)
            }

            // Get images
            try {
              const { data: imagesData, error: imagesError } = await supabase
                .from("post_images")
                .select("id, storage_path, position")
                .eq("post_id", post.id)
                .order("position")
              
              console.log(`Images for post ${post.id}:`, { imagesData, imagesError })
              
              if (imagesData && imagesData.length > 0) {
                postWithDetails.post_images = imagesData
                console.log(`Found ${imagesData.length} images for post ${post.id}`)
              } else {
                console.log(`No images found for post ${post.id}`)
              }
            } catch (imagesError) {
              console.error("Error fetching images for post", post.id, imagesError)
            }

            return postWithDetails
          })
        )
        
        console.log("Posts with details:", postsWithDetails)
        setPosts(postsWithDetails)
      } else {
        setPosts(data || [])
      }
    } catch (error: any) {
      console.error("Catch block error:", {
        error,
        message: error?.message,
        stack: error?.stack,
        stringified: JSON.stringify(error),
        type: typeof error
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">家事投稿</h1>
        <Link href="/posts/create">
          <Button>新しい投稿</Button>
        </Link>
      </div>

      <div className="mb-6 space-y-4">
        {/* グループ選択 */}
        <div>
          <label className="block text-sm font-medium mb-2">グループで絞り込み</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full max-w-xs p-2 border rounded-md"
          >
            <option value="">すべてのグループ</option>
            {userGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

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
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              投稿がありません
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {post.profiles?.avatar_url ? (
                        <img
                          src={post.profiles.avatar_url}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {post.profiles?.nickname?.[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{post.profiles?.nickname}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {post.category}
                    </span>
                    {post.place && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {post.place}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 whitespace-pre-wrap">{post.body}</p>
                
                {post.post_images && post.post_images.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 max-w-[300px] mx-auto mb-4">
                    {post.post_images
                      .slice(0, 1)
                      .sort((a, b) => a.position - b.position)
                      .map((image) => {
                        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${image.storage_path}`
                        console.log(`Image URL for ${image.id}:`, imageUrl)
                        return (
                          <div key={image.id} className="aspect-square">
                            <img
                              src={imageUrl}
                              alt="投稿画像"
                              className="w-full h-full object-cover rounded border"
                              onError={(e) => {
                                console.error(`Failed to load image: ${imageUrl}`)
                                e.currentTarget.style.border = '2px solid red'
                              }}
                              onLoad={() => {
                                console.log(`Successfully loaded image: ${imageUrl}`)
                              }}
                            />
                          </div>
                        )
                      })}
                    {post.post_images.length > 1 && (
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        +{post.post_images.length - 1}枚の画像
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <Link href={`/posts/${post.id}`}>
                    <Button variant="outline" size="sm">
                      詳細を見る
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}