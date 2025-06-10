import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, Crown, Settings } from 'lucide-react'

interface GroupMember {
  user_id: string
  role: 'owner' | 'member'
  profiles: {
    nickname: string
    avatar_url: string | null
  }
}

interface Group {
  id: string
  name: string
  avatar_url: string | null
  invitation_code: string
  owner_id: string
  created_at: string
  family_members: GroupMember[]
}

interface GroupSummaryProps {
  groups: Group[]
}

export function GroupSummary({ groups }: GroupSummaryProps) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={group.avatar_url || undefined} />
                <AvatarFallback>
                  {group.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  {group.family_members.length}人のメンバー
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/groups/${group.id}/settings`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {group.family_members.slice(0, 4).map((member) => (
                <div key={member.user_id} className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.profiles.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {member.profiles.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.profiles.nickname}</span>
                  {member.role === 'owner' && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
              ))}
              {group.family_members.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{group.family_members.length - 4}人
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1" asChild>
                <Link href={`/groups/${group.id}`}>
                  グループを見る
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link href="/posts/create">
                  投稿する
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {groups.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              まだグループに参加していません
            </p>
            <div className="space-x-2">
              <Button asChild>
                <Link href="/groups/create">グループを作成</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/groups/join">グループに参加</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}