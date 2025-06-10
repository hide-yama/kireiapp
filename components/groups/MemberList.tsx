interface Member {
  user_id: string
  role: string
  joined_at: string
  profiles: {
    nickname: string
    avatar_url: string | null
  }
}

interface MemberListProps {
  members: Member[]
  showRole?: boolean
  onRemoveMember?: (userId: string, nickname: string) => void
  currentUserId?: string
}

export function MemberList({ 
  members, 
  showRole = true, 
  onRemoveMember,
  currentUserId 
}: MemberListProps) {
  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.user_id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {member.profiles.avatar_url ? (
              <img
                src={member.profiles.avatar_url}
                alt={member.profiles.nickname}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">
                  {member.profiles.nickname.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium">{member.profiles.nickname}</p>
              {showRole && (
                <p className="text-sm text-gray-600">
                  {member.role === 'owner' ? 'オーナー' : 'メンバー'}
                </p>
              )}
            </div>
          </div>
          
          {onRemoveMember && member.role !== 'owner' && member.user_id !== currentUserId && (
            <button
              onClick={() => onRemoveMember(member.user_id, member.profiles.nickname)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              削除
            </button>
          )}
        </div>
      ))}
    </div>
  )
}