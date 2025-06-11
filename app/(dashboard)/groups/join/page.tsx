'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function JoinGroupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitationCode.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitation_code: invitationCode }),
      })

      if (response.ok) {
        const { group } = await response.json()
        router.push(`/groups/${group.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'グループへの参加に失敗しました')
      }
    } catch (error) {
      console.error('Error joining group:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>グループに参加</CardTitle>
          <CardDescription>
            招待コードを入力してグループに参加しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invitationCode">招待コード *</Label>
              <Input
                id="invitationCode"
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                placeholder="例：ABC12345"
                required
                maxLength={8}
                className="uppercase"
              />
              <p className="text-sm text-gray-600">
                8文字の英数字コードを入力してください
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !invitationCode.trim()}>
                {loading ? '参加中...' : 'グループに参加'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}