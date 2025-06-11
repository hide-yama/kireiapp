import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { Home, Users, User, LogOut } from 'lucide-react'

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
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 glass border-b border-gray-200/20 dark:border-gray-800/20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/feed" className="group flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform duration-200" />
                <h1 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors duration-200">
                  キレイにできるもん
                </h1>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-1">
                <Link href="/feed">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Home className="h-4 w-4" />
                    フィード
                  </Button>
                </Link>
                <Link href="/groups">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Users className="h-4 w-4" />
                    グループ
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    プロフィール
                  </Button>
                </Link>
              </nav>

              <div className="flex items-center gap-3">
                <NotificationBell userId={user.id} />
                
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/50">
                  <ProfileAvatar
                    avatarUrl={profile?.avatar_url}
                    nickname={profile?.nickname || 'User'}
                    size="sm"
                  />
                  <span className="text-sm font-medium">
                    {profile?.nickname || 'ゲスト'}
                  </span>
                </div>
                
                <form action="/api/auth/signout" method="post">
                  <Button type="submit" variant="ghost" size="icon" className="rounded-full">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-gray-200/20 dark:border-gray-800/20 safe-bottom">
          <div className="grid grid-cols-3 gap-1 p-2">
            <Link href="/feed">
              <Button variant="ghost" size="sm" className="w-full flex-col gap-1 h-auto py-2">
                <Home className="h-5 w-5" />
                <span className="text-xs">フィード</span>
              </Button>
            </Link>
            <Link href="/groups">
              <Button variant="ghost" size="sm" className="w-full flex-col gap-1 h-auto py-2">
                <Users className="h-5 w-5" />
                <span className="text-xs">グループ</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="w-full flex-col gap-1 h-auto py-2">
                <User className="h-5 w-5" />
                <span className="text-xs">プロフィール</span>
              </Button>
            </Link>
          </div>
        </nav>

        <main className="container mx-auto px-4 lg:px-8 py-6 lg:py-8 pb-24 md:pb-8">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </NotificationProvider>
  )
}