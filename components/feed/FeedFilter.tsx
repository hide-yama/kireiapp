"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface Group {
  id: string
  name: string
}

interface FeedFilterProps {
  groups: Group[]
  selectedGroups: string[]
  selectedCategories: string[]
  onGroupsChange: (groupIds: string[]) => void
  onCategoriesChange: (categories: string[]) => void
  onClear: () => void
}

const CATEGORIES = ['料理', '掃除', '洗濯', '買い物', 'その他']

export function FeedFilter({
  groups,
  selectedGroups,
  selectedCategories,
  onGroupsChange,
  onCategoriesChange,
  onClear
}: FeedFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      onGroupsChange(selectedGroups.filter(id => id !== groupId))
    } else {
      onGroupsChange([...selectedGroups, groupId])
    }
  }

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category))
    } else {
      onCategoriesChange([...selectedCategories, category])
    }
  }

  const hasActiveFilters = selectedGroups.length > 0 || selectedCategories.length > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">フィルター</CardTitle>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Badge variant="secondary">
              {selectedGroups.length + selectedCategories.length}件
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '閉じる' : '開く'}
          </Button>
        </div>
      </CardHeader>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <CardContent className="pt-0 pb-2">
          <div className="flex flex-wrap gap-2">
            {selectedGroups.map(groupId => {
              const group = groups.find(g => g.id === groupId)
              return group ? (
                <Badge key={groupId} variant="outline" className="flex items-center gap-1">
                  {group.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0"
                    onClick={() => toggleGroup(groupId)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ) : null
            })}
            {selectedCategories.map(category => (
              <Badge key={category} variant="outline" className="flex items-center gap-1">
                {category}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0"
                  onClick={() => toggleCategory(category)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={onClear}>
              すべてクリア
            </Button>
          </div>
        </CardContent>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Group Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">グループ</h4>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant={selectedGroups.includes(group.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleGroup(group.id)}
                >
                  {group.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">カテゴリ</h4>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}