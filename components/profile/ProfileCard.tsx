'use client'

import { ProfileAvatar } from './ProfileAvatar'
import { Card, CardContent } from '@/components/ui/card'

interface ProfileCardProps {
  profile: {
    nickname: string
    avatar_url?: string | null
    created_at?: string
  }
  showDate?: boolean
  className?: string
}

export function ProfileCard({ profile, showDate = true, className = '' }: ProfileCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <ProfileAvatar
            avatarUrl={profile.avatar_url}
            nickname={profile.nickname}
            size="lg"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{profile.nickname}</h3>
            {showDate && profile.created_at && (
              <p className="text-sm text-gray-500 mt-1">
                登録日: {formatDate(profile.created_at)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}