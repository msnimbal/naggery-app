
'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Plus, Mic, FileText, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BottomNav } from '@/components/layout/bottom-nav'
import { PageHeader } from '@/components/layout/page-header'
import { MOOD_EMOJIS, MOOD_LABELS, Entry } from '@/lib/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [recentEntries, setRecentEntries] = useState<Entry[]>([])
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentEntries = async () => {
      try {
        const response = await fetch('/api/entries?limit=5')
        if (response.ok) {
          const data = await response.json()
          setRecentEntries(data.entries || [])
        }
      } catch (error) {
        console.error('Failed to fetch recent entries:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchRecentEntries()
    }
  }, [session])

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <PageHeader title="Dashboard" />
      
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-6">
          <h2 className="text-2xl font-bold text-gray-50 mb-2">
            Welcome back, {session?.user?.name || 'User'}
          </h2>
          <p className="text-gray-400">
            Your private, personal record keeper
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {recentEntries.length}
              </div>
              <div className="text-sm text-gray-400">Recent Entries</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {recentEntries.filter(e => e.createdAt && new Date(e.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-gray-400">This Week</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-50">
              <Clock className="h-5 w-5" />
              Recent Entries
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your latest documented experiences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Loading recent entries...
              </div>
            ) : recentEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No entries yet.</p>
                <p className="text-xs">Create your first entry to get started.</p>
              </div>
            ) : (
              recentEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/entries/${entry.id}`}
                  className="block"
                >
                  <div className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {entry.type === 'VOICE' ? '🎙️' : '📝'}
                        </span>
                        <span className="text-lg">
                          {MOOD_EMOJIS[entry.mood]}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {entry.createdAt ? formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    
                    {entry.title && (
                      <h4 className="font-medium text-gray-200 mb-1">
                        {entry.title}
                      </h4>
                    )}
                    
                    {entry.content && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {entry.content}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs px-2 py-1 bg-gray-600 rounded text-gray-300">
                        {MOOD_LABELS[entry.mood]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {entry.type === 'VOICE' ? 'Voice Note' : 'Text Entry'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* View All Entries Link */}
        {recentEntries.length > 0 && (
          <div className="text-center">
            <Link href="/entries">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                View All Entries
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-40">
        {showCreateMenu && (
          <div className="absolute bottom-16 right-0 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-2 space-y-2 min-w-[140px]">
            <Link href="/entry/new?type=voice">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-200 hover:bg-gray-700"
                onClick={() => setShowCreateMenu(false)}
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice Note
              </Button>
            </Link>
            <Link href="/entry/new?type=text">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-200 hover:bg-gray-700"
                onClick={() => setShowCreateMenu(false)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Text Entry
              </Button>
            </Link>
          </div>
        )}
        
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          onClick={() => setShowCreateMenu(!showCreateMenu)}
        >
          <Plus className={`h-6 w-6 transition-transform ${showCreateMenu ? 'rotate-45' : ''}`} />
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}
