
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, List, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    icon: LayoutDashboard,
    label: 'Dashboard'
  },
  {
    href: '/entries',
    icon: List,
    label: 'Entries'
  },
  {
    href: '/analytics',
    icon: BarChart3,
    label: 'Analytics'
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings'
  }
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 mobile-safe-area">
      <nav className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-h-[60px] min-w-[60px]',
                isActive
                  ? 'text-blue-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
