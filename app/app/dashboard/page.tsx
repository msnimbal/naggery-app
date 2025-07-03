
'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Mic, TrendingUp, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface DashboardStats {
  totalEntries: number
  totalRecordings: number
  weeklyEntries: number
  weeklyRecordings: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    totalRecordings: 0,
    weeklyEntries: 0,
    weeklyRecordings: 0,
  })
  const [recentEntries, setRecentEntries] = useState([])
  const [recentRecordings, setRecentRecordings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, entriesRes, recordingsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/journal/recent'),
          fetch('/api/voice-notes/recent')
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (entriesRes.ok) {
          const entriesData = await entriesRes.json()
          setRecentEntries(entriesData)
        }

        if (recordingsRes.ok) {
          const recordingsData = await recordingsRes.json()
          setRecentRecordings(recordingsData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatName = (name: string | null | undefined) => {
    if (!name) return "Welcome back"
    return name.split(' ')[0] // Get first name only
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            {formatName(session?.user?.name)}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your personal wellbeing overview
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button asChild className="flex items-center justify-center h-12">
            <Link href="/journal">
              <Plus className="mr-2 h-5 w-5" />
              New Journal Entry
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex items-center justify-center h-12">
            <Link href="/voice-notes">
              <Mic className="mr-2 h-5 w-5" />
              Record Voice Note
            </Link>
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-2xl font-bold text-foreground"
              >
                {stats.totalEntries}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                +{stats.weeklyEntries} this week
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voice Notes</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-2xl font-bold text-foreground"
              >
                {stats.totalRecordings}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                +{stats.weeklyRecordings} this week
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="text-2xl font-bold text-foreground"
              >
                {stats.weeklyEntries + stats.weeklyRecordings}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                Total this week
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Active</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-2xl font-bold text-foreground"
              >
                7
              </motion.div>
              <p className="text-xs text-muted-foreground">
                Out of 7 days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Recent Journal Entries
                </CardTitle>
                <CardDescription>
                  Your latest reflections and thoughts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentEntries.length > 0 ? (
                  <div className="space-y-4">
                    {recentEntries.slice(0, 3).map((entry: any) => (
                      <div key={entry.id} className="border-l-2 border-primary/20 pl-4">
                        <h4 className="font-medium text-foreground">{entry.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No journal entries yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/journal">Write your first entry</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="mr-2 h-5 w-5" />
                  Recent Voice Notes
                </CardTitle>
                <CardDescription>
                  Your latest audio reflections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentRecordings.length > 0 ? (
                  <div className="space-y-4">
                    {recentRecordings.slice(0, 3).map((recording: any) => (
                      <div key={recording.id} className="border-l-2 border-primary/20 pl-4">
                        <h4 className="font-medium text-foreground">
                          {recording.title || 'Voice Note'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(recording.createdAt).toLocaleDateString()} • 
                          {recording.duration ? ` ${Math.floor(recording.duration / 60)}:${String(recording.duration % 60).padStart(2, '0')}` : ' Unknown duration'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mic className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No voice notes yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/voice-notes">Record your first note</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
