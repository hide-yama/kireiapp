'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GroupImageUpload } from '@/components/groups/GroupImageUpload'

export default function CreateGroupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: ''
  })

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, avatar_url: url })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const group = await response.json()
        router.push(`/groups/${group.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'グループの作成に失敗しました')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>新しいグループを作成</CardTitle>
          <CardDescription>
            家族グループを作成して、みんなで家事を共有しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">グループ名 *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例：山田家"
                required
              />
            </div>

            <GroupImageUpload
              onUploadComplete={handleImageUpload}
              currentImageUrl={formData.avatar_url}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !formData.name.trim()}>
                {loading ? '作成中...' : 'グループを作成'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
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