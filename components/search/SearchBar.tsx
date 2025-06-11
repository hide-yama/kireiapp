"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X, Calendar, User } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onAdvancedSearch?: (filters: SearchFilters) => void
  placeholder?: string
}

interface SearchFilters {
  query: string
  dateFrom?: string
  dateTo?: string
  author?: string
  category?: string
}

export function SearchBar({ 
  onSearch, 
  onAdvancedSearch, 
  placeholder = "投稿を検索..."
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<SearchFilters>({
    query: '',
    dateFrom: '',
    dateTo: '',
    author: '',
    category: ''
  })

  const handleSimpleSearch = () => {
    onSearch(query)
  }

  const handleAdvancedSearch = () => {
    if (onAdvancedSearch) {
      onAdvancedSearch({
        ...advancedFilters,
        query
      })
    }
  }

  const clearFilters = () => {
    setQuery('')
    setAdvancedFilters({
      query: '',
      dateFrom: '',
      dateTo: '',
      author: '',
      category: ''
    })
    onSearch('')
  }

  const categories = ['料理', '掃除', '洗濯', '買い物', 'その他']

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSimpleSearch()
              }
            }}
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearFilters}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button onClick={handleSimpleSearch}>
          検索
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          詳細検索
        </Button>
      </div>

      {/* Advanced Search */}
      {showAdvanced && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  期間
                </label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={advancedFilters.dateFrom}
                    onChange={(e) => setAdvancedFilters(prev => ({
                      ...prev,
                      dateFrom: e.target.value
                    }))}
                    placeholder="開始日"
                  />
                  <Input
                    type="date"
                    value={advancedFilters.dateTo}
                    onChange={(e) => setAdvancedFilters(prev => ({
                      ...prev,
                      dateTo: e.target.value
                    }))}
                    placeholder="終了日"
                  />
                </div>
              </div>

              {/* Author */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  投稿者
                </label>
                <Input
                  value={advancedFilters.author}
                  onChange={(e) => setAdvancedFilters(prev => ({
                    ...prev,
                    author: e.target.value
                  }))}
                  placeholder="ニックネームで検索"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">カテゴリ</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!advancedFilters.category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAdvancedFilters(prev => ({
                    ...prev,
                    category: ''
                  }))}
                >
                  すべて
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={advancedFilters.category === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdvancedFilters(prev => ({
                      ...prev,
                      category: category
                    }))}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search Actions */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAdvancedSearch} className="flex-1">
                詳細検索を実行
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                クリア
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}