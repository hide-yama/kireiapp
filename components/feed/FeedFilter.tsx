'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { SlidersHorizontal } from 'lucide-react'

interface FeedFilterProps {
  groups: Array<{ id: string; name: string }>
}

export function FeedFilter({ groups }: FeedFilterProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  const categories = ['料理', '掃除', '洗濯', '買い物', 'その他']
  
  const activeFilters = selectedGroups.length + selectedCategories.length

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const clearFilters = () => {
    setSelectedGroups([])
    setSelectedCategories([])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>フィルター</DialogTitle>
          <DialogDescription>
            表示する投稿を絞り込みます
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Group Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">グループ</h4>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <Badge
                  key={group.id}
                  variant={selectedGroups.includes(group.id) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleGroup(group.id)}
                >
                  {group.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">カテゴリ</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={clearFilters}>
            クリア
          </Button>
          <Button>
            適用
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}