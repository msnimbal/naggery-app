
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30'
    
    const daysAgo = parseInt(range)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    const where = {
      userId: session.user.id,
      createdAt: daysAgo > 0 ? { gte: startDate } : undefined
    }

    // Mood frequency
    const moodCounts = await prisma.entry.groupBy({
      by: ['mood'],
      where,
      _count: { mood: true }
    })

    const moodFrequency = moodCounts.map(item => ({
      mood: item.mood,
      count: item._count.mood
    }))

    // Entry type ratio
    const typeCounts = await prisma.entry.groupBy({
      by: ['type'],
      where,
      _count: { type: true }
    })

    const entryTypeRatio = typeCounts.map(item => ({
      type: item.type,
      count: item._count.type
    }))

    // Entries over time (daily for last 30 days, weekly for longer periods)
    const isDaily = daysAgo <= 30
    const timeInterval = isDaily ? 1 : 7
    const timePoints = []
    
    for (let i = daysAgo; i >= 0; i -= timeInterval) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      timePoints.push(date)
    }

    const entriesOverTime = await Promise.all(
      timePoints.map(async (date) => {
        const startOfPeriod = new Date(date)
        const endOfPeriod = new Date(date)
        
        if (isDaily) {
          startOfPeriod.setHours(0, 0, 0, 0)
          endOfPeriod.setHours(23, 59, 59, 999)
        } else {
          endOfPeriod.setDate(endOfPeriod.getDate() + 6)
        }

        const count = await prisma.entry.count({
          where: {
            userId: session.user.id,
            createdAt: {
              gte: startOfPeriod,
              lte: endOfPeriod
            }
          }
        })

        return {
          date: date.toISOString().split('T')[0],
          count
        }
      })
    )

    // Total entries
    const totalEntries = await prisma.entry.count({
      where: { userId: session.user.id }
    })

    // Average entries per week (last 4 weeks)
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    
    const recentEntries = await prisma.entry.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: fourWeeksAgo }
      }
    })

    const averageEntriesPerWeek = Math.round(recentEntries / 4)

    return NextResponse.json({
      moodFrequency,
      entriesOverTime,
      entryTypeRatio,
      totalEntries,
      averageEntriesPerWeek
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
