'use client'

import { DashboardHeader } from './DashboardHeader'
import { MobileNavigation } from './MobileNavigation'

interface DashboardLayoutClientProps {
  userId: string
  children: React.ReactNode
}

export function DashboardLayoutClient({ userId, children }: DashboardLayoutClientProps) {
  return (
    <div className="min-h-screen">
      <DashboardHeader userId={userId} />
      
      <main className="container mx-auto px-4 lg:px-8 py-6 lg:py-8 pb-24 md:pb-8">
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>

      <MobileNavigation userId={userId} />
    </div>
  )
}