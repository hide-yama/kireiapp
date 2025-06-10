'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface InvitationCodeProps {
  code: string
  size?: 'sm' | 'md' | 'lg'
}

export function InvitationCode({ code, size = 'md' }: InvitationCodeProps) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-lg px-3 py-2',
    lg: 'text-xl px-4 py-3'
  }

  const buttonSizeClasses = {
    sm: 'size-sm',
    md: 'size-sm',
    lg: 'size-default'
  }

  return (
    <div className="flex items-center gap-2">
      <code className={`bg-gray-100 rounded font-mono flex-1 text-center ${sizeClasses[size]}`}>
        {code}
      </code>
      <Button
        variant="outline"
        size={buttonSizeClasses[size]}
        onClick={copyCode}
        className="flex items-center gap-1"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'コピー済み' : 'コピー'}
      </Button>
    </div>
  )
}