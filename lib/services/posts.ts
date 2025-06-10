// Post関連の Service Layer
import { createClient } from '@/lib/supabase/client'
import { Post, PostsQuery, PostWithDetails, PostCategory } from '@/types/domain'
import type { SupabaseClient } from '@supabase/supabase-js'

export class PostService {
  constructor(private supabase: SupabaseClient = createClient()) {}

  /**
   * 投稿一覧を効率的に取得（N+1問題を解決）
   */
  async getPosts(query: PostsQuery = {}): Promise<{ data: PostWithDetails[] | null; error: unknown }> {
    try {
      let baseQuery = this.supabase
        .from('posts')
        .select(`
          id,
          body,
          category,
          place,
          group_id,
          user_id,
          created_at,
          updated_at,
          profile:profiles!posts_user_id_fkey (
            id,
            nickname,
            avatar_url
          ),
          group:family_groups!posts_group_id_fkey (
            id,
            name
          ),
          post_images (
            id,
            storage_path,
            position
          ),
          likes:post_likes (
            count
          ),
          comments:post_comments (
            count
          )
        `)
        .order('created_at', { ascending: false })

      // フィルタリング
      if (query.group_ids && query.group_ids.length > 0) {
        baseQuery = baseQuery.in('group_id', query.group_ids)
      }

      if (query.category) {
        baseQuery = baseQuery.eq('category', query.category)
      }

      if (query.user_id) {
        baseQuery = baseQuery.eq('user_id', query.user_id)
      }

      // ページネーション
      if (query.limit) {
        baseQuery = baseQuery.limit(query.limit)
      }

      if (query.offset) {
        baseQuery = baseQuery.range(query.offset, query.offset + (query.limit || 20) - 1)
      }

      const { data, error } = await baseQuery

      if (error) {
        return { data: null, error }
      }

      // データを変換してURLを追加
      const postsWithUrls = (data || []).map(post => ({
        ...post,
        post_images: post.post_images?.map(image => ({
          ...image,
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${image.storage_path}`
        })) || [],
        like_count: post.likes?.[0]?.count || 0,
        comment_count: post.comments?.[0]?.count || 0
      })) as PostWithDetails[]

      return { data: postsWithUrls, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * 単一投稿を詳細情報付きで取得
   */
  async getPostById(postId: string, userId?: string): Promise<{ data: PostWithDetails | null; error: unknown }> {
    try {
      const { data, error } = await this.supabase
        .from('posts')
        .select(`
          id,
          body,
          category,
          place,
          group_id,
          user_id,
          created_at,
          updated_at,
          profile:profiles!posts_user_id_fkey (
            id,
            nickname,
            avatar_url
          ),
          group:family_groups!posts_group_id_fkey (
            id,
            name
          ),
          post_images (
            id,
            storage_path,
            position
          ),
          likes:post_likes (
            count
          ),
          comments:post_comments (
            count
          )
          ${userId ? `, user_likes:post_likes!post_likes_user_id_fkey(user_id)` : ''}
        `)
        .eq('id', postId)
        .single()

      if (error) {
        return { data: null, error }
      }

      // データを変換
      const postWithDetails = {
        ...data,
        post_images: data.post_images?.map(image => ({
          ...image,
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${image.storage_path}`
        })) || [],
        like_count: data.likes?.[0]?.count || 0,
        comment_count: data.comments?.[0]?.count || 0,
        is_liked: userId ? data.user_likes?.some((like: any) => like.user_id === userId) : false
      } as PostWithDetails

      return { data: postWithDetails, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * ユーザーが参加しているグループのIDを効率的に取得
   */
  async getUserGroupIds(userId: string): Promise<{ data: string[] | null; error: unknown }> {
    try {
      // 所有グループと参加グループを並行取得
      const [ownedResult, memberResult] = await Promise.all([
        this.supabase
          .from('family_groups')
          .select('id')
          .eq('owner_id', userId),
        this.supabase
          .from('family_members')
          .select('group_id')
          .eq('user_id', userId)
      ])

      if (ownedResult.error && memberResult.error) {
        return { data: null, error: ownedResult.error }
      }

      const ownedGroupIds = ownedResult.data?.map(g => g.id) || []
      const memberGroupIds = memberResult.data?.map(m => m.group_id) || []

      // 重複を除去
      const allGroupIds = Array.from(new Set([...ownedGroupIds, ...memberGroupIds]))

      return { data: allGroupIds, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * ユーザーのグループ一覧を名前付きで取得
   */
  async getUserGroupsWithNames(userId: string): Promise<{ data: Array<{id: string, name: string}> | null; error: unknown }> {
    try {
      // 効率的なクエリで一度に取得
      const { data, error } = await this.supabase
        .from('family_members')
        .select(`
          group_id,
          family_groups!family_members_group_id_fkey (
            id,
            name
          )
        `)
        .eq('user_id', userId)

      if (error) {
        return { data: null, error }
      }

      // 所有グループも取得
      const { data: ownedGroups, error: ownedError } = await this.supabase
        .from('family_groups')
        .select('id, name')
        .eq('owner_id', userId)

      if (ownedError) {
        return { data: null, error: ownedError }
      }

      // データを統合
      const memberGroups = data?.map(m => ({
        id: m.family_groups?.id || m.group_id,
        name: m.family_groups?.name || 'Unknown Group'
      })) || []

      const allGroups = [...(ownedGroups || []), ...memberGroups]

      // 重複除去
      const uniqueGroups = allGroups.filter((group, index, self) => 
        index === self.findIndex(g => g.id === group.id)
      )

      return { data: uniqueGroups, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * いいね数を効率的に取得
   */
  async getLikeCounts(postIds: string[]): Promise<{ data: Record<string, number> | null; error: unknown }> {
    try {
      const { data, error } = await this.supabase
        .from('post_likes')
        .select('post_id, count(*)')
        .in('post_id', postIds)

      if (error) {
        return { data: null, error }
      }

      const likeCounts = (data || []).reduce((acc, item) => {
        acc[item.post_id] = item.count
        return acc
      }, {} as Record<string, number>)

      return { data: likeCounts, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

export const postService = new PostService()