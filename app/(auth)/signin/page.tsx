'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
// import { signInSchema, type SignInFormData } from '@/lib/validation'
import { apiClient } from '@/lib/api-client'

export default function SignInPage() {
  const router = useRouter()
  const { toast } = useToast()

  type SignInFormData = {
    email: string
    password: string
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    // resolver: zodResolver(signInSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await apiClient.signIn(data.email, data.password)

      if (result.success) {
        toast({
          title: "ログインしました",
          description: "フィードに移動します",
        })
        router.push('/feed')
      } else {
        toast({
          title: "ログインに失敗しました",
          description: result.error?.message || "メールアドレスまたはパスワードが正しくありません",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "エラーが発生しました",
        description: "しばらく時間をおいて再度お試しください",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-white text-black border-gray-200">
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
        <CardDescription>
          メールアドレスとパスワードでログイン
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
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
              placeholder="パスワード"
            />
            {errors.password && (
              <div className="text-sm text-destructive">{errors.password.message}</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            アカウントをお持ちでない方は{' '}
            <Link href="/signup" className="text-primary hover:underline">
              新規登録
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}