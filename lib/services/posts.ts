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
    console.log('PostService.getPosts called with query:', query)
    
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
          profiles (
            id,
            nickname,
            avatar_url
          ),
          family_groups (
            id,
            name
          ),
          post_images (
            id,
            storage_path,
            position
          )
        `)
        .order('created_at', { ascending: false })

      console.log('Base query created')

      // フィルタリング
      if (query.group_ids && query.group_ids.length > 0) {
        console.log('Filtering by group_ids:', query.group_ids)
        baseQuery = baseQuery.in('group_id', query.group_ids)
      }

      if (query.category) {
        console.log('Filtering by category:', query.category)
        baseQuery = baseQuery.eq('category', query.category)
      }

      if (query.user_id) {
        console.log('Filtering by user_id:', query.user_id)
        baseQuery = baseQuery.eq('user_id', query.user_id)
      }

      // ページネーション
      if (query.limit) {
        console.log('Limiting to:', query.limit)
        baseQuery = baseQuery.limit(query.limit)
      }

      if (query.offset) {
        console.log('Offset:', query.offset)
        baseQuery = baseQuery.range(query.offset, query.offset + (query.limit || 20) - 1)
      }

      console.log('Executing query...')
      const { data, error } = await baseQuery
      console.log('Query result:', { data: data?.length || 0, error })

      if (error) {
        console.error('Query error details:', error)
        return { data: null, error }
      }

      // データを変換してURLを追加
      const postsWithUrls = (data || []).map(post => ({
        ...post,
        profile: post.profiles,
        group: post.family_groups,
        post_images: post.post_images?.map(image => ({
          ...image,
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${image.storage_path}`
        })) || [],
        like_count: 0, // 別途取得する
        comment_count: 0 // 別途取得する
      })) as PostWithDetails[]

      console.log('Posts processed successfully:', postsWithUrls.length)
      return { data: postsWithUrls, error: null }
    } catch (error) {
      console.error('PostService.getPosts catch error:', error)
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
          profiles (
            id,
            nickname,
            avatar_url
          ),
          family_groups (
            id,
            name
          ),
          post_images (
            id,
            storage_path,
            position
          )
        `)
        .eq('id', postId)
        .single()

      if (error) {
        return { data: null, error }
      }

      // データを変換
      const postWithDetails = {
        ...data,
        profile: data.profiles,
        group: data.family_groups,
        post_images: data.post_images?.map(image => ({
          ...image,
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${image.storage_path}`
        })) || [],
        like_count: 0, // 別途取得
        comment_count: 0, // 別途取得
        is_liked: false // 別途取得
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
    console.log('PostService.getUserGroupIds called for user:', userId)
    
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

      console.log('Group query results:', {
        owned: { data: ownedResult.data, error: ownedResult.error },
        member: { data: memberResult.data, error: memberResult.error }
      })

      if (ownedResult.error && memberResult.error) {
        console.error('Both group queries failed:', { ownedResult, memberResult })
        return { data: null, error: ownedResult.error }
      }

      const ownedGroupIds = ownedResult.data?.map(g => g.id) || []
      const memberGroupIds = memberResult.data?.map(m => m.group_id) || []

      // 重複を除去
      const allGroupIds = Array.from(new Set([...ownedGroupIds, ...memberGroupIds]))

      console.log('User group IDs result:', {
        owned: ownedGroupIds,
        member: memberGroupIds,
        combined: allGroupIds
      })

      return { data: allGroupIds, error: null }
    } catch (error) {
      console.error('PostService.getUserGroupIds catch error:', error)
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
          family_groups (
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

}

export const postService = new PostService()