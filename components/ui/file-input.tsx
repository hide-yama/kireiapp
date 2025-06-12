'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface FileInputProps {
  id: string
  accept?: string
  multiple?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}

export function FileInput({ id, accept, multiple, onChange, className = '' }: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        className="w-full justify-center"
      >
        <Upload className="w-4 h-4 mr-2" />
        ファイルを選択
      </Button>
    </div>
  )
}