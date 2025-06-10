import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notifications/NotificationBell'

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
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold hover:text-blue-600 transition-colors">
                キレイにできるもん
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-sm hover:text-blue-600 transition-colors">
                  ダッシュボード
                </Link>
                <Link href="/groups" className="text-sm hover:text-blue-600 transition-colors">
                  グループ
                </Link>
                <Link href="/profile" className="text-sm hover:text-blue-600 transition-colors">
                  プロフィール
                </Link>
              </nav>
              <div className="flex items-center space-x-2">
                <NotificationBell userId={user.id} />
                <ProfileAvatar
                  avatarUrl={profile?.avatar_url}
                  nickname={profile?.nickname || 'User'}
                  size="sm"
                />
                <span className="text-sm font-medium">
                  {profile?.nickname || 'ゲスト'}
                </span>
                <form action="/api/auth/signout" method="post">
                  <Button type="submit" variant="outline" size="sm">
                    サインアウト
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}