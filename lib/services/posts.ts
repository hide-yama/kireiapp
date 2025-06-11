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
          created_at
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

      // 関連データを個別に取得
      if (!data || data.length === 0) {
        console.log('No posts found')
        return { data: [], error: null }
      }

      const postsWithDetails = await Promise.all(
        data.map(async (post) => {
          console.log(`Processing post ${post.id}`)
          
          // プロフィール情報を取得
          const { data: profile, error: profileError } = await this.supabase
            .from('profiles')
            .select('id, nickname, avatar_url')
            .eq('id', post.user_id)
            .maybeSingle()
          
          if (profileError) {
            console.error(`Profile fetch error for user ${post.user_id}:`, profileError)
            
            // If profile doesn't exist, try to create it as fallback
            if (profileError.code === 'PGRST116') {
              console.log(`Attempting to create missing profile for user ${post.user_id}`)
              try {
                const { data: newProfile } = await this.supabase
                  .from('profiles')
                  .insert({
                    id: post.user_id,
                    nickname: 'User'
                  })
                  .select('id, nickname, avatar_url')
                  .single()
                
                console.log(`Created profile for user ${post.user_id}:`, newProfile)
              } catch (createError) {
                console.error(`Failed to create profile for user ${post.user_id}:`, createError)
              }
            }
          }
          console.log(`Profile for user ${post.user_id}:`, profile)
          
          // グループ情報を取得
          const { data: group } = await this.supabase
            .from('family_groups')
            .select('id, name')
            .eq('id', post.group_id)
            .single()
          
          // 画像情報を取得
          const { data: post_images } = await this.supabase
            .from('post_images')
            .select('id, storage_path, position')
            .eq('post_id', post.id)
            .order('position')

          // いいね数とコメント数を取得
          const [{ count: like_count }, { count: comment_count }] = await Promise.all([
            this.supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id),
            this.supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id)
          ])

          return {
            ...post,
            profile: profile || { id: post.user_id, nickname: 'Unknown User', avatar_url: null },
            group: group || { id: post.group_id, name: 'Unknown Group' },
            post_images: (post_images || []).map(image => ({
              ...image,
              url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${image.storage_path}`
            })),
            like_count: like_count || 0,
            comment_count: comment_count || 0
          } as PostWithDetails
        })
      )

      console.log('Posts processed successfully:', postsWithDetails.length)
      return { data: postsWithDetails, error: null }
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
          created_at
        `)
        .eq('id', postId)
        .single()

      if (error) {
        return { data: null, error }
      }

      // 関連データを個別に取得
      // プロフィール情報を取得
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .eq('id', data.user_id)
        .maybeSingle()
      
      // If profile doesn't exist, try to create it as fallback
      if (!profile && profileError?.code === 'PGRST116') {
        try {
          await this.supabase
            .from('profiles')
            .insert({
              id: data.user_id,
              nickname: 'User'
            })
        } catch (createError) {
          console.error(`Failed to create profile for user ${data.user_id}:`, createError)
        }
      }
      
      // グループ情報を取得
      const { data: group } = await this.supabase
        .from('family_groups')
        .select('id, name')
        .eq('id', data.group_id)
        .single()
      
      // 画像情報を取得
      const { data: post_images } = await this.supabase
        .from('post_images')
        .select('id, storage_path, position')
        .eq('post_id', data.id)
        .order('position')

      // いいね数とコメント数を取得
      const [{ count: like_count }, { count: comment_count }] = await Promise.all([
        this.supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', data.id),
        this.supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', data.id)
      ])

      // ユーザーがいいねしているかチェック
      let is_liked = false
      if (userId) {
        const { data: likeData } = await this.supabase
          .from('likes')
          .select('id')
          .eq('post_id', data.id)
          .eq('user_id', userId)
          .maybeSingle()
        is_liked = !!likeData
      }

      // データを変換
      const postWithDetails = {
        ...data,
        profile: profile || { id: data.user_id, nickname: 'Unknown User', avatar_url: null },
        group: group || { id: data.group_id, name: 'Unknown Group' },
        post_images: (post_images || []).map(image => ({
          ...image,
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${image.storage_path}`
        })),
        like_count: like_count || 0,
        comment_count: comment_count || 0,
        is_liked
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