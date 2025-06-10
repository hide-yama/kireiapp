export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nickname: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          nickname: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nickname?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      family_groups: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          invitation_code: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          avatar_url?: string | null
          invitation_code?: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          invitation_code?: string
          owner_id?: string
          created_at?: string
        }
      }
      family_members: {
        Row: {
          group_id: string
          user_id: string
          role: 'owner' | 'member'
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          role: 'owner' | 'member'
          joined_at?: string
        }
        Update: {
          group_id?: string
          user_id?: string
          role?: 'owner' | 'member'
          joined_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          group_id: string
          user_id: string
          body: string
          category: '料理' | '掃除' | '洗濯' | '買い物' | 'その他'
          place: string | null
          time_spent: number | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          body: string
          category: '料理' | '掃除' | '洗濯' | '買い物' | 'その他'
          place?: string | null
          time_spent?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          body?: string
          category?: '料理' | '掃除' | '洗濯' | '買い物' | 'その他'
          place?: string | null
          time_spent?: number | null
          created_at?: string
        }
      }
      post_images: {
        Row: {
          id: string
          post_id: string
          storage_path: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          storage_path: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          storage_path?: string
          position?: number
          created_at?: string
        }
      }
      likes: {
        Row: {
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          body: string
          created_at: string
          is_deleted: boolean
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          body: string
          created_at?: string
          is_deleted?: boolean
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          body?: string
          created_at?: string
          is_deleted?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'like' | 'comment' | 'post'
          post_id: string | null
          from_user_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'like' | 'comment' | 'post'
          post_id?: string | null
          from_user_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'like' | 'comment' | 'post'
          post_id?: string | null
          from_user_id?: string | null
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}