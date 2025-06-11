import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { DashboardLayoutClient } from '@/components/layout/DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  // プロフィール情報を取得
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, create one and then redirect to profile setup
  if (!profile && profileError?.code === 'PGRST116') {
    try {
      await supabase
        .from('profiles')
        .insert({
          id: user.id,
          nickname: user.user_metadata?.nickname || 'User'
        })
      
      // Redirect to profile page for setup
      redirect('/profile')
    } catch (error) {
      console.error('Failed to create profile:', error)
      redirect('/signin')
    }
  }

  return (
    <NotificationProvider userId={user.id}>
      <DashboardLayoutClient userId={user.id}>
        {children}
      </DashboardLayoutClient>
    </NotificationProvider>
  )
}