import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-white via-blue-100 to-purple-100 bg-[length:200%_200%] animate-gradient text-black">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8" />
            きれいにできるもん
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            <span className="block sm:inline">家族で家事をシェアして、</span>
            <span className="block sm:inline">感謝を伝え合おう</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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