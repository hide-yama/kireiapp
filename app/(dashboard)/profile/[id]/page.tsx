'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/domain'
import { ArrowLeft } from 'lucide-react'

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const supabase = createClient()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 現在のユーザーIDを取得
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)

        // 自分のプロフィールの場合は編集ページにリダイレクト
        if (user?.id === userId) {
          router.push('/profile')
          return
        }

        // プロフィール情報を取得（user_idではなくidで検索）
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setError('ユーザーが見つかりません')
          } else {
            throw error
          }
        } else {
          setProfile(data)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('プロフィールの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId, supabase, router])

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-700 rounded mb-6"></div>
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-6">
              <div className="h-20 w-20 bg-gray-700 rounded-full mb-4"></div>
              <div className="h-6 w-48 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-700 rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6 text-center">
            <p className="text-gray-400">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        戻る
      </Button>
      
      <h1 className="text-2xl font-bold text-white mb-6">プロフィール</h1>
      
      <ProfileCard profile={profile} />
      
      {/* 将来的に投稿一覧などを追加する場合はここに */}
    </div>
  )
}