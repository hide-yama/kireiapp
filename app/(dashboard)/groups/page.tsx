'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Plus, Users } from 'lucide-react'

interface Group {
  id: string
  name: string
  avatar_url: string | null
  invitation_code: string
  owner_id: string
  created_at: string
  member_count?: number
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    console.log('=== loadGroups started ===')
    
    try {
      console.log('Step 1: Getting user...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('User error:', userError)
        return
      }
      
      if (!user) {
        console.log('No user found')
        setGroups([])
        return
      }

      console.log('Step 2: User found:', user.id)

      // RLSが無効化されているのでdirect queryを試す
      console.log('Step 3: Direct group query...')
      const { data: groupsData, error: groupsError } = await supabase
        .from('family_groups')
        .select('*')
        .eq('owner_id', user.id)

      console.log('Groups query result:', { groupsData, groupsError })

      if (groupsError) {
        console.error('Groups query error:', groupsError)
        console.error('Groups error details:', JSON.stringify(groupsError, null, 2))
        return
      }

      // データが空なら空配列をセットして終了
      if (!groupsData || groupsData.length === 0) {
        console.log('No groups found, setting empty array')
        setGroups([])
        return
      }

      console.log('Found groups data:', groupsData)
      
      // グループデータにメンバーカウントを追加
      const groupsWithCounts = await Promise.all(
        groupsData.map(async (group) => {
          const { count } = await supabase
            .from('family_members')
            .select('*', { count: 'exact' })
            .eq('group_id', group.id)

          return {
            ...group,
            member_count: count || 0
          }
        })
      )

      console.log('Groups with counts:', groupsWithCounts)
      setGroups(groupsWithCounts)

    } catch (error: any) {
      console.error('=== Caught error in loadGroups ===')
      console.error('Error type:', typeof error)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      console.error('Full error:', error)
    } finally {
      console.log('=== loadGroups finished ===')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">グループ一覧</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/groups/create">
              <Plus className="w-4 h-4 mr-2" />
              グループ作成
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/groups/join">
              参加する
            </Link>
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">まだグループがありません</h3>
            <p className="text-gray-600 mb-4">
              新しいグループを作成するか、招待コードで既存のグループに参加しましょう
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/groups/create">グループ作成</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/groups/join">参加する</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {group.avatar_url ? (
                    <img
                      src={group.avatar_url}
                      alt={group.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>
                      {group.member_count}人のメンバー
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/groups/${group.id}`}>
                    グループを見る
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}