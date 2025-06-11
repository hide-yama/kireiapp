'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Home, Users } from 'lucide-react'

interface MobileNavigationProps {
  userId: string
}

interface Profile {
  avatar_url?: string
  nickname?: string
}

export function MobileNavigation({ userId }: MobileNavigationProps) {
  const { scrollDirection } = useScrollDirection()
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, nickname')
          .eq('id', userId)
          .single()

        if (data && !error) {
          setProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId, supabase])

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-40 md:hidden
      transition-all duration-300 ease-in-out
      ${scrollDirection === 'down' 
        ? 'glass-transparent border-t border-gray-600/10' 
        : 'glass border-t border-gray-600/30'
      }
    `}>
      <div className="flex items-center justify-around h-14 px-4">
        <Link href="/feed">
          <Button variant="ghost" size="sm" className="p-3">
            <Home className="h-7 w-7" />
          </Button>
        </Link>
        <Link href="/groups">
          <Button variant="ghost" size="sm" className="p-3">
            <Users className="h-7 w-7" />
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="p-1">
            <ProfileAvatar 
              size="sm" 
              avatarUrl={profile?.avatar_url}
              nickname={profile?.nickname}
            />
          </Button>
        </Link>
      </div>
    </nav>
  )
}