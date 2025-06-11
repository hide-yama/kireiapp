'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Users, Settings, Copy, Check } from 'lucide-react'

interface Group {
  id: string
  name: string
  avatar_url: string | null
  invitation_code: string
  owner_id: string
  created_at: string
}

interface Member {
  user_id: string
  role: string
  joined_at: string
  profiles: {
    nickname: string
    avatar_url: string | null
  }
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [codeCopied, setCodeCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadGroupData()
  }, [params.id])

  const loadGroupData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }
      setCurrentUser(user)

      // Check if user is a member of this group
      const { data: membership } = await supabase
        .from('family_members')
        .select('*')
        .eq('group_id', params.id)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        router.push('/groups')
        return
      }

      // Load group data
      const { data: groupData, error: groupError } = await supabase
        .from('family_groups')
        .select('*')
        .eq('id', params.id)
        .single()

      if (groupError || !groupData) {
        console.error('Error loading group:', groupError)
        router.push('/dashboard/groups')
        return
      }

      setGroup(groupData)

      // Load members - 別々のクエリで取得
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('user_id, role, joined_at')
        .eq('group_id', params.id)
        .order('joined_at', { ascending: true })

      if (membersError) {
        console.error('Error loading members:', membersError)
        console.error('Members error details:', JSON.stringify(membersError, null, 2))
      } else if (membersData) {
        // 各メンバーのプロフィール情報を取得
        const membersWithProfiles = await Promise.all(
          membersData.map(async (member) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('nickname, avatar_url')
              .eq('id', member.user_id)
              .single()

            return {
              ...member,
              profiles: profile || { nickname: 'Unknown', avatar_url: null }
            }
          })
        )
        
        console.log('Members with profiles:', membersWithProfiles)
        setMembers(membersWithProfiles)
      }
    } catch (error) {
      console.error('Error loading group data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyInvitationCode = async () => {
    if (!group) return
    
    try {
      await navigator.clipboard.writeText(group.invitation_code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const isOwner = currentUser && group && currentUser.id === group.owner_id

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">グループが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          {group.avatar_url ? (
            <img
              src={group.avatar_url}
              alt={group.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-500" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-gray-300">{members.length}人のメンバー</p>
          </div>
        </div>
        
        {isOwner && (
          <Button asChild variant="outline">
            <Link href={`/groups/${group.id}/settings`}>
              <Settings className="w-4 h-4 mr-2" />
              設定
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>招待コード</CardTitle>
            <CardDescription>
              このコードを共有して新しいメンバーを招待できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-lg font-mono flex-1 text-center text-gray-900 dark:text-gray-100">
                {group.invitation_code}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyInvitationCode}
                className="flex items-center gap-1"
              >
                {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {codeCopied ? 'コピー済み' : 'コピー'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>メンバー一覧</CardTitle>
            <CardDescription>
              グループに参加している全メンバー
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center gap-3">
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
                    <p className="font-medium text-white">{member.profiles.nickname}</p>
                    <p className="text-sm text-gray-300">
                      {member.role === 'owner' ? 'オーナー' : 'メンバー'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button asChild variant="outline">
          <Link href="/groups">← グループ一覧に戻る</Link>
        </Button>
      </div>
    </div>
  )
}