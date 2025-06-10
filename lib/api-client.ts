import { createClient } from '@/lib/supabase/client'
import { APIError, NetworkError, handleError } from '@/lib/error-handler'
import { 
  Profile, 
  FamilyGroup, 
  FamilyMember, 
  User,
  UpdateProfileRequest,
  CreateGroupRequest 
} from '@/types/domain'
import type { AuthResponse } from '@supabase/supabase-js'

export interface APIResponse<T> {
  data: T | null
  error: APIError | null
  success: boolean
}

class APIClient {
  private supabase = createClient()

  private handleSupabaseError(error: unknown): APIError {
    // Supabaseのエラー詳細をログに出力
    const errorObj = error as { message?: string; code?: string; hint?: string; details?: string }
    console.log('Supabase error details:', {
      message: errorObj?.message,
      code: errorObj?.code,
      hint: errorObj?.hint,
      details: errorObj?.details,
      full: error
    })
    
    const message = errorObj?.message || 'Unknown database error'
    const code = errorObj?.code || 'SUPABASE_ERROR'
    const status = this.getStatusFromError(error)
    
    return new APIError(message, code, status, error)
  }

  private getStatusFromError(error: unknown): number {
    const errorObj = error as { status?: number; code?: string }
    if (errorObj?.status) return errorObj.status
    if (errorObj?.code === 'PGRST116') return 406 // Not acceptable
    if (errorObj?.code === 'PGRST202') return 404 // Not found
    if (errorObj?.code === 'PGRST204') return 409 // Conflict
    if (errorObj?.code?.startsWith('23')) return 400 // Database constraint violation
    return 500
  }

  private async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: unknown }>,
    options?: {
      showToast?: boolean
      fallbackMessage?: string
    }
  ): Promise<APIResponse<T>> {
    try {
      const result = await queryFn()
      
      if (result.error) {
        const apiError = this.handleSupabaseError(result.error)
        
        if (options?.showToast !== false) {
          handleError(apiError, {
            showToast: true,
            fallbackMessage: options?.fallbackMessage,
          })
        }
        
        return {
          data: null,
          error: apiError,
          success: false,
        }
      }
      
      return {
        data: result.data,
        error: null,
        success: true,
      }
    } catch (error) {
      const apiError = error instanceof Error 
        ? new NetworkError(error.message)
        : new NetworkError()
        
      if (options?.showToast !== false) {
        handleError(apiError, {
          showToast: true,
          fallbackMessage: options?.fallbackMessage,
        })
      }
      
      return {
        data: null,
        error: apiError,
        success: false,
      }
    }
  }

  // Auth methods
  async signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<APIResponse<AuthResponse>> {
    return this.executeQuery<AuthResponse>(
      () => this.supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      }),
      { fallbackMessage: 'アカウント作成に失敗しました' }
    )
  }

  async signIn(email: string, password: string): Promise<APIResponse<AuthResponse>> {
    return this.executeQuery<AuthResponse>(
      () => this.supabase.auth.signInWithPassword({ email, password }),
      { fallbackMessage: 'ログインに失敗しました' }
    )
  }

  async signOut(): Promise<APIResponse<void>> {
    return this.executeQuery<void>(
      () => this.supabase.auth.signOut(),
      { fallbackMessage: 'ログアウトに失敗しました' }
    )
  }

  async getCurrentUser(): Promise<APIResponse<{ user: User | null }>> {
    return this.executeQuery<{ user: User | null }>(
      () => this.supabase.auth.getUser(),
      { showToast: false }
    )
  }

  // Profile methods
  async getProfile(userId: string): Promise<APIResponse<Profile>> {
    return this.executeQuery<Profile>(
      () => this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      { fallbackMessage: 'プロフィールの取得に失敗しました' }
    )
  }

  async updateProfile(userId: string, updates: Partial<UpdateProfileRequest>): Promise<APIResponse<Profile>> {
    return this.executeQuery<Profile>(
      () => this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single(),
      { fallbackMessage: 'プロフィールの更新に失敗しました' }
    )
  }

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<APIResponse<Profile>> {
    return this.executeQuery<Profile>(
      () => this.supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single(),
      { fallbackMessage: 'プロフィールの作成に失敗しました' }
    )
  }

  // Group methods
  async getGroups(userId: string): Promise<APIResponse<FamilyMember[]>> {
    return this.executeQuery<FamilyMember[]>(
      () => this.supabase
        .from('family_members')
        .select(`
          *,
          family_groups (*)
        `)
        .eq('user_id', userId),
      { fallbackMessage: 'グループの取得に失敗しました' }
    )
  }

  async createGroup(group: Omit<FamilyGroup, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<FamilyGroup>> {
    return this.executeQuery<FamilyGroup>(
      () => this.supabase
        .from('family_groups')
        .insert(group)
        .select()
        .single(),
      { fallbackMessage: 'グループの作成に失敗しました' }
    )
  }

  async joinGroup(groupId: string, userId: string): Promise<APIResponse<FamilyMember>> {
    return this.executeQuery<FamilyMember>(
      () => this.supabase
        .from('family_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member' as const
        })
        .select()
        .single(),
      { fallbackMessage: 'グループへの参加に失敗しました' }
    )
  }

  async getGroupByInvitationCode(code: string): Promise<APIResponse<FamilyGroup>> {
    return this.executeQuery<FamilyGroup>(
      () => this.supabase
        .from('family_groups')
        .select('*')
        .eq('invitation_code', code)
        .single(),
      { fallbackMessage: '招待コードが見つかりません' }
    )
  }

  // Generic query method for custom queries
  async query<T>(
    queryFn: () => Promise<{ data: T | null; error: unknown }>,
    options?: {
      showToast?: boolean
      fallbackMessage?: string
    }
  ): Promise<APIResponse<T>> {
    return this.executeQuery<T>(queryFn, options)
  }
}

export const apiClient = new APIClient()
export default apiClient