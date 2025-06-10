'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { useNotification } from '@/contexts/NotificationContext'

interface NotificationBellProps {
  userId?: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const { unreadCount } = useNotification()

  if (!userId) return null

  return (
    <Button variant="ghost" size="sm" asChild className="relative">
      <Link href="/notifications">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  )
}