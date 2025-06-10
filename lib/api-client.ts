import { createClient } from '@/lib/supabase/client'
import { APIError, NetworkError, handleError } from '@/lib/error-handler'

export type APIResponse<T> = {
  data: T | null
  error: APIError | null
  success: boolean
}

class APIClient {
  private supabase = createClient()

  private handleSupabaseError(error: any): APIError {
    // Supabaseのエラー詳細をログに出力
    console.log('Supabase error details:', {
      message: error?.message,
      code: error?.code,
      hint: error?.hint,
      details: error?.details,
      full: error
    })
    
    const message = error?.message || 'Unknown database error'
    const code = error?.code || 'SUPABASE_ERROR'
    const status = this.getStatusFromError(error)
    
    return new APIError(message, code, status, error)
  }

  private getStatusFromError(error: any): number {
    if (error?.status) return error.status
    if (error?.code === 'PGRST116') return 406 // Not acceptable
    if (error?.code === 'PGRST202') return 404 // Not found
    if (error?.code === 'PGRST204') return 409 // Conflict
    if (error?.code?.startsWith('23')) return 400 // Database constraint violation
    return 500
  }

  private async executeQuery<T>(
    queryFn: () => Promise<any>,
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
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    return this.executeQuery(
      () => this.supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      }),
      { fallbackMessage: 'アカウント作成に失敗しました' }
    )
  }

  async signIn(email: string, password: string) {
    return this.executeQuery(
      () => this.supabase.auth.signInWithPassword({ email, password }),
      { fallbackMessage: 'ログインに失敗しました' }
    )
  }

  async signOut() {
    return this.executeQuery(
      () => this.supabase.auth.signOut(),
      { fallbackMessage: 'ログアウトに失敗しました' }
    )
  }

  async getCurrentUser() {
    return this.executeQuery(
      () => this.supabase.auth.getUser(),
      { showToast: false }
    )
  }

  // Profile methods
  async getProfile(userId: string) {
    return this.executeQuery(
      () => this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      { fallbackMessage: 'プロフィールの取得に失敗しました' }
    )
  }

  async updateProfile(userId: string, updates: any) {
    return this.executeQuery(
      () => this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single(),
      { fallbackMessage: 'プロフィールの更新に失敗しました' }
    )
  }

  async createProfile(profile: any) {
    return this.executeQuery(
      () => this.supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single(),
      { fallbackMessage: 'プロフィールの作成に失敗しました' }
    )
  }

  // Group methods
  async getGroups(userId: string) {
    return this.executeQuery(
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

  async createGroup(group: any) {
    return this.executeQuery(
      () => this.supabase
        .from('family_groups')
        .insert(group)
        .select()
        .single(),
      { fallbackMessage: 'グループの作成に失敗しました' }
    )
  }

  async joinGroup(groupId: string, userId: string) {
    return this.executeQuery(
      () => this.supabase
        .from('family_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        })
        .select()
        .single(),
      { fallbackMessage: 'グループへの参加に失敗しました' }
    )
  }

  async getGroupByInvitationCode(code: string) {
    return this.executeQuery(
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
    queryFn: () => Promise<any>,
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