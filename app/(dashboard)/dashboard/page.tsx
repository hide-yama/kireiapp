'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, FileText, BarChart3 } from 'lucide-react'

interface DashboardStats {
  totalPosts: number
  weeklyPosts: number
  totalGroups: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    weeklyPosts: 0,
    totalGroups: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }

      // グループ数を取得
      const { data: groupsData } = await supabase
        .from('family_groups')
        .select('id')
        .eq('owner_id', user.id)

      const totalGroups = groupsData?.length || 0

      // Get stats from API
      try {
        console.log('Calling dashboard stats API...')
        const response = await fetch('/api/dashboard/stats')
        console.log('Stats API response status:', response.status)
        
        if (!response.ok) {
          console.error('Stats API failed with status:', response.status)
          setStats({
            totalPosts: 0,
            weeklyPosts: 0,
            totalGroups
          })
          return
        }

        const responseText = await response.text()
        console.log('Raw response text:', responseText)
        
        if (!responseText || responseText.trim() === '') {
          console.error('Empty response from stats API')
          setStats({
            totalPosts: 0,
            weeklyPosts: 0,
            totalGroups
          })
          return
        }

        let statsData
        try {
          statsData = JSON.parse(responseText)
          console.log('Parsed stats data:', statsData)
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Raw text:', responseText)
          setStats({
            totalPosts: 0,
            weeklyPosts: 0,
            totalGroups
          })
          return
        }
        
        setStats({
          totalPosts: statsData.totalPosts || 0,
          weeklyPosts: statsData.thisWeekPosts || 0,
          totalGroups: totalGroups
        })
      } catch (statsError) {
        console.error('Error calling stats API:', statsError)
        setStats({
          totalPosts: 0,
          weeklyPosts: 0,
          totalGroups
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">ダッシュボード</CardTitle>
            <CardDescription>家族の家事管理アプリへようこそ</CardDescription>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <CardTitle className="text-lg">投稿を作成</CardTitle>
              </div>
              <CardDescription>新しい家事を投稿</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/posts/create">投稿を作成</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <CardTitle className="text-lg">グループ管理</CardTitle>
              </div>
              <CardDescription>家族グループを管理</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/groups">グループ一覧</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <CardTitle className="text-lg">投稿一覧</CardTitle>
              </div>
              <CardDescription>すべての投稿を表示</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/posts">投稿一覧</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">総投稿数</p>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                </div>
                <FileText className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary text-secondary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">今週の投稿</p>
                  <p className="text-2xl font-bold">{stats.weeklyPosts}</p>
                </div>
                <BarChart3 className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>


          <Card className="bg-gray-800 text-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">参加グループ</p>
                  <p className="text-2xl font-bold">{stats.totalGroups}</p>
                </div>
                <Users className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}