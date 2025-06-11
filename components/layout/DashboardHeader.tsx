'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { Home, Users, User, Sparkles } from 'lucide-react'

interface DashboardHeaderProps {
  userId: string
}

export function DashboardHeader({ userId }: DashboardHeaderProps) {
  const { isVisible } = useScrollDirection()

  return (
    <header className={`
      sticky top-0 z-40 glass border-b border-gray-600/30 dark:border-gray-600/30
      transition-transform duration-300 ease-in-out
      ${isVisible ? 'translate-y-0' : '-translate-y-full'}
    `}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/feed" className="group flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
            <div className="flex flex-col leading-tight">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent group-hover:from-blue-100 group-hover:via-blue-300 group-hover:to-blue-500 transition-all duration-300">
                きれいに
              </h1>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent group-hover:from-blue-100 group-hover:via-blue-300 group-hover:to-blue-500 transition-all duration-300 -mt-1">
                できるもん
              </h1>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/feed">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-5 w-5" />
                フィード
              </Button>
            </Link>
            <Link href="/groups">
              <Button variant="ghost" size="sm" className="gap-2">
                <Users className="h-5 w-5" />
                グループ
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-5 w-5" />
                プロフィール
              </Button>
            </Link>
          </nav>

          <div className="flex items-center">
            <NotificationBell userId={userId} />
          </div>
        </div>
      </div>
    </header>
  )
}