import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // ユーザーが確認された場合、プロフィールが存在するかチェック
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // プロフィールが存在するかチェック
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        // プロフィールが存在しない場合は作成
        if (!profile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              nickname: user.email?.split('@')[0] || 'ユーザー',
              avatar_url: null
            })
          
          if (profileError) {
            console.error('Error creating profile:', profileError)
          }
        }
      }

      // 成功時はダッシュボードにリダイレクト
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // エラー時はエラーページまたはサインインページにリダイレクト
  return NextResponse.redirect(new URL('/signin?error=confirmation_failed', request.url))
}