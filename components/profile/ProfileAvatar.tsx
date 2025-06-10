'use client'

interface ProfileAvatarProps {
  avatarUrl?: string | null
  nickname?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProfileAvatar({ 
  avatarUrl, 
  nickname = 'User', 
  size = 'md',
  className = '' 
}: ProfileAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-20 h-20 text-lg'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${nickname}のアバター`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
          {getInitials(nickname)}
        </div>
      )}
    </div>
  )
}