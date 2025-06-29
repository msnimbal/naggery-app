
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/layout/bottom-nav'
import { PageHeader } from '@/components/layout/page-header'
import { AnalyticsData, MOOD_LABELS, MOOD_COLORS } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend } from 'recharts'
import { TrendingUp, Calendar, PieChart as PieChartIcon } from 'lucide-react'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <PageHeader title="Analytics" />
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-8 text-gray-400">
            Loading analytics...
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <PageHeader title="Analytics" />
        <div className="max-w-4xl mx-auto p-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">No data available</h3>
              <p className="text-gray-400">Create some entries to see your analytics.</p>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    )
  }

  // Prepare chart data
  const moodChartData = analytics.moodFrequency.map(item => ({
    mood: MOOD_LABELS[item.mood],
    count: item.count,
    fill: MOOD_COLORS[item.mood]
  }))

  const entryTypeData = analytics.entryTypeRatio.map(item => ({
    type: item.type === 'VOICE' ? 'Voice Notes' : 'Text Entries',
    count: item.count,
    fill: item.type === 'VOICE' ? '#3B82F6' : '#10B981'
  }))

  const timelineData = analytics.entriesOverTime.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    count: item.count
  }))

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <PageHeader title="Analytics" />
      
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Time Range Filter */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-200 mr-3">Time Range:</span>
              {[
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 3 months' },
                { value: '0', label: 'All time' }
              ].map(range => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange(range.value)}
                  className={
                    timeRange === range.value 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'border-gray-600 text-gray-300'
                  }
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {analytics.totalEntries}
              </div>
              <div className="text-sm text-gray-400">Total Entries</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {analytics.averageEntriesPerWeek}
              </div>
              <div className="text-sm text-gray-400">Avg per Week</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {analytics.moodFrequency.length}
              </div>
              <div className="text-sm text-gray-400">Mood Types</div>
            </CardContent>
          </Card>
        </div>

        {/* Entries Over Time */}
        {timelineData.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-50">
                <Calendar className="h-5 w-5" />
                Entries Over Time
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your documentation activity timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                    />
                    <YAxis 
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: 11
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood Distribution */}
        {moodChartData.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-50">
                <TrendingUp className="h-5 w-5" />
                Mood Distribution
              </CardTitle>
              <CardDescription className="text-gray-400">
                Frequency of different moods in your entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodChartData}>
                    <XAxis 
                      dataKey="mood" 
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                    />
                    <YAxis 
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: 11
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entry Type Distribution */}
        {entryTypeData.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-50">
                <PieChartIcon className="h-5 w-5" />
                Entry Types
              </CardTitle>
              <CardDescription className="text-gray-400">
                Distribution of voice notes vs text entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={entryTypeData}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {entryTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: 11
                      }}
                    />
                    <Legend 
                      verticalAlign="top"
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-50">Insights</CardTitle>
            <CardDescription className="text-gray-400">
              Patterns and trends in your documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.moodFrequency.length > 0 && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-200 mb-2">Most Common Mood</h4>
                <p className="text-sm text-gray-300">
                  Your most frequently documented mood is{' '}
                  <span className="font-medium text-blue-400">
                    {MOOD_LABELS[analytics.moodFrequency.sort((a, b) => b.count - a.count)[0].mood]}
                  </span>
                  {' '}with {analytics.moodFrequency.sort((a, b) => b.count - a.count)[0].count} entries.
                </p>
              </div>
            )}
            
            {analytics.averageEntriesPerWeek > 0 && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-200 mb-2">Documentation Frequency</h4>
                <p className="text-sm text-gray-300">
                  You're averaging{' '}
                  <span className="font-medium text-green-400">
                    {analytics.averageEntriesPerWeek} entries per week
                  </span>
                  , which shows consistent documentation habits.
                </p>
              </div>
            )}
            
            {analytics.entryTypeRatio.length > 1 && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-200 mb-2">Preferred Format</h4>
                <p className="text-sm text-gray-300">
                  You tend to use{' '}
                  <span className="font-medium text-purple-400">
                    {analytics.entryTypeRatio.sort((a, b) => b.count - a.count)[0].type === 'VOICE' 
                      ? 'voice notes' 
                      : 'text entries'}
                  </span>
                  {' '}more frequently for your documentation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}
