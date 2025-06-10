import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface GroupCardProps {
  group: {
    id: string
    name: string
    avatar_url: string | null
    member_count?: number
  }
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          {group.avatar_url ? (
            <img
              src={group.avatar_url}
              alt={group.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-500" />
            </div>
          )}
          <div>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <CardDescription>
              {group.member_count}人のメンバー
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={`/dashboard/groups/${group.id}`}>
            グループを見る
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}