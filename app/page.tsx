import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">きれいにできるもん</CardTitle>
          <CardDescription className="text-lg">
            家族で家事をシェアして、感謝を伝え合おう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-center text-gray-600 dark:text-gray-300">
            <p>家事を写真付きで投稿</p>
            <p>家族からいいねやコメントをもらおう</p>
            <p>みんなで家事を楽しく共有</p>
          </div>
          <div className="space-y-2">
            <Button className="w-full" size="lg" asChild>
              <Link href="/signup">新規登録</Link>
            </Button>
            <Button variant="outline" className="w-full" size="lg" asChild>
              <Link href="/signin">ログイン</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}