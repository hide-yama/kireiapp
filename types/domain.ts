// ドメインオブジェクトの型定義

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  nickname: string
  avatar_url?: string
  created_at: string
}

export interface FamilyGroup {
  id: string
  name: string
  avatar_url?: string
  invitation_code: string
  owner_id: string
  created_at: string
  // Relations
  owner?: Profile
  members?: FamilyMember[]
}

export interface FamilyMember {
  group_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  // Relations
  group?: FamilyGroup
  profile?: Profile
}

export interface Post {
  id: string
  body: string
  category: PostCategory
  place?: string
  group_id: string
  user_id: string
  created_at: string
  // Relations
  group?: FamilyGroup
  profile?: Profile
  post_images?: PostImage[]
  likes?: Like[]
  comments?: Comment[]
  // Computed fields
  like_count?: number
  comment_count?: number
  is_liked?: boolean
}

export interface PostImage {
  id: string
  post_id: string
  storage_path: string
  position: number
  created_at: string
  // Computed fields
  url?: string
}

export interface Like {
  post_id: string
  user_id: string
  created_at: string
  // Relations
  profile?: Profile
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
  is_deleted: boolean
  // Relations
  profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  post_id: string | null
  from_user_id: string | null
  read: boolean
  created_at: string
  // Relations
  related_post?: Post
  from_user?: Profile
}

// Enums
export type PostCategory = '料理' | '掃除' | '洗濯' | '買い物' | 'その他'

export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'post'

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Form types
export interface CreatePostRequest {
  body: string
  category: PostCategory
  place?: string
  group_id: string
  images?: File[]
}

export interface UpdatePostRequest {
  body?: string
  category?: PostCategory
  place?: string
}

export interface CreateGroupRequest {
  name: string
  description?: string
  image?: File
}

export interface UpdateGroupRequest {
  name?: string
  description?: string
  image?: File
}

export interface UpdateProfileRequest {
  nickname?: string
  avatar?: File
}

export interface CreateCommentRequest {
  post_id: string
  body: string
}

// Query types
export interface PostsQuery {
  group_ids?: string[]
  category?: PostCategory
  user_id?: string
  limit?: number
  offset?: number
}

export interface NotificationsQuery {
  read?: boolean
  type?: NotificationType
  limit?: number
  offset?: number
}

// Type guards
export const isValidPostCategory = (category: string): category is PostCategory => {
  return ['料理', '掃除', '洗濯', '買い物', 'その他'].includes(category)
}

export const isValidNotificationType = (type: string): type is NotificationType => {
  return ['like', 'comment', 'post'].includes(type)
}

// Utility types
export type WithProfile<T> = T & { profile: Profile }
export type WithGroup<T> = T & { group: FamilyGroup }
export type WithImages<T> = T & { post_images: PostImage[] }
export type PostWithDetails = WithProfile<WithGroup<WithImages<Post>>>