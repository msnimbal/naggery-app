
'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  action?: React.ReactNode
}

export function PageHeader({ title, showBack = false, action }: PageHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 mobile-safe-area">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold text-gray-50">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}
