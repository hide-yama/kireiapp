'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'

// const profileSchema = z.object({
//   nickname: z.string().min(1, 'ニックネームは必須です').max(50, 'ニックネームは50文字以内で入力してください'),
// })

// type ProfileFormData = z.infer<typeof profileSchema>

type ProfileFormData = {
  nickname: string
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProfileFormData>({
    // resolver: zodResolver(profileSchema)
  })

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/signin')
          return
        }

        setUser(user)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error)
          return
        }

        if (profile) {
          setProfile(profile)
          setValue('nickname', profile.nickname)
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    getProfile()
  }, [supabase, router, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname: data.nickname,
          created_at: profile ? undefined : new Date().toISOString()
        })

      if (error) throw error

      alert('プロフィールを更新しました')
      // プロフィール更新後にページをリロードして最新状態を反映
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error('Error updating profile:', error)
      alert('エラーが発生しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール編集</CardTitle>
          <CardDescription>
            プロフィール情報を編集できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nickname">ニックネーム</Label>
              <Input
                id="nickname"
                {...register('nickname')}
                placeholder="ニックネームを入力"
                disabled={loading}
              />
              {errors.nickname && (
                <p className="text-sm text-red-600">{errors.nickname.message}</p>
              )}
            </div>

            {user && (
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={profile?.avatar_url}
                onUploadComplete={(url) => {
                  setProfile({ ...profile, avatar_url: url })
                }}
              />
            )}

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                disabled={loading}
              >
                キャンセル
              </Button>
            </div>

            <div className="pt-6 border-t">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/signin')
                }}
                disabled={loading}
                className="w-full"
              >
                ログアウト
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}