'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GroupImageUpload } from '@/components/groups/GroupImageUpload'
import { createClient } from '@/lib/supabase/client'
import { Trash2, RefreshCw } from 'lucide-react'

interface Group {
  id: string
  name: string
  avatar_url: string | null
  invitation_code: string
  owner_id: string
}

interface Member {
  user_id: string
  role: string
  profiles: {
    nickname: string
    avatar_url: string | null
  }
}

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: ''
  })
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

      // Load group data and check if user is owner
      const { data: groupData, error: groupError } = await supabase
        .from('family_groups')
        .select('*')
        .eq('id', params.id)
        .eq('owner_id', user.id)
        .single()

      if (groupError || !groupData) {
        router.push('/groups')
        return
      }

      setGroup(groupData)
      setFormData({
        name: groupData.name,
        avatar_url: groupData.avatar_url || ''
      })

      // Load members (excluding owner) - 別々のクエリで取得
      const { data: membersData } = await supabase
        .from('family_members')
        .select('user_id, role')
        .eq('group_id', params.id)
        .neq('role', 'owner')

      if (membersData) {
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
        
        setMembers(membersWithProfiles)
      }
    } catch (error) {
      console.error('Error loading group data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!group || !formData.name.trim()) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('family_groups')
        .update({
          name: formData.name.trim(),
          avatar_url: formData.avatar_url.trim() || null
        })
        .eq('id', group.id)

      if (error) {
        console.error('Error updating group:', error)
        alert('グループの更新に失敗しました')
      } else {
        alert('グループ情報を更新しました')
        setGroup({ ...group, name: formData.name.trim(), avatar_url: formData.avatar_url.trim() || null })
      }
    } catch (error) {
      console.error('Error updating group:', error)
      alert('エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerateCode = async () => {
    if (!group) return
    
    if (!confirm('招待コードを再生成すると、古いコードは無効になります。続行しますか？')) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${group.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'regenerate_code' }),
      })

      if (response.ok) {
        const { invitation_code } = await response.json()
        setGroup({ ...group, invitation_code })
        alert('招待コードを再生成しました')
      } else {
        alert('招待コードの再生成に失敗しました')
      }
    } catch (error) {
      console.error('Error regenerating code:', error)
      alert('エラーが発生しました')
    }
  }

  const handleRemoveMember = async (userId: string, nickname: string) => {
    if (!confirm(`${nickname}さんをグループから削除しますか？`)) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${group?.id}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (response.ok) {
        setMembers(members.filter(m => m.user_id !== userId))
        alert('メンバーを削除しました')
      } else {
        alert('メンバーの削除に失敗しました')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      alert('エラーが発生しました')
    }
  }

  const handleDeleteGroup = async () => {
    if (!group) return

    if (!confirm(`グループ「${group.name}」を完全に削除しますか？\n\nこの操作は取り消せません。すべてのメンバーとデータが削除されます。`)) {
      return
    }

    if (!confirm('本当に削除しますか？この操作は元に戻せません。')) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('グループを削除しました')
        router.push('/groups')
      } else {
        const error = await response.json()
        alert(error.error || 'グループの削除に失敗しました')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      alert('エラーが発生しました')
    }
  }

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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">グループ設定</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              グループの名前とアイコン画像を編集できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">グループ名 *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <GroupImageUpload
                currentImageUrl={formData.avatar_url}
                onUploadComplete={(url) => setFormData({ ...formData, avatar_url: url })}
              />

              <Button type="submit" disabled={saving || !formData.name.trim()}>
                {saving ? '保存中...' : '変更を保存'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>招待コード</CardTitle>
            <CardDescription>
              現在の招待コード: <code className="bg-gray-100 px-2 py-1 rounded">{group.invitation_code}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleRegenerateCode}>
              <RefreshCw className="w-4 h-4 mr-2" />
              招待コードを再生成
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>メンバー管理</CardTitle>
            <CardDescription>
              グループメンバーを管理できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-gray-600">メンバーはあなただけです</p>
            ) : (
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
                      <span className="font-medium">{member.profiles.nickname}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member.user_id, member.profiles.nickname)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">危険な操作</CardTitle>
            <CardDescription>
              グループを完全に削除します。この操作は取り消せません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGroup}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              グループを削除
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← 戻る
        </Button>
      </div>
    </div>
  )
}