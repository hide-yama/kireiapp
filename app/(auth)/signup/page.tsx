'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { signUpSchema, type SignUpFormData } from '@/lib/validation'
import { apiClient } from '@/lib/api-client'
import { useState } from 'react'

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [rateLimitTime, setRateLimitTime] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: SignUpFormData) => {
    const authResult = await apiClient.signUp(
      data.email,
      data.password,
      { nickname: data.nickname }
    )

    if (!authResult.success || !authResult.data?.user) {
      // レート制限エラーの場合は待機時間を抽出
      if (authResult.error?.message?.includes('after')) {
        const match = authResult.error.message.match(/after (\d+) seconds/)
        if (match) {
          const seconds = parseInt(match[1])
          setRateLimitTime(seconds)
          setTimeout(() => setRateLimitTime(null), seconds * 1000)
        }
      }
      return
    }

    // 少し待機してからプロファイルを作成（認証データの同期を待つ）
    await new Promise(resolve => setTimeout(resolve, 500))

    const profileResult = await apiClient.createProfile({
      id: authResult.data.user.id,
      nickname: data.nickname,
    })

    if (profileResult.success) {
      toast({
        title: "アカウントが作成されました",
        description: "ダッシュボードに移動します",
        variant: "success",
      })
      router.push('/dashboard')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>アカウント作成</CardTitle>
        <CardDescription>
          キレイにできるもんで家族と家事をシェアしよう
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">ニックネーム</Label>
            <Input
              id="nickname"
              type="text"
              {...register('nickname')}
              placeholder="お名前"
            />
            {errors.nickname && (
              <div className="text-sm text-destructive">{errors.nickname.message}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="mail@example.com"
            />
            {errors.email && (
              <div className="text-sm text-destructive">{errors.email.message}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="8文字以上（大文字・小文字・数字を含む）"
            />
            {errors.password && (
              <div className="text-sm text-destructive">{errors.password.message}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード確認</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="パスワードを再入力"
            />
            {errors.confirmPassword && (
              <div className="text-sm text-destructive">{errors.confirmPassword.message}</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || rateLimitTime !== null}
          >
            {isSubmitting ? '登録中...' : 
             rateLimitTime !== null ? `${rateLimitTime}秒後に再試行してください` : 
             'アカウントを作成'}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/signin" className="text-primary hover:underline">
              ログイン
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}