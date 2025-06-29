
'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, List, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BottomNav } from '@/components/layout/bottom-nav'
import { PageHeader } from '@/components/layout/page-header'
import { MOOD_EMOJIS, MOOD_LABELS, Entry } from '@/lib/types'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [filters, setFilters] = useState({
    mood: 'all',
    type: 'all',
    startDate: '',
    endDate: ''
  })

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filters.mood !== 'all') params.append('mood', filters.mood)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/entries?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data.entries || [])
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [searchTerm, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      mood: 'all',
      type: 'all',
      startDate: '',
      endDate: ''
    })
    setSearchTerm('')
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <PageHeader 
        title="All Entries" 
        action={
          <Link href="/entry/new">
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </Link>
        }
      />
      
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-gray-50"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-gray-600 text-gray-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <div className="flex bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-8"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-200 mb-2 block">
                    Mood
                  </label>
                  <select
                    value={filters.mood}
                    onChange={(e) => handleFilterChange('mood', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-50 text-sm"
                  >
                    <option value="all">All Moods</option>
                    <option value="HAPPY">😊 Happy</option>
                    <option value="NEUTRAL">😐 Neutral</option>
                    <option value="ANGRY">😠 Angry</option>
                    <option value="SAD">😢 Sad</option>
                    <option value="CONFUSED">🤔 Confused</option>
                    <option value="FRUSTRATED">😤 Frustrated</option>
                    <option value="ANXIOUS">😰 Anxious</option>
                    <option value="CALM">😌 Calm</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-200 mb-2 block">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-50 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="TEXT">📝 Text</option>
                    <option value="VOICE">🎙️ Voice</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-200 mb-2 block">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-50"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-200 mb-2 block">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-50"
                  />
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-gray-600 text-gray-300"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Entries List */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            Loading entries...
          </div>
        ) : entries.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <List className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200 mb-2">No entries found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '')
                  ? 'Try adjusting your search or filters'
                  : 'Create your first entry to get started'}
              </p>
              <Link href="/entry/new">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Entry
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Link key={entry.id} href={`/entries/${entry.id}`}>
                <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {entry.type === 'VOICE' ? '🎙️' : '📝'}
                        </span>
                        <span className="text-xl">
                          {MOOD_EMOJIS[entry.mood]}
                        </span>
                        <div>
                          {entry.title && (
                            <h3 className="font-medium text-gray-200 mb-1">
                              {entry.title}
                            </h3>
                          )}
                          <p className="text-sm text-gray-400">
                            {entry.createdAt ? format(new Date(entry.createdAt), 'MMM d, yyyy • h:mm a') : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                          {MOOD_LABELS[entry.mood]}
                        </span>
                      </div>
                    </div>
                    
                    {entry.content && (
                      <p className="text-sm text-gray-300 line-clamp-2 ml-16">
                        {entry.content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
